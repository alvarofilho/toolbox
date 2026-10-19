import { field, text, boundedNumber, type ToolDefinition } from '@app/core/models/tool';
import { people, exportPeople, PERSON_FIELDS } from '@app/features/tools/brazilian/person';
import { check, number, select, generate, synthetic } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'person',
	controls: [
		number('count', 'Quantidade', 'Count', 5, 1, 1000, undefined, 'tools.person'),
		number('minAge', 'Idade mínima', 'Minimum age', 18, 18, 100, undefined, 'tools.person'),
		number('maxAge', 'Idade máxima', 'Maximum age', 65, 18, 100, undefined, 'tools.person'),
		select(
			'state',
			'UF',
			'State',
			['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'SC', 'DF'].map((s) => [s, s, s]),
			undefined,
			'tools.person',
		),
		select(
			'format',
			'Exportar como',
			'Export as',
			[
				['json', 'JSON', 'JSON'],
				['csv', 'CSV', 'CSV'],
				['sql', 'SQL INSERT', 'SQL INSERT'],
			],
			undefined,
			'tools.person',
		),
		...PERSON_FIELDS.map((key, i) =>
			check(
				`include-${key}`,
				['Nome', 'CPF', 'E-mail', 'Telefone', 'Nascimento', 'UF'][i],
				['Name', 'CPF', 'Email', 'Phone', 'Birth date', 'State'][i],
				undefined,
				'tools.person',
			),
		),
	],
	action: generate,
	hint: text(
		`${synthetic.pt} E-mails usam example.com. UF é um campo independente; o DDD de teste é 11.`,
		`${synthetic.en} Emails use example.com. State is an independent field; test phone area code is 11.`,
		undefined,
		'tools.person',
	),
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
				),
				format,
			),
			filename: `synthetic-people.${format}`,
			mime: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain',
		};
	},
};
