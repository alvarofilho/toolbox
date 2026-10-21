import { field, ToolExecutionError, type ToolDefinition } from '@app/core/models/tool';

import { input, select } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

const validHash = /^\$2[aby]\$(0[4-9]|1[0-4])\$[./A-Za-z0-9]{53}$/;
const allowedCosts = [10, 12, 14] as const;
const maxPasswordBytes = 72;

type BcryptResponse =
	| { readonly hash: string; readonly cost: number }
	| { readonly matches: boolean }
	| { readonly error: string };

export const definition: ToolDefinition = {
	id: 'bcrypt',
	controls: [
		mode(['hash', 'verify']),
		input('password', 'tools.bcrypt.password', '', 'password'),
		input('hash', 'tools.bcrypt.bcrypt_hash_to_verify', '', 'text'),
		select(
			'cost',
			'tools.bcrypt.cost',
			[
				['10', 'tools.bcrypt.10_default'],
				['12', 'tools.bcrypt.12'],
				['14', 'tools.bcrypt.14'],
			],
			undefined,
		),
	],
	action: 'common.run_title',
	hint: 'tools.bcrypt.the_password_and_hash_are_processed_in_you',
	example: { mode: 'hash', password: 'correct horse battery staple', hash: '', cost: '10' },
	run: async (values, _files, signal) => {
		const password = field(values, 'password');
		if (!password) {
			throw new ToolExecutionError('input', 'Informe uma senha / Enter a password');
		}
		if (new TextEncoder().encode(password).byteLength > maxPasswordBytes) {
			throw new ToolExecutionError(
				'input',
				'A senha deve ter no máximo 72 bytes UTF-8 / Password must be at most 72 UTF-8 bytes',
			);
		}

		const verifying = field(values, 'mode') === 'verify';
		let message:
			| { readonly mode: 'hash'; readonly password: string; readonly cost: number }
			| {
					readonly mode: 'verify';
					readonly password: string;
					readonly hash: string;
			  };
		if (verifying) {
			const hash = field(values, 'hash');
			if (!validHash.test(hash)) {
				throw new ToolExecutionError(
					'input',
					'Hash bcrypt inválido ou custo não permitido / Invalid bcrypt hash or unsupported cost',
				);
			}
			message = { mode: 'verify', password, hash };
		} else {
			const cost = Number(field(values, 'cost'));
			if (!allowedCosts.some((allowed) => allowed === cost)) {
				throw new ToolExecutionError('input', 'Custo não permitido / Unsupported cost');
			}
			message = { mode: 'hash', password, cost };
		}

		const response = await runWorkerTask(
			() => new Worker(new URL('./bcrypt.worker', import.meta.url), { type: 'module' }),
			message,
			{
				signal,
				timeoutMs: 120_000,
				parse: (value): BcryptResponse => {
					if (typeof value === 'object' && value !== null) {
						if (
							'hash' in value &&
							typeof value.hash === 'string' &&
							'cost' in value &&
							typeof value.cost === 'number'
						) {
							return { hash: value.hash, cost: value.cost };
						}
						if ('matches' in value && typeof value.matches === 'boolean') {
							return { matches: value.matches };
						}
						if ('error' in value && typeof value.error === 'string') {
							throw new ToolExecutionError('input', value.error);
						}
					}
					throw new ToolExecutionError('worker');
				},
			},
		);
		if (signal?.aborted) {
			throw new ToolExecutionError('cancelled');
		}
		return {
			output: JSON.stringify(response, null, 2),
			filename: verifying ? 'bcrypt-verification.json' : 'bcrypt-hash.json',
			mime: 'application/json',
		};
	},
};
