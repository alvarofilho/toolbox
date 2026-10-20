import { tool, result } from '@app/features/tools/_shared/definition';

import { input, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'connection-string',
	[
		select(
			'provider',
			'tools.connection-string.provider',
			[
				['sqlserver', 'tools.connection-string.sql_server_ado_net'],
				['postgresql', 'tools.connection-string.postgresql_npgsql'],
				['mysql', 'tools.connection-string.mysql_mysqlconnector'],
				['sqlite', 'tools.connection-string.sqlite_microsoft_data_sqlite'],
			],
			undefined,
		),
		input('host', 'tools.connection-string.host', 'localhost', 'text'),
		input('port', 'tools.connection-string.port_optional', '', 'text'),
		input('database', 'tools.connection-string.database_or_sqlite_path', 'app', 'text'),
		input('user', 'tools.connection-string.user', 'app', 'text'),
		input('password', 'tools.connection-string.password', '', 'password'),
		select(
			'tls',
			'tools.connection-string.tls',
			[
				['true', 'tools.connection-string.require_tls'],
				['false', 'tools.connection-string.disabled'],
			],
			undefined,
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
