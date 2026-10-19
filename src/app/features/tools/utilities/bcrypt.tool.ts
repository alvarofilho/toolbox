import { field, text } from '@app/core/models/tool';

import { input, select } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { result, tool } from '@app/features/tools/_shared/definition';

import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';

export const definition = tool(
	'bcrypt',
	[
		mode(['hash', 'verify']),
		input('password', 'Senha', 'Password', '', 'password'),
		input('hash', 'Hash bcrypt (para verificar)', 'Bcrypt hash (to verify)', '', 'text'),
		select('cost', 'Custo', 'Cost', [
			['10', '10 (padrão)', '10 (default)'],
			['12', '12', '12'],
			['14', '14', '14'],
		]),
	],
	async (v) => {
		const password = field(v, 'password');
		if (!password) {
			throw new Error('Informe uma senha / Enter a password');
		}
		if (field(v, 'mode') === 'verify') {
			const hash = field(v, 'hash');
			if (!/^\$2[aby]\$\d{2}\$/.test(hash)) {
				throw new Error('Hash bcrypt inválido / Invalid bcrypt hash');
			}
			return result({ matches: await bcryptCompare(password, hash) });
		}
		const cost = Number(field(v, 'cost'));
		if (![10, 12, 14].includes(cost)) {
			throw new Error('Custo não permitido / Unsupported cost');
		}
		return result({ hash: await bcryptHash(password, cost), cost }, 'bcrypt-hash.json');
	},
	undefined,
	text(
		'A senha e o hash são processados no navegador. O custo maior demora mais.',
		'The password and hash are processed in your browser. Higher cost takes longer.',
	),
);
