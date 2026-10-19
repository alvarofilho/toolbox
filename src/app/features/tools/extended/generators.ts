import { faker } from '@faker-js/faker/locale/pt_BR';
import { ulid } from 'ulid';
import QRCode from 'qrcode';
import Papa from 'papaparse';
import { generateDocument } from '@app/shared/utils/documents';
import { uuid, randomInt } from '@app/shared/utils/random';
import { synthetic } from '@app/features/tools/controls';
import {
	tool,
	input,
	select,
	number,
	source,
	count,
	field,
	boundedNumber,
	result,
	json,
	object,
	preview,
} from '@app/features/tools/extended/common';
import { sqlInsert } from '@app/features/tools/extended/data-utils';

const format = select('format', 'Formato', 'Format', [
	['json', 'JSON', 'JSON'],
	['csv', 'CSV', 'CSV'],
	['sql', 'SQL INSERT', 'SQL INSERT'],
]);
const state = select(
	'state',
	'UF',
	'State',
	'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'
		.split(' ')
		.map((s) => [s, s, s]),
	'SP',
);
const ddd = input('ddd', 'DDD', 'Area code', '11', 'text');
function records(
	id: string,
	factory: (v: Readonly<Record<string, string>>, i: number) => Record<string, unknown>,
	extras = [] as ReturnType<typeof input>[],
) {
	return tool(
		id,
		[count, format, ...extras],
		(v) => {
			const rows = Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, (_, i) => ({
				synthetic: true,
				...factory(v, i),
			}));
			const f = field(v, 'format');
			return result(
				f === 'csv'
					? Papa.unparse(rows, { escapeFormulae: true })
					: f === 'sql'
						? sqlInsert(rows, 'synthetic_data')
						: rows,
				`synthetic-${id}.${f}`,
			);
		},
		undefined,
		synthetic,
	);
}
export const definitions = [
	records('company', () => ({
		name: `${faker.company.name()} TESTE`,
		cnpj: generateDocument('cnpj'),
		email: faker.internet.email({ provider: 'example.com' }),
		website: 'https://example.com',
	})),
	records(
		'address',
		(v) => ({
			street: faker.location.street(),
			number: String(randomInt(999) + 1),
			district: 'Bairro Sintético',
			city: faker.location.city(),
			state: field(v, 'state'),
			postalCode: `${String(randomInt(100000)).padStart(5, '0')}-${String(randomInt(1000)).padStart(3, '0')}`,
			country: 'BR',
		}),
		[state],
	),
	records('email', (_, i) => ({ email: `teste.${i + 1}.${randomInt(1000000)}@example.com` })),
	records(
		'phone',
		(v) => {
			if (!/^[1-9]\d$/.test(field(v, 'ddd'))) {
				throw new Error('DDD: 2 dígitos / 2 digits');
			}
			return { phone: `(${field(v, 'ddd')}) 9${String(randomInt(100000000)).padStart(8, '0')}` };
		},
		[ddd],
	),
	tool('ulid', [count], (v) =>
		result(
			Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () => ulid()).join('\n'),
			'ulids.txt',
		),
	),
	tool('guid', [count], (v) =>
		result(
			Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () => uuid('4')).join('\n'),
			'guids.txt',
		),
	),
	records(
		'random-date',
		(v) => {
			const min = Date.parse(field(v, 'start')),
				max = Date.parse(field(v, 'end'));
			if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
				throw new Error('Intervalo de datas inválido / Invalid date range');
			}
			const n = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
			return { date: new Date(min + Math.floor(n * (max - min + 1))).toISOString() };
		},
		[
			input('start', 'Início ISO 8601', 'ISO start', '2020-01-01T00:00:00Z', 'text'),
			input('end', 'Fim ISO 8601', 'ISO end', '2030-01-01T00:00:00Z', 'text'),
		],
	),
	tool('lorem', [number('count', 'Parágrafos', 'Paragraphs', 3, 1, 100)], (v) =>
		result(faker.lorem.paragraphs(boundedNumber(field(v, 'count'), 1, 100), '\n\n'), 'lorem.txt'),
	),
	tool(
		'qr',
		[
			source,
			number('size', 'Tamanho (px)', 'Size (px)', 256, 64, 1024),
			select(
				'level',
				'Correção de erros',
				'Error correction',
				[
					['L', 'L', 'L'],
					['M', 'M', 'M'],
					['Q', 'Q', 'Q'],
					['H', 'H', 'H'],
				],
				'M',
			),
		],
		async (v) => {
			if (!field(v, 'input').trim() || field(v, 'input').length > 2000) {
				throw new Error('Use 1–2.000 caracteres / characters');
			}
			const level = field(v, 'level');
			if (level !== 'L' && level !== 'M' && level !== 'Q' && level !== 'H') {
				throw new Error('Invalid correction level');
			}
			const svg = await QRCode.toString(field(v, 'input'), {
				type: 'svg',
				width: boundedNumber(field(v, 'size'), 64, 1024),
				errorCorrectionLevel: level,
			});
			return {
				...result(svg, 'qrcode.svg'),
				mime: 'image/svg+xml',
				preview: preview(svg),
				artifacts: [{ blob: new Blob([svg], { type: 'image/svg+xml' }), filename: 'qrcode.svg' }],
			};
		},
		{ input: 'https://example.com' },
	),
	tool(
		'data-generator',
		[input('input', 'Campos e tipos (JSON)', 'Fields and types (JSON)'), count, format],
		(v) => {
			const fields = object(json(field(v, 'input')));
			if (Object.keys(fields).length > 50) {
				throw new Error('Máximo 50 campos / Maximum 50 fields');
			}
			const make = (type: unknown): unknown => {
				switch (type) {
					case 'uuid':
						return uuid('4');
					case 'name':
						return faker.person.fullName();
					case 'email':
						return faker.internet.email({ provider: 'example.com' });
					case 'integer':
						return randomInt(10000);
					case 'boolean':
						return !!randomInt(2);
					case 'date':
						return faker.date.between({ from: '2020-01-01', to: '2030-01-01' }).toISOString();
					case 'cpf':
						return generateDocument('cpf');
					case 'cnpj':
						return generateDocument('cnpj');
					case 'string':
						return faker.word.noun();
					default:
						throw new Error(`Tipo não suportado / Unsupported type: ${String(type)}`);
				}
			};
			const rows = Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () => ({
				...Object.fromEntries(Object.entries(fields).map(([k, t]) => [k, make(t)])),
				synthetic: true,
			}));
			return result(
				field(v, 'format') === 'csv'
					? Papa.unparse(rows, { escapeFormulae: true })
					: field(v, 'format') === 'sql'
						? sqlInsert(rows, 'synthetic_data')
						: rows,
				`synthetic-data.${field(v, 'format')}`,
			);
		},
		{ input: '{"id":"uuid","name":"name","email":"email","age":"integer"}' },
		synthetic,
	),
];
