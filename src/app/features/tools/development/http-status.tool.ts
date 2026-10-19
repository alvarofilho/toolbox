import { getReasonPhrase } from 'http-status-codes';

import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'http-status',
	[
		input(
			'input',
			'Código HTTP (vazio para listar todos)',
			'HTTP code (empty to list all)',
			'200',
			'text',
			'tools.http-status',
		),
	],
	(v) => {
		const value = field(v, 'input').trim();
		const statuses = Array.from({ length: 500 }, (_, i) => i + 100).flatMap((code) => {
			try {
				return [
					{
						code,
						reason: getReasonPhrase(code),
						category: ['Informational', 'Success', 'Redirection', 'Client error', 'Server error'][
							Math.floor(code / 100) - 1
						],
					},
				];
			} catch {
				return [];
			}
		});
		if (!value) {
			return result(statuses);
		}
		if (!/^\d{3}$/.test(value)) {
			throw new Error('Código HTTP inválido / Invalid HTTP code');
		}
		const found = statuses.find((s) => s.code === Number(value));
		if (!found) {
			throw new Error('Código não registrado / Unregistered code');
		}
		return result(found);
	},
);
