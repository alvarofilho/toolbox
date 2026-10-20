import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
	X509CertificateGenerator,
	X509CrlGenerator,
	Pkcs10CertificateRequestGenerator,
} from '@peculiar/x509';
import { TOOLS } from '@app/features/tools/catalog/tools';
import type { ToolFiles, ToolValues } from '@app/core/models/tool';
import { sqlInsert } from '@app/features/tools/json/data-utils';
import { generateTypes } from '@app/features/tools/json/type-generation';
import { subnet } from '@app/features/tools/infrastructure/subnet';
import { dockerCompose } from '@app/features/tools/infrastructure/docker-compose.tool';
import { parseEnv } from '@app/features/tools/infrastructure/parse-env';
import { clampCss } from '@app/features/tools/frontend/clamp.tool';

async function loadDefinition(id: string) {
	const tool = TOOLS.find((tool) => tool.id === id);
	if (!tool) {
		throw new Error(`Unknown tool: ${id}`);
	}
	return tool.loadDefinition();
}

async function run(id: string, values: ToolValues = {}, files?: ToolFiles) {
	const definition = await loadDefinition(id);
	return definition.run(
		{ ...Object.fromEntries(definition.controls.map((c) => [c.key, c.value])), ...values },
		files,
	);
}
describe('tool definitions', () => {
	it.each(TOOLS.map((t) => [t.id]))(
		'%s has valid controls and executes its published example',
		async (id) => {
			const definition = await loadDefinition(id);
			expect(new Set(definition.controls.map((c) => c.key)).size).toBe(definition.controls.length);
			// Sanitizer previews need a real DOM and regex needs a browser Worker.
			if (definition.example && !['svg-optimizer', 'html-editor', 'regex'].includes(id)) {
				const output = await run(id, definition.example);
				expect(output.output.length).toBeGreaterThan(0);
				expect(output.output).not.toContain('[object Object]');
			}
		},
	);
});
describe('data transformations and boundaries', () => {
	it('round-trips CSV with quoted commas, newlines and Unicode', async () => {
		const input = [{ name: 'Ana, "A"', text: 'ação\nsegunda linha' }];
		const csv = await run('json-csv', { input: JSON.stringify(input) });
		expect(JSON.parse((await run('csv-json', { input: csv.output })).output)).toEqual(input);
	});
	it('escapes CSV formulas and SQL literals and identifiers', async () => {
		expect((await run('json-csv', { input: '[{"cell":"=1+1"}]' })).output).toContain("'=1+1");
		expect(sqlInsert([{ name: "O'Connor", active: true, empty: null }], 'a"b')).toBe(
			'INSERT INTO "a""b" ("name", "active", "empty") VALUES (\'O\'\'Connor\', TRUE, NULL);',
		);
	});
	it('evaluates JSONPath filters and rejects executable expressions', async () => {
		expect(
			JSON.parse(
				(
					await run('jsonpath', {
						input: '{"items":[{"age":18},{"age":25}]}',
						path: '$.items[?(@.age > 20)].age',
					})
				).output,
			),
		).toEqual([25]);
		await expect(
			run('jsonpath', { input: '[1]', path: '$[?(globalThis.process.exit())]' }),
		).rejects.toThrow();
	});
	it('reports schema errors and produces data satisfying constraints', async () => {
		const schema =
			'{"type":"object","properties":{"age":{"type":"integer","minimum":18}},"required":["age"],"additionalProperties":false}';
		expect(
			JSON.parse((await run('json-schema', { input: '{"age":10}', schema })).output).valid,
		).toBe(false);
		const fake = JSON.parse((await run('schema-faker', { input: schema })).output);
		expect(fake.synthetic).toBe(true);
		expect(
			JSON.parse((await run('json-schema', { input: JSON.stringify(fake.data), schema })).output)
				.valid,
		).toBe(true);
	});
	it('generates valid distinct names for root arrays and repeated/nested objects', () => {
		const ts = generateTypes([{ name: 'Ana' }, { name: 'Bruno' }], 'ts');
		expect(ts).toContain('export type Root = (RootItem)[]');
		expect(ts.match(/export interface RootItem/g)).toHaveLength(1);
		expect(ts).not.toContain('export interface Root {');
		const cs = generateTypes({ 'a-b': 1, a_b: 2, root: 3 }, 'class');
		expect(cs).toContain('RootValue');
	});
	it('rejects invalid dates and preserves large numeric values and ticks', async () => {
		await expect(run('date', { input: '31/02/2026', from: 'br' })).rejects.toThrow();
		const big = '123456789012345678901234567890';
		expect(
			JSON.parse((await run('base-converter', { input: big, from: '10' })).output).decimal,
		).toBe(big);
		for (const ticks of ['0', '621355967999999999', '621355968000000001', '3155378975999999999']) {
			const iso = JSON.parse((await run('dotnet-ticks', { input: ticks })).output).utc;
			expect(
				JSON.parse((await run('dotnet-ticks', { input: iso, mode: 'iso-to-ticks' })).output).ticks,
			).toBe(ticks);
		}
	});
	it('handles DST and rejects ambiguous local times', async () => {
		const r = JSON.parse(
			(
				await run('timezone', {
					input: '2026-01-01T12:00:00',
					from: 'America/Sao_Paulo',
					to: 'Europe/Lisbon',
				})
			).output,
		);
		expect(r.utc).toBe('2026-01-01T15:00:00Z');
		await expect(
			run('timezone', { input: '2026-11-01T01:30:00', from: 'America/New_York', to: 'UTC' }),
		).rejects.toThrow();
	});
	it('rejects malformed XML, YAML duplicates and mismatched CSV rows', async () => {
		await expect(run('xml-validator', { input: '<a><b></a>' })).rejects.toThrow();
		await expect(
			run('xml-formatter', { input: '<!DOCTYPE a [<!ENTITY x "test">]><a>&x;</a>' }),
		).rejects.toThrow();
		await expect(run('yaml-formatter', { input: 'x: 1\nx: 2' })).rejects.toThrow();
		await expect(run('csv-json', { input: 'a,b\n1,2,3' })).rejects.toThrow();
	});
	it('generates independent data and marks every record synthetic', async () => {
		for (const id of ['company', 'address', 'email', 'phone', 'random-date', 'data-generator']) {
			const definition = await loadDefinition(id);
			const r = JSON.parse((await run(id, { ...definition.example, count: '3' })).output);
			expect(r).toHaveLength(3);
			expect(r.every((p: { synthetic: boolean }) => p.synthetic)).toBe(true);
		}
		await expect(run('email', { count: '1001' })).rejects.toThrow();
	});
	it('generates synthetic records for Cape Verde and the United States', async () => {
		for (const [country, kind, phonePrefix, documentType] of [
			['CV', 'person', '+238', 'NIF (formato sintético)'],
			['CV', 'company', '+238', 'NIF (formato sintético)'],
			['US', 'person', '+1', 'SSN (formato sintético)'],
			['US', 'company', '+1', 'EIN (formato sintético)'],
		] as const) {
			const records = JSON.parse(
				(
					await run('mercosur-data', {
						country,
						kind,
						format: 'json',
						count: '1',
					})
				).output,
			) as {
				synthetic: boolean;
				countryCode: string;
				documentType: string;
				documentValidation: string;
				phone: string;
				address: { postalCode: string };
			}[];
			expect(records).toHaveLength(1);
			expect(records[0]).toMatchObject({
				synthetic: true,
				countryCode: country,
				documentType,
				documentValidation: 'format-only',
			});
			expect(records[0].phone.startsWith(phonePrefix)).toBe(true);
			expect(records[0].address.postalCode.length).toBeGreaterThan(0);
		}
	});
});
describe('cryptography and certificates', () => {
	it('matches the RFC 4231 HMAC SHA-256 vector', async () => {
		expect(
			(await run('hmac', { input: 'what do ya want for nothing?', secret: 'Jefe' })).output,
		).toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
	});
	it('round-trips AES, randomizes envelopes and rejects tampering/wrong passwords', async () => {
		const values = { input: 'ação 🔒', secret: 'a-test-password-1234' };
		const a = await run('aes', values),
			b = await run('aes', values);
		expect(a.output).not.toBe(b.output);
		expect(
			(await run('aes', { input: a.output, secret: values.secret, mode: 'decrypt' })).output,
		).toBe(values.input);
		await expect(
			run('aes', { input: a.output, secret: 'another-password-1234', mode: 'decrypt' }),
		).rejects.toThrow();
		const envelope = JSON.parse(a.output);
		envelope.ciphertext = 'AAAA' + envelope.ciphertext.slice(4);
		await expect(
			run('aes', { input: JSON.stringify(envelope), secret: values.secret, mode: 'decrypt' }),
		).rejects.toThrow();
	});
	it('hashes original file bytes and produces SRI', async () => {
		const file = new File(['abc'], 'abc.txt', { type: 'text/plain' });
		const hash = JSON.parse((await run('file-hash', {}, { files: [file] })).output);
		expect(hash.hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
		expect((await run('sri', {}, { files: [file] })).output).toBe(
			'sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=',
		);
		await expect(run('file-hash')).rejects.toThrow();
	});
	it('decodes certificates and CSRs, exports JWKs and verifies supplied chain signatures', async () => {
		const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);
		const cert = await X509CertificateGenerator.createSelfSigned({
			name: 'CN=Toolbox Test',
			serialNumber: '01',
			notBefore: new Date('2020-01-01'),
			notAfter: new Date('2030-01-01'),
			signingAlgorithm: { name: 'ECDSA', hash: 'SHA-256' },
			keys,
		});
		const pem = cert.toString('pem');
		expect(JSON.parse((await run('pem', { input: pem })).output)[0].label).toBe('CERTIFICATE');
		const certificate = JSON.parse((await run('x509', { input: pem })).output);
		expect(certificate.subject).toContain('Toolbox Test');
		expect(certificate.signatureVerification).toBe('not_checked');
		expect(certificate.isCertificateAuthority).toBeNull();
		expect(JSON.parse((await run('pem-jwk', { input: pem })).output).kty).toBe('EC');
		const chain = JSON.parse((await run('certificate-chain', { input: pem })).output);
		expect(chain.certificates[0].signatureVerified).toBe(true);
		expect(chain.certificates[0].issuerCertificateInInput).toBe(true);
		expect(chain.trustEstablished).toBe(false);
		const csr = await Pkcs10CertificateRequestGenerator.create({
			name: 'CN=Toolbox Test',
			keys,
			signingAlgorithm: { name: 'ECDSA', hash: 'SHA-256' },
		});
		expect(
			JSON.parse((await run('csr', { input: csr.toString('pem') })).output).signatureVerified,
		).toBe(true);
	});
	it('checks a certificate against a signed CRL without claiming live revocation status', async () => {
		const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);
		const cert = await X509CertificateGenerator.createSelfSigned({
			name: 'CN=CRL Test',
			serialNumber: '42',
			notBefore: new Date('2020-01-01'),
			notAfter: new Date('2030-01-01'),
			signingAlgorithm: { name: 'ECDSA', hash: 'SHA-256' },
			keys,
		});
		const crl = await X509CrlGenerator.create({
			issuer: cert.subject,
			signingKey: keys.privateKey,
			signingAlgorithm: { name: 'ECDSA', hash: 'SHA-256' },
			thisUpdate: new Date('2026-01-01'),
			nextUpdate: new Date('2027-01-01'),
			entries: [{ serialNumber: cert.serialNumber }],
		});
		const report = JSON.parse(
			(
				await run('crl-explorer', {
					crl: crl.toString(),
					certificate: cert.toString('pem'),
					issuer: cert.toString('pem'),
				})
			).output,
		);
		expect(report.revocationStatus).toBe('revoked');
		expect(report.signatureVerified).toBe(true);
		expect(report.revocationCheckedAgainstCurrentAuthority).toBe(false);
	});
});
describe('network, Brazilian and file formats', () => {
	it('validates nested Kubernetes fields against bundled strict schemas and rejects unsupported CRDs', async () => {
		const valid =
			'apiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n    - name: web\n      image: nginx';
		expect(JSON.parse((await run('kubernetes', { input: valid })).output).valid).toBe(true);
		expect(
			JSON.parse(
				(await run('kubernetes', { input: valid.replace('image: nginx', 'image: 123') })).output,
			).valid,
		).toBe(false);
		expect(
			JSON.parse((await run('kubernetes', { input: valid + '\n  madeUpField: true' })).output)
				.valid,
		).toBe(false);
		await expect(
			run('kubernetes', { input: 'apiVersion: custom/v1\nkind: Widget\nmetadata:\n  name: demo' }),
		).rejects.toThrow('schema');
	});
	it('calculates IPv4 /0, /31 and /32 and IPv6 /64 correctly', () => {
		expect(subnet('0.0.0.0/0')['totalAddresses']).toBe('4294967296');
		expect(subnet('192.0.2.0/31')['usableHosts']).toBe('2');
		expect(subnet('192.0.2.3/32')['firstHost']).toBe('192.0.2.3');
		expect(subnet('2001:db8::1/64')['network']).toBe('2001:db8::');
		expect(() => subnet('999.0.0.1/24')).toThrow();
	});
	it('preserves Docker environment values and detects unsupported flags', () => {
		expect(
			JSON.stringify(dockerCompose('docker run --name api -e "TOKEN=a b" -p 80:80 nginx')),
		).toContain('TOKEN=a b');
		expect(() => dockerCompose('docker run --made-up x nginx')).toThrow();
		expect(() => dockerCompose('docker run nginx; echo bad')).toThrow();
		expect(parseEnv('A=one\nA=two\nURL=${MISSING}').duplicates).toEqual(['A']);
		expect(() => parseEnv('INVALID LINE')).toThrow();
	});
	it('validates/generated NF-e and checks PIX CRC, boleto conversion and Brazilian validators', async () => {
		const generated = JSON.parse((await run('nfe', { mode: 'generate' })).output);
		expect(generated.synthetic).toBe(true);
		expect(generated.validation.ok).toBe(true);
		const pix = JSON.parse((await run('pix', { mode: 'generate' })).output);
		expect(JSON.parse((await run('pix', { input: pix.payload })).output).ok).toBe(true);
		expect(
			JSON.parse((await run('pix', { input: pix.payload.slice(0, -1) + '0' })).output).ok,
		).toBe(false);
		const definition = await loadDefinition('boleto');
		const barcode = JSON.parse(
			(await run('boleto', { ...definition.example, mode: 'barcode' })).output,
		);
		expect(barcode.ok).toBe(true);
		for (const id of ['pis', 'cnh', 'voter', 'ie']) {
			const definition = await loadDefinition(id);
			expect(JSON.parse((await run(id, definition.example)).output).ok).toBe(true);
			expect(JSON.parse((await run(id, { input: '00000000000' })).output).ok).toBe(false);
		}
	});
	it('merges, extracts and splits actual PDF pages and reads metadata', async () => {
		const doc = await PDFDocument.create();
		doc.addPage([200, 300]);
		doc.addPage([400, 500]);
		doc.setTitle('Toolbox Test');
		const file = new File([new Uint8Array(await doc.save()).buffer], 'test.pdf', {
			type: 'application/pdf',
		});
		expect(JSON.parse((await run('pdf-metadata', {}, { files: [file] })).output).title).toBe(
			'Toolbox Test',
		);
		const merge = await run('pdf-pages', { mode: 'merge' }, { files: [file, file] });
		const merged = merge.artifacts?.[0];
		if (!merged) {
			throw new Error('PDF output missing');
		}
		expect((await PDFDocument.load(await merged.blob.arrayBuffer())).getPageCount()).toBe(4);
		const extract = await run('pdf-pages', { mode: 'extract', pages: '2' }, { files: [file] });
		const output = extract.artifacts?.[0];
		if (!output) {
			throw new Error('PDF missing');
		}
		expect((await PDFDocument.load(await output.blob.arrayBuffer())).getPageCount()).toBe(1);
		const split = await run('pdf-pages', { mode: 'split' }, { files: [file] });
		const archive = split.artifacts?.[0];
		if (!archive) {
			throw new Error('ZIP missing');
		}
		expect(
			Object.keys((await JSZip.loadAsync(await archive.blob.arrayBuffer())).files),
		).toHaveLength(2);
		await expect(
			run('pdf-pages', { mode: 'extract', pages: '99' }, { files: [file] }),
		).rejects.toThrow();
		expect(JSON.parse((await run('file-signature', {}, { files: [file] })).output).detected).toBe(
			'PDF',
		);
	});
	it('creates, fills, annotates and strips metadata from PDF forms and files', async () => {
		const source = await PDFDocument.create();
		source.addPage([200, 300]);
		source.setAuthor('Private author');
		const original = new File([new Uint8Array(await source.save())], 'source.pdf', {
			type: 'application/pdf',
		});
		const created = await run(
			'pdf-forms',
			{
				mode: 'create',
				data: '[{"name":"name","type":"text"},{"name":"accepted","type":"checkbox"}]',
			},
			{ files: [original] },
		);
		const formFile = created.artifacts?.[0];
		if (!formFile) {
			throw new Error('Form PDF missing');
		}
		const form = new File([await formFile.blob.arrayBuffer()], 'form.pdf', {
			type: 'application/pdf',
		});
		expect(
			JSON.parse((await run('pdf-forms', { mode: 'inspect' }, { files: [form] })).output),
		).toHaveLength(2);
		const filled = await run(
			'pdf-forms',
			{ mode: 'fill', data: '{"name":"Ada","accepted":true}' },
			{ files: [form] },
		);
		const filledPdf = filled.artifacts?.[0];
		if (!filledPdf) {
			throw new Error('Filled PDF missing');
		}
		expect(
			(await PDFDocument.load(await filledPdf.blob.arrayBuffer())).getForm().getFields(),
		).toHaveLength(0);
		const overlay = await run(
			'pdf-overlay',
			{ mode: 'number', text: 'CONFIDENTIAL' },
			{ files: [original] },
		);
		expect(overlay.artifacts?.[0]?.filename).toBe('annotated.pdf');
		const stripped = await run('pdf-inspector', { mode: 'strip' }, { files: [original] });
		const strippedFile = stripped.artifacts?.[0];
		if (!strippedFile) {
			throw new Error('Stripped PDF missing');
		}
		expect(
			(await PDFDocument.load(await strippedFile.blob.arrayBuffer())).getAuthor(),
		).toBeUndefined();
	});
	it('checks contrast against known black/white ratio and generates fluid CSS', async () => {
		const contrast = JSON.parse(
			(await run('contrast', { foreground: '#000', background: '#fff' })).output,
		);
		expect(contrast.ratio).toBe(21);
		expect(contrast.AAA.normalText).toBe(true);
		expect(clampCss(16, 32, 320, 1440)).toContain('clamp(16px');
		expect(() => clampCss(16, 32, 500, 300)).toThrow();
	});
});
