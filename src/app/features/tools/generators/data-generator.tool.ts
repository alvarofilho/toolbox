import Papa from 'papaparse';
import { faker } from '@faker-js/faker/locale/pt_BR';

import { generateDocument } from '@app/features/tools/brazilian/documents';

import { uuid, randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { count } from '@app/features/tools/_shared/execution-controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { json, object } from '@app/features/tools/_shared/data';

import { sqlInsert } from '@app/features/tools/json/data-utils';

import { format } from '@app/features/tools/generators/record-generation';
import { randomSource, SYNTHETIC_SEED_VERSION } from '@app/features/tools/_shared/seeded-random';
import { input } from '@app/features/tools/_shared/controls';

export const definition = tool(
	'data-generator',
	[
		input('input', 'tools.data-generator.fields_and_types_json', undefined, undefined),
		count,
		format,
		input('seed', 'tools.data-generator.seed', '', 'text'),
	],
	(v) => {
		const fields = object(json(field(v, 'input')));
		const seed = field(v, 'seed');
		const random = randomSource(seed);
		if (Object.keys(fields).length > 50) {
			throw new Error('Máximo 50 campos / Maximum 50 fields');
		}
		const make = (type: unknown): unknown => {
			if (!seed) {
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
				}
			}
			switch (type) {
				case 'uuid':
					return uuid('4', random.int.bind(random));
				case 'name':
					return `${['Ana', 'Bruno', 'Camila', 'Diego', 'Elisa', 'Felipe', 'Helena', 'Igor'][random.int(8)]} ${['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa'][random.int(6)]}`;
				case 'email':
					return `teste.${random.int(1000000)}@example.com`;
				case 'integer':
					return random.int(10000);
				case 'boolean':
					return !!random.int(2);
				case 'date':
					return new Date(Date.UTC(2020, 0, 1) + random.int(3653) * 86400000).toISOString();
				case 'cpf':
					return generateDocument('cpf', false, true, random.int.bind(random));
				case 'cnpj':
					return generateDocument('cnpj', false, true, random.int.bind(random));
				case 'string':
					return ['amostra', 'registro', 'teste', 'exemplo', 'dado', 'valor'][random.int(6)];
				default:
					throw new Error(`Tipo não suportado / Unsupported type: ${String(type)}`);
			}
		};
		const rows = Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () => ({
			...Object.fromEntries(Object.entries(fields).map(([k, t]) => [k, make(t)])),
			synthetic: true,
		}));
		const output = result(
			field(v, 'format') === 'csv'
				? Papa.unparse(rows, { escapeFormulae: true })
				: field(v, 'format') === 'sql'
					? sqlInsert(rows, 'synthetic_data')
					: rows,
			`synthetic-data.${field(v, 'format')}`,
		);
		return {
			...output,
			notice: 'tools.data-generator.seed_version_notice',
			noticeParams: { version: SYNTHETIC_SEED_VERSION },
		};
	},
	{ input: '{"id":"uuid","name":"name","email":"email","age":"integer"}' },
	synthetic,
);
