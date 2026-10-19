import { parse as shellParse } from 'shell-quote';

import { stringify } from 'yaml';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

export function dockerCompose(command: string): unknown {
	const tokens = shellParse(command, (k) => `\${${k}}`);
	if (tokens.some((t) => typeof t !== 'string')) {
		throw new Error('Operadores shell não são aceitos / Shell operators are not accepted');
	}
	const args = tokens.filter((t): t is string => typeof t === 'string');
	if (args.shift() !== 'docker' || args.shift() !== 'run') {
		throw new Error('Use docker run ...');
	}
	const service: Record<string, unknown> = {},
		ports: string[] = [],
		volumes: string[] = [],
		environment: string[] = [],
		networks: string[] = [];
	let name = 'app';
	while (args.length) {
		const raw = args.shift();
		if (!raw) {
			break;
		}
		if (raw === '--') {
			break;
		}
		if (!raw.startsWith('-')) {
			service['image'] = raw;
			break;
		}
		const equal = raw.indexOf('='),
			flag = equal >= 0 ? raw.slice(0, equal) : raw;
		if (['-d', '--detach', '--rm', '-it', '-i', '-t', '--interactive', '--tty'].includes(flag)) {
			if (flag.includes('i')) {
				service['stdin_open'] = true;
			}
			if (flag === '-t' || flag === '-it' || flag === '--tty') {
				service['tty'] = true;
			}
			continue;
		}
		const value = equal >= 0 ? raw.slice(equal + 1) : args.shift();
		if (!value) {
			throw new Error(`Valor ausente / Missing value: ${flag}`);
		}
		switch (flag) {
			case '--name':
				name = value;
				break;
			case '-p':
			case '--publish':
				ports.push(value);
				break;
			case '-v':
			case '--volume':
				volumes.push(value);
				break;
			case '-e':
			case '--env':
				environment.push(value);
				break;
			case '--network':
				networks.push(value);
				break;
			case '--restart':
				service['restart'] = value;
				break;
			case '-w':
			case '--workdir':
				service['working_dir'] = value;
				break;
			case '-u':
			case '--user':
				service['user'] = value;
				break;
			case '--entrypoint':
				service['entrypoint'] = [value];
				break;
			case '--hostname':
				service['hostname'] = value;
				break;
			case '--env-file':
				service['env_file'] = [value];
				break;
			default:
				throw new Error(`Opção não suportada / Unsupported option: ${flag}`);
		}
	}
	if (!service['image']) {
		const image = args.shift();
		if (image) {
			service['image'] = image;
		}
	}
	if (!service['image']) {
		throw new Error('Imagem ausente / Missing image');
	}
	if (args.length) {
		service['command'] = args;
	}
	if (ports.length) {
		service['ports'] = ports;
	}
	if (volumes.length) {
		service['volumes'] = volumes;
	}
	if (environment.length) {
		service['environment'] = environment;
	}
	if (networks.length) {
		service['networks'] = networks;
	}
	return {
		services: { [name]: service },
		...(networks.length
			? { networks: Object.fromEntries(networks.map((n) => [n, { external: true }])) }
			: {}),
	};
}

export const definition = tool(
	'docker-compose',
	[source],
	(v) => result(stringify(dockerCompose(field(v, 'input'))), 'compose.yaml'),
	{
		input:
			'docker run -d --name web -p 8080:80 -e NODE_ENV=production -v ./data:/data nginx:alpine',
	},
	text(
		'Converte comandos docker run POSIX. Opções sem correspondência suportada são rejeitadas com uma mensagem.',
		'Converts POSIX docker run commands. Options without a supported mapping are rejected with a message.',
		undefined,
		'tools.docker-compose',
	),
);
