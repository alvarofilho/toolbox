import { describe, expect, it } from 'vitest';
import { TOOLS, findTools, CATEGORIES } from '@app/features/tools/catalog/tools';
import { yamlToJson } from '@app/features/tools/json/json-yaml.tool';
import { presentDefinition } from '@app/features/tools/workbench/presentation';
import pt from '@app/i18n/pt.json';
import en from '@app/i18n/en.json';
import es from '@app/i18n/es.json';
import type { Localized } from '@app/core/models/tool';

function isTranslationObject(value: unknown): value is Readonly<Record<string, unknown>> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function translationAt(dictionary: Readonly<Record<string, unknown>>, key: string): unknown {
	let value: unknown = dictionary;
	for (const part of key.split('.')) {
		if (!isTranslationObject(value)) {
			return undefined;
		}
		value = value[part];
	}
	return value;
}

async function loadDefinition(id: string) {
	const tool = TOOLS.find((tool) => tool.id === id);
	if (!tool) {
		throw new Error(`Unknown tool: ${id}`);
	}
	return tool.loadDefinition();
}

async function run(id: string, values: Record<string, string> = {}) {
	const definition = await loadDefinition(id);
	return definition.run({
		...Object.fromEntries(definition.controls.map((c) => [c.key, c.value])),
		...values,
	});
}
describe('tool catalog', () => {
	it('translates every published tool, control, option and action in all supported languages', async () => {
		const dictionaries: readonly Readonly<Record<string, unknown>>[] = [pt, en, es];
		for (const category of CATEGORIES) {
			for (const dictionary of dictionaries) {
				expect(translationAt(dictionary, category.name.key), category.id).toEqual(
					expect.any(String),
				);
			}
		}
		for (const info of TOOLS) {
			const definition = presentDefinition(await info.loadDefinition(), info);
			const localized: Localized[] = [info.name, info.description, definition.action];
			if (definition.hint) {
				localized.push(definition.hint);
			}
			for (const control of definition.controls) {
				localized.push(control.label);
				if (control.placeholder) {
					localized.push(control.placeholder);
				}
				localized.push(...(control.options ?? []).map((option) => option.label));
			}
			for (const value of localized) {
				for (const dictionary of dictionaries) {
					expect(translationAt(dictionary, value.key), `${info.id}: ${value.key}`).toEqual(
						expect.any(String),
					);
				}
			}
		}
	}, 15000);
	it('keeps the complete catalog unique with valid categories and lazy loaders', async () => {
		expect(TOOLS.length).toBeGreaterThanOrEqual(128);
		expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
		for (const tool of TOOLS) {
			expect(CATEGORIES.some((c) => c.id === tool.category)).toBe(true);
			expect((await tool.loadDefinition()).id).toBe(tool.id);
		}
	}, 15000);
	it('searches names, descriptions, categories and accent-insensitive keywords', () => {
		expect(findTools('alfanumerico').map((t) => t.id)).toContain('cnpj');
		expect(findTools('criptografia').map((t) => t.id)).toContain('sha');
		expect(findTools('BASE64').map((t) => t.id)).toContain('base64');
		expect(findTools('chave').map((t) => t.id)).toContain('token');
		expect(findTools('nonsense term')).toEqual([]);
	});
});
describe('JSON tools', () => {
	it('formats and validates JSON', async () => {
		expect((await run('json-formatter', { input: '{"a":1}', indent: '2' })).output).toBe(
			'{\n  "a": 1\n}',
		);
		await expect(run('json-formatter', { input: '{bad' })).rejects.toThrow();
	});
	it('minifies without corrupting string whitespace', async () =>
		expect((await run('json-minifier', { input: '{ "a": "x y" }' })).output).toBe('{"a":"x y"}'));
	it('diffs objects independently of key order', async () =>
		expect(
			(await run('json-diff', { input: '{"a":1,"b":2}', second: '{"b":2,"a":1}' })).output,
		).toContain('No differences'));
	it('rejects invalid second JSON', async () =>
		await expect(run('json-diff', { input: '{}', second: 'x' })).rejects.toThrow());
	it('handles JSON null and primitives', async () => {
		expect((await run('json-formatter', { input: 'null' })).output).toBe('null');
		expect((await run('json-minifier', { input: 'true' })).output).toBe('true');
	});
});
describe('other tool definitions', () => {
	it('round-trips URL components', async () => {
		const source = 'ação /?&=';
		const encoded = (await run('url', { input: source, mode: 'encode' })).output;
		expect((await run('url', { input: encoded, mode: 'decode' })).output).toBe(source);
		await expect(run('url', { input: '%xx', mode: 'decode' })).rejects.toThrow();
	});
	it('uses selected Base64 direction', async () =>
		expect((await run('base64', { input: 'Zm9v', mode: 'decode' })).output).toBe('foo'));
	it('generates requested UUID count and rejects excess', async () => {
		expect((await run('uuid', { count: '3' })).output.split('\n')).toHaveLength(3);
		await expect(run('uuid', { count: '1001' })).rejects.toThrow();
	});
	it('generates passwords and secure tokens in both encodings', async () => {
		expect((await run('password')).output).toHaveLength(24);
		expect((await run('token')).output).toMatch(/^[0-9a-f]{64}$/);
		const standardBase64 = (await run('token', { encoding: 'base64' })).output;
		expect(standardBase64).toMatch(/^[A-Za-z0-9+/]{43}=$/);
		expect(atob(standardBase64)).toHaveLength(32);
		expect((await run('token', { encoding: 'base64url' })).output).toMatch(/^[A-Za-z0-9_-]{43}$/);
	});
	it('hashes known SHA-256 and SHA-512 vectors', async () => {
		expect((await run('sha', { input: 'abc', algorithm: 'SHA-256' })).output).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		);
		expect((await run('sha', { input: 'abc', algorithm: 'SHA-512' })).output).toBe(
			'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
		);
	});
	it('exposes timestamp, case and text diff processing', async () => {
		expect((await run('timestamp', { input: '0' })).output).toContain('1970');
		expect((await run('case', { input: 'hello world' })).output).toBe('helloWorld');
		expect((await run('text-diff', { input: 'a', second: 'b' })).output).toContain('+ b');
	});
	it('validates documents through tool definitions', async () => {
		expect((await run('cpf', { mode: 'validate', input: '52998224725' })).output).toContain(
			'Valid check',
		);
		expect((await run('cnpj', { mode: 'validate', input: '12ABC34501DE35' })).output).toContain(
			'Valid check',
		);
		expect((await run('cpf', { mode: 'validate', input: '0' })).output).toContain(
			'Invalid document',
		);
	});
	it('exports people in all three formats', async () => {
		for (const format of ['json', 'csv', 'sql']) {
			const result = await run('person', { count: '2', format });
			expect(result.filename).toBe(`synthetic-people.${format}`);
			expect(result.output.length).toBeGreaterThan(30);
		}
	});
});
describe('YAML conversion', () => {
	it('round-trips nested data and Unicode', async () => {
		const input = '{"name":"João","active":true,"items":[1,null,"x"]}';
		const yaml = (await run('json-yaml', { input, mode: 'yaml' })).output;
		expect(JSON.parse(yamlToJson(yaml))).toEqual(JSON.parse(input));
	});
	it.each(['a: [', 'a: 1\na: 2', 'a: *missing', ''])('rejects malformed YAML %s', (value) =>
		expect(() => yamlToJson(value)).toThrow(),
	);
	it('limits alias expansion and rejects recursive structures', () =>
		expect(() => yamlToJson('a: &a [*a]')).toThrow());
});
