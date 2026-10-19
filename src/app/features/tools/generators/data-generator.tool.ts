import { faker } from '@faker-js/faker/locale/pt_BR';

import Papa from 'papaparse';

import { generateDocument } from '@app/features/tools/brazilian/documents';

import { uuid, randomInt } from '@app/features/tools/_shared/random';

import { synthetic } from '@app/features/tools/_shared/controls';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { count } from '@app/features/tools/_shared/execution-controls';

import { field, boundedNumber } from '@app/core/models/tool';

import { json, object } from '@app/features/tools/_shared/data';

import { sqlInsert } from '@app/features/tools/json/data-utils';

import { format } from '@app/features/tools/generators/record-generation';

export const definition = tool(
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
);
