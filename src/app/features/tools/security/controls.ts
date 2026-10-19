import 'reflect-metadata';

import { input, select } from '@app/features/tools/_shared/controls';

export const algorithm = select('algorithm', 'Algoritmo', 'Algorithm', [
	['SHA-256', 'SHA-256', 'SHA-256'],
	['SHA-512', 'SHA-512', 'SHA-512'],
]);

export const secret = input('secret', 'Segredo (texto UTF-8)', 'Secret (UTF-8 text)', '', 'text');
