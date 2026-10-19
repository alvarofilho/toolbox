import { field } from '@app/core/models/tool';

import { input } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

function base64(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

export const definition = tool(
	'basic-auth',
	[
		input('username', 'Usuário', 'Username', '', 'text'),
		input('password', 'Senha', 'Password', '', 'password'),
	],
	(v) => {
		const value = `${field(v, 'username')}:${field(v, 'password')}`;
		if (value === ':') {
			throw new Error('Informe usuário e senha / Enter a username and password');
		}
		return result({ header: `Authorization: Basic ${base64(value)}`, encoded: base64(value) });
	},
);
