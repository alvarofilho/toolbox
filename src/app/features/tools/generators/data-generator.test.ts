import { describe, expect, it } from 'vitest';
import { definition } from '@app/features/tools/generators/data-generator.tool';
import { validDocument } from '@app/features/tools/brazilian/documents';
import { randomSource } from '@app/features/tools/_shared/seeded-random';

describe('seeded synthetic data', () => {
	const run = (seed: string, format: string) =>
		Promise.resolve(
			definition.run({
				input:
					'{"id":"uuid","name":"name","email":"email","cpf":"cpf","cnpj":"cnpj","date":"date"}',
				count: '12',
				format,
				seed,
			}),
		);

	it('reproduces seeded JSON and validates deterministic identifiers', async () => {
		const first = await run('qa-2026', 'json');
		expect((await run('qa-2026', 'json')).output).toBe(first.output);
		const rows = JSON.parse(first.output) as Record<string, unknown>[];
		expect(rows.every((row) => row['synthetic'] === true)).toBe(true);
		expect(new Set(rows.map((row) => row['id'])).size).toBe(rows.length);
		expect(
			rows.every(
				(row) =>
					validDocument(String(row['cpf']), 'cpf') && validDocument(String(row['cnpj']), 'cnpj'),
			),
		).toBe(true);
	});

	it('isolates runs, preserves export escapes and includes the algorithm version', async () => {
		const first = await run('stable', 'json');
		await run('other', 'csv');
		expect((await run('stable', 'json')).output).toBe(first.output);
		const rows = JSON.parse(first.output) as Record<string, unknown>[];
		const csv = (await run('stable', 'csv')).output;
		expect(csv).toContain('synthetic');
		expect(csv).toContain(String(rows[0]?.['id']));
		const sql = await run('stable', 'sql');
		expect(sql.output).toContain('INSERT INTO "synthetic_data"');
		expect(sql.output).toContain(String(rows[0]?.['id']));
		expect(sql.notice).toBe('tools.data-generator.seed_version_notice');
	});

	it('rejects seeds longer than the documented limit', () => {
		expect(() => randomSource('x'.repeat(257))).toThrow();
	});
});
