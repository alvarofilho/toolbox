import 'reflect-metadata';

import { fromBER } from 'asn1js';

import { CertBag, Certificate, ContentInfo, PFX, SafeContents } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { file, firstFile } from '@app/features/tools/_shared/files';

import { field } from '@app/core/models/tool';

import { utf8 } from '@app/features/tools/_shared/bytes';

import { X509Certificate } from '@peculiar/x509';

import { certInfo } from '@app/features/tools/security/certificates';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export const definition = tool(
	'p12-explorer',
	[file(), input('password', 'tools.p12-explorer.p12_file_password', '', 'password')],
	async (v, files) => {
		const selected = firstFile(files);
		if (selected.size > 20_000_000) {
			throw new Error('Limite: 20 MB / Limit: 20 MB');
		}
		const bytes = new Uint8Array(await selected.arrayBuffer());
		const parsed = fromBER(bytes.buffer);
		if (parsed.offset === -1 || parsed.offset !== bytes.length) {
			throw new Error('Arquivo PKCS#12 inválido / Invalid PKCS#12 file');
		}
		const pfx = new PFX({ schema: parsed.result });
		const password = utf8(field(v, 'password')).buffer;
		await pfx.parseInternalValues({ password, checkIntegrity: true });
		const authenticatedSafe = pfx.parsedValue?.authenticatedSafe;
		let safeContentsParsed = false;
		const certificates: ReturnType<typeof certInfo>[] = [];
		let privateKeyBagCount = 0;
		if (authenticatedSafe) {
			await authenticatedSafe.parseInternalValues({
				safeContents: authenticatedSafe.safeContents.map((content) =>
					content.contentType === ContentInfo.ENCRYPTED_DATA ? { password } : {},
				),
			});
			const parsedSafe: unknown = authenticatedSafe.parsedValue;
			const parsedContents = isRecord(parsedSafe) ? parsedSafe['safeContents'] : undefined;
			if (Array.isArray(parsedContents)) {
				safeContentsParsed = true;
				for (const parsedContent of parsedContents) {
					if (!isRecord(parsedContent) || !(parsedContent['value'] instanceof SafeContents)) {
						continue;
					}
					for (const bag of parsedContent['value'].safeBags) {
						if (
							bag.bagId === '1.2.840.113549.1.12.10.1.1' ||
							bag.bagId === '1.2.840.113549.1.12.10.1.2'
						) {
							privateKeyBagCount++;
						}
						if (
							bag.bagValue instanceof CertBag &&
							bag.bagValue.parsedValue instanceof Certificate
						) {
							const cert = new X509Certificate(bag.bagValue.parsedValue.toSchema().toBER(false));
							certificates.push(certInfo(cert));
						}
					}
				}
			}
		}
		return result({
			filename: selected.name,
			version: pfx.version,
			authSafeContentType: pfx.authSafe.contentType,
			hasMac: !!pfx.macData,
			integrityVerified: true,
			integrityMethod:
				pfx.authSafe.contentType === ContentInfo.SIGNED_DATA ? 'cms_signature' : 'password_mac',
			authenticatedSafeParsed: !!authenticatedSafe,
			safeContentsParsed,
			certificateCount: certificates.length,
			certificates,
			privateKeyBagCount,
			privateKeyMaterialExposed: false,
		});
	},
	undefined,
	'tools.p12-explorer.the_password_is_used_locally_to_open_and_c',
);
