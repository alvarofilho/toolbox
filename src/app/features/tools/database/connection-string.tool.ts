import { tool, result } from '@app/features/tools/_shared/definition';

import { input, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'connection-string',
	[
		select(
			'provider',
			'Provedor',
			'Provider',
			[
				['sqlserver', 'SQL Server / ADO.NET', 'SQL Server / ADO.NET'],
				['postgresql', 'PostgreSQL / Npgsql', 'PostgreSQL / Npgsql'],
				['mysql', 'MySQL / MySqlConnector', 'MySQL / MySqlConnector'],
				['sqlite', 'SQLite / Microsoft.Data.Sqlite', 'SQLite / Microsoft.Data.Sqlite'],
			],
			undefined,
			'tools.connection-string',
		),
		input('host', 'Servidor', 'Host', 'localhost', 'text', 'tools.connection-string'),
		input('port', 'Porta (opcional)', 'Port (optional)', '', 'text', 'tools.connection-string'),
		input(
			'database',
			'Banco ou caminho SQLite',
			'Database or SQLite path',
			'app',
			'text',
			'tools.connection-string',
		),
		input('user', 'Usuário', 'User', 'app', 'text', 'tools.connection-string'),
		input('password', 'Senha', 'Password', '', 'password', 'tools.connection-string'),
		select(
			'tls',
			'TLS',
			'TLS',
			[
				['true', 'Exigir TLS', 'Require TLS'],
				['false', 'Desabilitado', 'Disabled'],
			],
			undefined,
			'tools.connection-string',
		),
	],
	(v) => {
		const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
		const port = field(v, 'port');
		if (port && (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
			throw new Error('Porta inválida / Invalid port');
		}
		const host = field(v, 'host'),
			db = q(field(v, 'database')),
			user = q(field(v, 'user')),
			pw = q(field(v, 'password')),
			tls = field(v, 'tls') === 'true';
		switch (field(v, 'provider')) {
			case 'sqlserver':
				return result(
					`Server=${q(host + (port ? `,${port}` : ''))};Database=${db};User Id=${user};Password=${pw};Encrypt=${tls ? 'True' : 'False'};TrustServerCertificate=False;`,
					'connection.txt',
				);
			case 'postgresql':
				return result(
					`Host=${q(host)};Port=${port || '5432'};Database=${db};Username=${user};Password=${pw};SSL Mode=${tls ? 'VerifyFull' : 'Disable'};`,
					'connection.txt',
				);
			case 'mysql':
				return result(
					`Server=${q(host)};Port=${port || '3306'};Database=${db};User ID=${user};Password=${pw};SslMode=${tls ? 'VerifyFull' : 'Disabled'};`,
					'connection.txt',
				);
			case 'sqlite':
				return result(`Data Source=${db};Mode=ReadWriteCreate;`, 'connection.txt');
			default:
				throw new Error('Provedor inválido / Invalid provider');
		}
	},
);
