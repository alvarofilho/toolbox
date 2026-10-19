import { describe, expect, it } from 'vitest';
import { people, exportPeople, PERSON_FIELDS } from '@app/features/tools/brazilian/person';
import { validDocument } from '@app/features/tools/brazilian/documents';

describe('synthetic people', () => {
	it('generates selected fields, valid check digits and reserved email domains', () => {
		const rows = people(20, PERSON_FIELDS, 'MG', 18, 65);
		expect(rows).toHaveLength(20);
		for (const row of rows) {
			expect(row.synthetic).toBe(true);
			expect(validDocument(row.cpf ?? '', 'cpf')).toBe(true);
			expect(row.email).toMatch(/@example\.com$/);
			expect(row.state).toBe('MG');
		}
	});
	it('does not export unselected fields', () =>
		expect(Object.keys(people(1, ['name'], 'SP', 18, 18)[0])).toEqual(['synthetic', 'name']));
	it.each([0, 1001, 1.5])('rejects count %s', (count) =>
		expect(() => people(count, ['name'], 'SP', 18, 65)).toThrow(),
	);
	it('rejects empty fields and inverted ages', () => {
		expect(() => people(1, [], 'SP', 18, 65)).toThrow();
		expect(() => people(1, ['name'], 'SP', 65, 18)).toThrow();
	});
	it('exports JSON, CSV and escaped SQL', () => {
		const rows = [{ synthetic: true as const, name: `Ana "QA" O'Neil` }];
		expect(JSON.parse(exportPeople(rows, 'json'))[0].synthetic).toBe(true);
		expect(exportPeople(rows, 'csv')).toContain('"Ana ""QA"" O\'Neil"');
		expect(exportPeople(rows, 'sql')).toContain("O''Neil");
		expect(exportPeople(rows, 'sql')).toContain('INSERT INTO synthetic_people');
	});
});
