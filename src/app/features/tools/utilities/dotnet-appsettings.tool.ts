import { field, text } from '@app/core/models/tool';

import { input, number } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'dotnet-appsettings',
	[
		input('server', 'Servidor', 'Server', 'localhost', 'text'),
		number('port', 'Porta', 'Port', 1433, 1, 65535),
		input('database', 'Banco de dados', 'Database', 'AppDb', 'text'),
		input('username', 'Usuário', 'Username', 'app_user', 'text'),
		input('password', 'Senha', 'Password', '', 'password'),
		input('environment', 'Nome da conexão', 'Connection name', 'DefaultConnection', 'text'),
	],
	(v) => {
		const connectionName = field(v, 'environment').trim();
		if (!connectionName) {
			throw new Error('Informe o nome da conexão / Enter a connection name');
		}
		const quoteConnectionValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
		const server = quoteConnectionValue(`${field(v, 'server')},${field(v, 'port')}`);
		const database = quoteConnectionValue(field(v, 'database'));
		const username = quoteConnectionValue(field(v, 'username'));
		const password = quoteConnectionValue(field(v, 'password'));
		const settings = {
			ConnectionStrings: {
				[connectionName]: `Server=${server};Database=${database};User Id=${username};Password=${password};Encrypt=True;TrustServerCertificate=False;`,
			},
		};
		return result(settings, 'appsettings.json');
	},
	undefined,
	text(
		'Não compartilhe o arquivo se incluir uma senha real. Prefira secrets do ambiente em produção.',
		'Do not share the file if it contains a real password. Prefer environment secrets in production.',
	),
);
