import 'reflect-metadata';

import { input, select } from '@app/features/tools/_shared/controls';

export const algorithm = select('algorithm', 'common.algorithm', [
	['SHA-256', 'common.sha_256'],
	['SHA-512', 'common.sha_512'],
]);

export const secret = input('secret', 'common.secret_utf_8_text', '', 'text');
