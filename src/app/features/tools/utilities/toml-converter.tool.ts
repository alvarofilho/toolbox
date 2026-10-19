import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { select, source } from '@app/features/tools/_shared/controls';

import {
	parse as parseToml,
	stringify as stringifyToml,
	type TomlTableWithoutBigInt,
	type TomlValueWithoutBigInt,
} from 'smol-toml';

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

function tomlValue(value: unknown): TomlValueWithoutBigInt {
	if (typeof value === 'string' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map(tomlValue);
	}
	if (typeof value === 'object' && value !== null) {
		const table: TomlTableWithoutBigInt = {};
		for (const [key, entry] of Object.entries(value)) {
			table[key] = tomlValue(entry);
		}
		return table;
	}
	throw new Error(
		'TOML não aceita null, valores não finitos ou este tipo / TOML does not support null, non-finite numbers, or this value type',
	);
}

function tomlTable(value: unknown): TomlTableWithoutBigInt {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('A raiz do TOML deve ser um objeto / TOML root must be an object');
	}
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) {
		throw new Error('A raiz do TOML deve ser um objeto simples / TOML root must be a plain object');
	}
	const table: TomlTableWithoutBigInt = {};
	for (const [key, entry] of Object.entries(value)) {
		table[key] = tomlValue(entry);
	}
	return table;
}

export const definition = tool(
	'toml-converter',
	[
		source,
		select(
			'from',
			'Converter de',
			'Convert from',
			[
				['json', 'JSON', 'JSON'],
				['yaml', 'YAML', 'YAML'],
				['toml', 'TOML', 'TOML'],
			],
			undefined,
			'tools.toml-converter',
		),
		select(
			'to',
			'Converter para',
			'Convert to',
			[
				['toml', 'TOML', 'TOML'],
				['json', 'JSON', 'JSON'],
				['yaml', 'YAML', 'YAML'],
			],
			undefined,
			'tools.toml-converter',
		),
	],
	(v) => {
		const inputText = field(v, 'input');
		if (inputText.length > 1_000_000) {
			throw new Error('Limite de entrada: 1 MB / Input limit: 1 MB');
		}
		const from = field(v, 'from');
		const to = field(v, 'to');
		const parsed: unknown =
			from === 'json'
				? JSON.parse(inputText)
				: from === 'yaml'
					? parseYaml(inputText)
					: parseToml(inputText);
		const output =
			to === 'json'
				? JSON.stringify(parsed, null, 2)
				: to === 'yaml'
					? stringifyYaml(parsed)
					: stringifyToml(tomlTable(parsed));
		return result(output, `converted.${to}`);
	},
	{ input: '{"name":"demo","enabled":true}', from: 'json', to: 'toml' },
);
