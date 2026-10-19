import { object } from '@app/features/tools/_shared/data';

export function rowsFrom(value: unknown): Record<string, unknown>[] {
	const rows = Array.isArray(value) ? value : [value];
	if (!rows.length || rows.length > 1000) {
		throw new Error('Use 1–1.000 registros / records');
	}
	return rows.map(object);
}

export function identifier(s: string): string {
	if (
		!s.trim() ||
		s.length > 128 ||
		Array.from(s).some((character) => character.charCodeAt(0) <= 0x1f)
	) {
		throw new Error('Identificador inválido / Invalid identifier');
	}
	return `"${s.replace(/"/g, '""')}"`;
}

export function sqlInsert(rows: readonly Record<string, unknown>[], table: string): string {
	const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
	if (!keys.length || keys.length > 100) {
		throw new Error('Use 1–100 colunas / columns');
	}
	const literal = (value: unknown): string => {
		if (value === null || value === undefined) {
			return 'NULL';
		}
		if (typeof value === 'number') {
			return String(value);
		}
		if (typeof value === 'boolean') {
			return value ? 'TRUE' : 'FALSE';
		}

		const serialized =
			typeof value === 'string'
				? value
				: typeof value === 'symbol' || typeof value === 'bigint'
					? value.toString()
					: (JSON.stringify(value) ?? '');
		return `'${serialized.replace(/'/g, "''")}'`;
	};
	return rows
		.map(
			(row) =>
				`INSERT INTO ${identifier(table)} (${keys.map(identifier).join(', ')}) VALUES (${keys.map((k) => literal(row[k])).join(', ')});`,
		)
		.join('\n');
}
