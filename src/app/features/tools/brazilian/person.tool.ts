import {
	field,
	boundedNumber,
	type ToolDefinition,
	type TranslationKey,
} from '@app/core/models/tool';
import {
	people,
	exportPeople,
	PERSON_FIELDS,
	type PersonField,
} from '@app/features/tools/brazilian/person';
import { check, number, select, generate, input } from '@app/features/tools/_shared/controls';
import { SYNTHETIC_SEED_VERSION } from '@app/features/tools/_shared/seeded-random';

const fieldLabels: Readonly<Record<PersonField, TranslationKey>> = {
	name: 'tools.person.name',
	cpf: 'tools.person.cpf',
	email: 'tools.person.email',
	phone: 'tools.person.phone',
	birthDate: 'tools.person.birth_date',
	state: 'tools.person.state',
};

export const definition: ToolDefinition = {
	id: 'person',
	controls: [
		number('count', 'tools.person.count', 5, 1, 1000, undefined),
		number('minAge', 'tools.person.minimum_age', 18, 18, 100, undefined),
		number('maxAge', 'tools.person.maximum_age', 65, 18, 100, undefined),
		select(
			'state',
			'tools.person.state',
			['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'SC', 'DF'].map((s) => [s]),
			undefined,
		),
		select(
			'format',
			'tools.person.export_as',
			[
				['json', 'tools.person.json'],
				['csv', 'tools.person.csv'],
				['sql', 'tools.person.sql_insert'],
			],
			undefined,
		),
		input('seed', 'tools.person.seed', '', 'text'),
		...PERSON_FIELDS.map((key) => check(`include-${key}`, fieldLabels[key])),
	],
	action: generate,
	hint: 'tools.person.synthetic_test_data_notice_complete',
	run: (v) => {
		const format = field(v, 'format');
		return {
			output: exportPeople(
				people(
					boundedNumber(field(v, 'count'), 1, 1000),
					PERSON_FIELDS.filter((f) => field(v, `include-${f}`) === 'true'),
					field(v, 'state'),
					boundedNumber(field(v, 'minAge'), 18, 100),
					boundedNumber(field(v, 'maxAge'), 18, 100),
					field(v, 'seed'),
				),
				format,
			),
			filename: `synthetic-people.${format}`,
			mime: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain',
			notice: 'tools.person.seed_version_notice',
			noticeParams: { version: SYNTHETIC_SEED_VERSION },
		};
	},
};
