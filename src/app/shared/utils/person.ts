import { generateDocument } from './documents';
import { randomInt } from './random';

export const PERSON_FIELDS = ['name', 'cpf', 'email', 'phone', 'birthDate', 'state'] as const;
export type PersonField = (typeof PERSON_FIELDS)[number];
export type Person = { synthetic: true } & Partial<Record<PersonField, string>>;
export function people(
  count: number,
  fields: readonly PersonField[],
  state: string,
  minAge: number,
  maxAge: number,
): Person[] {
  if (!Number.isInteger(count) || count < 1 || count > 1000)
    throw new Error('Quantidade / Count: 1–1000');
  if (!fields.length || fields.some((f) => !PERSON_FIELDS.includes(f)))
    throw new Error('Selecione campos / Select fields');
  if (
    !Number.isInteger(minAge) ||
    !Number.isInteger(maxAge) ||
    minAge < 18 ||
    maxAge > 100 ||
    minAge > maxAge
  )
    throw new Error('Idade / Age: 18–100');
  if (!['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'SC', 'DF'].includes(state))
    throw new Error('UF inválida / Invalid state');
  const first = ['Ana', 'Bruno', 'Camila', 'Diego', 'Elisa', 'Felipe', 'Helena', 'Igor'];
  const last = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa'];
  return Array.from({ length: count }, (_, index) => {
    const age = minAge + randomInt(maxAge - minAge + 1);
    const birth = new Date();
    birth.setUTCFullYear(birth.getUTCFullYear() - age);
    birth.setUTCDate(Math.max(1, birth.getUTCDate() - randomInt(25)));
    const data: Record<PersonField, string> = {
      name: `${first[randomInt(first.length)]} ${last[randomInt(last.length)]}`,
      cpf: generateDocument('cpf'),
      email: `teste.${index + 1}.${randomInt(1000000)}@example.com`,
      phone: `(11) 9${String(randomInt(100000000)).padStart(8, '0')}`,
      birthDate: birth.toISOString().slice(0, 10),
      state,
    };
    const person: Person = { synthetic: true };
    for (const field of fields) person[field] = data[field];
    return person;
  });
}

export function exportPeople(records: readonly Person[], format: string): string {
  if (format === 'json') return JSON.stringify(records, null, 2);
  const keys = Object.keys(records[0] ?? {});
  const value = (record: Person, key: string): string =>
    String(Object.entries(record).find(([name]) => name === key)?.[1] ?? '');
  if (format === 'csv')
    return [
      keys.join(','),
      ...records.map((record) =>
        keys.map((key) => `"${value(record, key).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\r\n');
  if (format === 'sql')
    return records
      .map(
        (record) =>
          `INSERT INTO synthetic_people (${keys.join(', ')}) VALUES (${keys.map((key) => `'${value(record, key).replace(/'/g, "''")}'`).join(', ')});`,
      )
      .join('\n');
  throw new Error('JSON / CSV / SQL');
}
