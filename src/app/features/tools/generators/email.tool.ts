import { randomInt } from '@app/features/tools/_shared/random';

import { records } from '@app/features/tools/generators/record-generation';

export const definition = records('email', (_, i) => ({
	email: `teste.${i + 1}.${randomInt(1000000)}@example.com`,
}));
