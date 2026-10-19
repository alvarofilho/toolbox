import { faker } from '@faker-js/faker/locale/pt_BR';

import { tool, result } from '@app/features/tools/_shared/definition';

import { number } from '@app/features/tools/_shared/controls';

import { field, boundedNumber } from '@app/core/models/tool';

export const definition = tool(
	'lorem',
	[number('count', 'Parágrafos', 'Paragraphs', 3, 1, 100)],
	(v) =>
		result(faker.lorem.paragraphs(boundedNumber(field(v, 'count'), 1, 100), '\n\n'), 'lorem.txt'),
);
