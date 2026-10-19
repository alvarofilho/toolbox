import { faker } from '@faker-js/faker/locale/pt_BR';
import Papa from 'papaparse';
import { generateDocument } from '../../../shared/utils/documents';
import { randomInt } from '../../../shared/utils/random';
import { boundedNumber, field, number, result, select, text, tool } from './common';
import { sqlInsert } from './data-utils';

const countryControl = select('country', 'País', 'Country', [
  ['AR', 'Argentina', 'Argentina'],
  ['BO', 'Bolívia', 'Bolivia'],
  ['BR', 'Brasil', 'Brazil'],
  ['PY', 'Paraguai', 'Paraguay'],
  ['UY', 'Uruguai', 'Uruguay'],
  ['VE', 'Venezuela (suspensa)', 'Venezuela (suspended)'],
]);
const kindControl = select('kind', 'Tipo de dados', 'Data type', [
  ['person', 'Pessoa', 'Person'],
  ['company', 'Empresa', 'Company'],
]);
const formatControl = select('format', 'Formato de saída', 'Output format', [
  ['json', 'JSON', 'JSON'],
  ['csv', 'CSV', 'CSV'],
  ['sql', 'SQL INSERT', 'SQL INSERT'],
]);

const profiles = {
  AR: {
    country: 'Argentina',
    dialCode: '+54',
    currency: 'ARS',
    phoneDigits: 10,
    postalCode: () => digits(4),
    companySuffix: 'S.R.L.',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario'],
    regions: ['Buenos Aires', 'Córdoba', 'Santa Fe'],
  },
  BO: {
    country: 'Bolívia',
    dialCode: '+591',
    currency: 'BOB',
    phoneDigits: 8,
    postalCode: () => '',
    companySuffix: 'S.R.L.',
    cities: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba'],
    regions: ['La Paz', 'Santa Cruz', 'Cochabamba'],
  },
  BR: {
    country: 'Brasil',
    dialCode: '+55',
    currency: 'BRL',
    phoneDigits: 11,
    postalCode: () => '00000-000',
    companySuffix: 'LTDA.',
    cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'],
    regions: ['SP', 'RJ', 'MG'],
  },
  PY: {
    country: 'Paraguai',
    dialCode: '+595',
    currency: 'PYG',
    phoneDigits: 9,
    postalCode: () => digits(4),
    companySuffix: 'S.R.L.',
    cities: ['Assunção', 'Ciudad del Este', 'Encarnación'],
    regions: ['Central', 'Alto Paraná', 'Itapúa'],
  },
  UY: {
    country: 'Uruguai',
    dialCode: '+598',
    currency: 'UYU',
    phoneDigits: 8,
    postalCode: () => digits(5),
    companySuffix: 'S.R.L.',
    cities: ['Montevidéu', 'Salto', 'Maldonado'],
    regions: ['Montevidéu', 'Salto', 'Maldonado'],
  },
  VE: {
    country: 'Venezuela',
    dialCode: '+58',
    currency: 'VES',
    phoneDigits: 10,
    postalCode: () => digits(4),
    companySuffix: 'C.A.',
    cities: ['Caracas', 'Maracaibo', 'Valencia'],
    regions: ['Distrito Capital', 'Zulia', 'Carabobo'],
  },
} as const;
type CountryCode = keyof typeof profiles;

function digits(length: number): string {
  return Array.from({ length }, () => String(randomInt(10))).join('');
}

function argentinaCuit(kind: 'person' | 'company'): string {
  const base = `${kind === 'person' ? '20' : '30'}${digits(8)}`;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = base
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
  return `${base}${checkDigit}`;
}

function paraguayRuc(): string {
  const base = digits(7);
  let weight = 2;
  let sum = 0;
  for (let index = base.length - 1; index >= 0; index--) {
    sum += Number(base[index]) * weight;
    weight = weight === 11 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  return `${base}${remainder > 1 ? 11 - remainder : 0}`;
}

function documentFor(
  country: CountryCode,
  kind: 'person' | 'company',
): {
  type: string;
  value: string;
  validation: 'check-digit' | 'format-only';
} {
  if (country === 'BR') {
    return {
      type: kind === 'person' ? 'CPF' : 'CNPJ',
      value: generateDocument(kind === 'person' ? 'cpf' : 'cnpj'),
      validation: 'check-digit',
    };
  }
  if (country === 'AR') {
    return kind === 'person'
      ? { type: 'DNI (formato sintético)', value: digits(8), validation: 'format-only' }
      : { type: 'CUIT', value: argentinaCuit(kind), validation: 'check-digit' };
  }
  if (country === 'BO') {
    return kind === 'person'
      ? { type: 'CI (formato sintético)', value: digits(8), validation: 'format-only' }
      : {
          type: 'NIT (formato sintético)',
          value: `${digits(8)}01${randomInt(9) + 1}`,
          validation: 'format-only',
        };
  }
  if (country === 'PY') {
    return kind === 'person'
      ? { type: 'Cédula (formato sintético)', value: digits(8), validation: 'format-only' }
      : { type: 'RUC', value: paraguayRuc(), validation: 'check-digit' };
  }
  if (country === 'UY') {
    return kind === 'person'
      ? { type: 'CI (formato sintético)', value: digits(8), validation: 'format-only' }
      : { type: 'RUT (formato sintético)', value: digits(12), validation: 'format-only' };
  }
  return kind === 'person'
    ? { type: 'Cédula (formato sintético)', value: `V-${digits(8)}`, validation: 'format-only' }
    : {
        type: 'RIF (formato sintético)',
        value: `J-${digits(8)}-${randomInt(10)}`,
        validation: 'format-only',
      };
}

export const definitions = [
  tool(
    'mercosur-data',
    [
      number('count', 'Quantidade', 'Count', 5, 1, 1000),
      countryControl,
      kindControl,
      formatControl,
    ],
    (values) => {
      const code = field(values, 'country');
      const kind = field(values, 'kind');
      const format = field(values, 'format');
      if (!(code in profiles) || (kind !== 'person' && kind !== 'company')) {
        throw new Error('País ou tipo de dados inválido / Invalid country or data type');
      }
      if (format !== 'json' && format !== 'csv' && format !== 'sql') {
        throw new Error('Formato inválido / Invalid output format');
      }
      const country = code as CountryCode;
      const profile = profiles[country];
      const rows = Array.from(
        { length: boundedNumber(field(values, 'count'), 1, 1000) },
        (_, index) => {
          const isPerson = kind === 'person';
          const document = documentFor(country, kind);
          const name = isPerson
            ? country === 'BR'
              ? faker.person.fullName()
              : `${['Sofía', 'Mateo', 'Valentina', 'Lucas', 'Camila', 'Thiago'][randomInt(6)]} ${['García', 'González', 'Rodríguez', 'Fernández', 'Pereira', 'Silva'][randomInt(6)]}`
            : `${faker.company.name()} ${profile.companySuffix} TESTE`;
          return {
            synthetic: true,
            country: profile.country,
            countryCode: country,
            kind,
            name,
            documentType: document.type,
            document: document.value,
            documentValidation: document.validation,
            email: `teste.${country.toLowerCase()}.${index + 1}.${randomInt(1_000_000)}@example.com`,
            phone: `${profile.dialCode} ${digits(profile.phoneDigits)}`,
            address: {
              street: `Rua de Teste ${index + 1}`,
              city: profile.cities[randomInt(profile.cities.length)],
              region: profile.regions[randomInt(profile.regions.length)],
              postalCode: profile.postalCode(),
              country: profile.country,
            },
            currency: profile.currency,
          };
        },
      );
      const output =
        format === 'csv'
          ? Papa.unparse(rows, { escapeFormulae: true })
          : format === 'sql'
            ? sqlInsert(rows, 'synthetic_mercosur_data')
            : rows;
      return result(output, `synthetic-mercosur.${format}`);
    },
    undefined,
    text(
      'Gera dados fictícios para testes. Formatos estrangeiros sem regra de dígito verificador implementada são identificados como "formato sintético". Nenhum número comprova cadastro ou existência real. A Venezuela está incluída como Estado Parte suspenso.',
      'Generates fictional test data. Foreign formats without an implemented check-digit rule are marked as synthetic format only. No number proves registration or real existence. Venezuela is included as a suspended State Party.',
    ),
  ),
];
