import { faker } from '@faker-js/faker/locale/pt_BR';

import { generateDocument } from '@app/features/tools/brazilian/documents';

import { records } from '@app/features/tools/generators/record-generation';

export const definition = records('company', () => ({
	name: `${faker.company.name()} TESTE`,
	cnpj: generateDocument('cnpj'),
	email: faker.internet.email({ provider: 'example.com' }),
	website: 'https://example.com',
}));
