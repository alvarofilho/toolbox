import { field, text } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

export const definition = tool(
	'password-strength',
	[source],
	(v) => {
		const password = field(v, 'input');
		const classes = [
			/[a-z]/.test(password),
			/[A-Z]/.test(password),
			/\d/.test(password),
			/[^A-Za-z0-9]/.test(password),
		].filter(Boolean).length;
		const alphabetSize =
			(/[a-z]/.test(password) ? 26 : 0) +
			(/[A-Z]/.test(password) ? 26 : 0) +
			(/\d/.test(password) ? 10 : 0) +
			(/[^A-Za-z0-9]/.test(password) ? 32 : 0);
		const entropyBits = alphabetSize ? Math.round(password.length * Math.log2(alphabetSize)) : 0;
		const score = password.length < 8 ? 0 : Math.min(4, Math.floor(entropyBits / 25));
		return result({
			length: password.length,
			characterGroups: classes,
			estimatedEntropyBits: entropyBits,
			score,
			rating: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][score],
			checks: {
				longEnough: password.length >= 12,
				mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
				hasNumber: /\d/.test(password),
				hasSymbol: /[^A-Za-z0-9]/.test(password),
			},
		});
	},
	undefined,
	text(
		'Estimativa heurística local; não substitui um verificador com lista de senhas vazadas.',
		'Local heuristic estimate; it does not replace a breached-password check.',
		undefined,
		'tools.password-strength',
	),
);
