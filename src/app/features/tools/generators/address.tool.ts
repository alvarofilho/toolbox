import { faker } from '@faker-js/faker/locale/pt_BR';

import { randomInt } from '@app/features/tools/_shared/random';

import { select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { records } from '@app/features/tools/generators/record-generation';

const state = select(
	'state',
	'UF',
	'State',
	'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'
		.split(' ')
		.map((s) => [s, s, s]),
	'SP',
	'tools.address',
);

export const definition = records(
	'address',
	(v) => ({
		street: faker.location.street(),
		number: String(randomInt(999) + 1),
		district: 'Bairro Sintético',
		city: faker.location.city(),
		state: field(v, 'state'),
		postalCode: `${String(randomInt(100000)).padStart(5, '0')}-${String(randomInt(1000)).padStart(3, '0')}`,
		country: 'BR',
	}),
	[state],
);
