import { Parser } from 'node-sql-parser/build/postgresql';

import { object } from '@app/features/tools/_shared/data';

export const ddlExample = {
	input:
		'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255) NOT NULL, active BOOLEAN, created_at TIMESTAMP);',
};

export function parseDdl(sql: string): Record<string, unknown>[] {
	const parsed: unknown = new Parser().astify(sql, { database: 'Postgresql' });
	const statements = (Array.isArray(parsed) ? parsed : [parsed]).map(object);
	if (
		!statements.length ||
		statements.some((s) => s['type'] !== 'create' || s['keyword'] !== 'table')
	) {
		throw new Error('Use somente CREATE TABLE (PostgreSQL) / Use only PostgreSQL CREATE TABLE');
	}
	return statements;
}
