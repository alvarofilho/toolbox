import { field } from '@app/core/models/tool';

import { input, number } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool(
	'dotnet-appsettings',
	[
		input('server', 'tools.dotnet-appsettings.server', 'localhost', 'text'),
		number('port', 'tools.dotnet-appsettings.port', 1433, 1, 65535, undefined),
		input('database', 'tools.dotnet-appsettings.database', 'AppDb', 'text'),
		input('username', 'tools.dotnet-appsettings.username', 'app_user', 'text'),
		input('password', 'tools.dotnet-appsettings.password', '', 'password'),
		input('environment', 'tools.dotnet-appsettings.connection_name', 'DefaultConnection', 'text'),
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
	'tools.dotnet-appsettings.do_not_share_the_file_if_it_contains_a_rea',
);
