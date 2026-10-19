import { describe, expect, it } from 'vitest';
import {
  cpfDigits,
  cnpjDigits,
  validDocument,
  generateDocument,
  normalizeDocument,
} from './documents';

describe('Brazilian check digits', () => {
  it.each(['529.982.247-25', '111.444.777-35', '012.345.678-90'])('validates CPF %s', (value) =>
    expect(validDocument(value, 'cpf')).toBe(true),
  );
  it.each([
    '11111111111',
    '00000000000',
    '52998224724',
    '5299822472',
    'x52998224725',
    '52998224725!',
    '',
  ])('rejects CPF %s', (value) => expect(validDocument(value, 'cpf')).toBe(false));
  it.each(['11.222.333/0001-81', '04.252.011/0001-10', '12.ABC.345/01DE-35', '12.abc.345/01de-35'])(
    'validates CNPJ %s',
    (value) => expect(validDocument(value, 'cnpj')).toBe(true),
  );
  it.each([
    '00000000000000',
    '11111111111111',
    '12ABC34501DE34',
    '12ABC34501DE3X',
    '12@BC34501DE35',
    '',
  ])('rejects CNPJ %s', (value) => expect(validDocument(value, 'cnpj')).toBe(false));
  it('matches the Receita Federal alphanumeric vector', () =>
    expect(cnpjDigits('12ABC34501DE')).toBe('35'));
  it('calculates CPF and rejects malformed bases', () => {
    expect(cpfDigits('529982247')).toBe('25');
    expect(() => cpfDigits('foo')).toThrow();
    expect(() => cnpjDigits('foo')).toThrow();
  });
  it.each(['cpf', 'cnpj'] as const)('generates formatted and raw %s', (kind) => {
    for (let i = 0; i < 50; i++) {
      expect(validDocument(generateDocument(kind, false, false), kind)).toBe(true);
      expect(validDocument(generateDocument(kind, true), kind)).toBe(true);
    }
  });
  it('only removes document punctuation', () =>
    expect(normalizeDocument('12.abc.345/01de-35')).toBe('12ABC34501DE35'));
});
