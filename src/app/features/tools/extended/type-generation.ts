import { object } from '@app/features/tools/extended/common';

export function typeName(s: string): string {
	const name = s
		.replace(/[^\p{L}\p{N}_]/gu, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join('');
	return /^[\p{L}_]/u.test(name) ? name : `Type${name || 'Root'}`;
}

export function generateTypes(value: unknown, language: 'ts' | 'interface' | 'class'): string {
	const blocks: string[] = [];
	const used = new Set<string>();
	const shapes = new Map<string, string>();
	const shape = (v: unknown, depth = 0): unknown => {
		if (depth > 20) {
			throw new Error('Estrutura profunda demais / Too deeply nested');
		}
		if (v === null) {
			return 'null';
		}
		if (Array.isArray(v)) {
			return ['array', ...new Set(v.slice(0, 100).map((x) => JSON.stringify(shape(x, depth + 1))))];
		}
		if (typeof v === 'object') {
			return Object.fromEntries(
				Object.entries(object(v)).map(([key, val]) => [key, shape(val, depth + 1)]),
			);
		}
		return typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number') : typeof v;
	};
	const infer = (value: unknown, name: string, depth = 0): string => {
		if (depth > 20) {
			throw new Error('Estrutura profunda demais / Too deeply nested');
		}
		if (value === null) {
			return language === 'ts' ? 'null' : 'object?';
		}
		if (Array.isArray(value)) {
			const types = [
				...new Set(value.slice(0, 100).map((x) => infer(x, `${name}Item`, depth + 1))),
			];
			return language === 'ts'
				? `(${types.join(' | ') || 'unknown'})[]`
				: `List<${types.length === 1 ? types[0] : 'object'}>`;
		}
		if (typeof value === 'object') {
			const signature = JSON.stringify(shape(value));
			const existing = shapes.get(signature);
			if (existing) {
				return existing;
			}
			let n = typeName(name);
			while (used.has(n)) {
				n += 'Item';
			}
			used.add(n);
			shapes.set(signature, language === 'interface' ? `I${n}` : n);
			const properties = new Set<string>([language === 'interface' ? `I${n}` : n]);
			const fields = Object.entries(object(value)).map(([key, val]) => {
				const t = infer(val, `${n}${typeName(key)}`, depth + 1);
				let property = typeName(key);
				while (properties.has(property)) {
					property += 'Value';
				}
				properties.add(property);
				return language === 'ts'
					? `  ${JSON.stringify(key)}: ${t};`
					: `  [System.Text.Json.Serialization.JsonPropertyName(${JSON.stringify(key)})]\n  ${language === 'class' ? 'public ' : ''}${t} ${property} { get; set; }`;
			});
			blocks.push(
				`${language === 'ts' ? 'export interface' : language === 'interface' ? 'public interface' : 'public class'} ${language === 'interface' ? 'I' : ''}${n} {\n${fields.join('\n')}\n}`,
			);
			return language === 'interface' ? `I${n}` : n;
		}
		return language === 'ts'
			? typeof value
			: typeof value === 'string'
				? 'string'
				: typeof value === 'boolean'
					? 'bool'
					: typeof value === 'number'
						? Number.isSafeInteger(value)
							? 'long'
							: 'double'
						: 'object';
	};
	const root = infer(value, 'Root');
	if (language === 'ts' && (value === null || typeof value !== 'object' || Array.isArray(value))) {
		blocks.push(`export type Root = ${root};`);
	}
	if (language !== 'ts' && (value === null || typeof value !== 'object' || Array.isArray(value))) {
		blocks.push(`public class Root { public ${root} Value { get; set; } }`);
	}
	return `${language === 'ts' ? '' : '#nullable enable\nusing System.Collections.Generic;\n\n'}${blocks.reverse().join('\n\n')}`;
}
