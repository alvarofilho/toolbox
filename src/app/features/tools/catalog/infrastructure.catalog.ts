import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const INFRASTRUCTURE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ipv4',
		category: 'infrastructure',
		name: text('IPv4 Subnet Calculator', 'IPv4 Subnet Calculator', undefined, 'tools.ipv4'),
		description: text(
			'Calcule rede, máscara e intervalo de endereços IPv4.',
			'Calculate IPv4 network, mask and address range.',
			'Calcula red, máscara e intervalo de direcciones IPv4.',
			'tools.ipv4',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv4.tool').then((module) => module.definition),
	},
	{
		id: 'cidr',
		category: 'infrastructure',
		name: text('CIDR Calculator', 'CIDR Calculator', undefined, 'tools.cidr'),
		description: text(
			'Explore os limites de rede de um bloco CIDR IPv4.',
			'Inspect the network boundaries of an IPv4 CIDR block.',
			'Consulta los límites de red de un bloque CIDR IPv4.',
			'tools.cidr',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/cidr.tool').then((module) => module.definition),
	},
	{
		id: 'ipv6',
		category: 'infrastructure',
		name: text('IPv6 Calculator', 'IPv6 Calculator', undefined, 'tools.ipv6'),
		description: text(
			'Expanda endereços IPv6 e calcule seu prefixo de rede.',
			'Expand IPv6 addresses and calculate their network prefix.',
			'Expande direcciones IPv6 y calcula su prefijo de red.',
			'tools.ipv6',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv6.tool').then((module) => module.definition),
	},
	{
		id: 'chmod',
		category: 'infrastructure',
		name: text('Chmod Calculator', 'Chmod Calculator', undefined, 'tools.chmod'),
		description: text(
			'Converta permissões octais em representação simbólica.',
			'Convert octal permissions to symbolic notation.',
			'Convierte permisos octales a representación simbólica.',
			'tools.chmod',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/chmod.tool').then((module) => module.definition),
	},
	{
		id: 'docker-compose',
		category: 'infrastructure',
		name: text(
			'Docker Run para Docker Compose',
			'Docker Run to Docker Compose',
			undefined,
			'tools.docker-compose',
		),
		description: text(
			'Transforme um comando docker run POSIX em Docker Compose.',
			'Turn a POSIX docker run command into Docker Compose.',
			'Convierte un comando docker run POSIX en Docker Compose.',
			'tools.docker-compose',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/docker-compose.tool').then((module) => module.definition),
	},
	{
		id: 'compose-viewer',
		category: 'infrastructure',
		name: text(
			'Docker Compose Visualizer',
			'Docker Compose Visualizer',
			undefined,
			'tools.compose-viewer',
		),
		description: text(
			'Inspecione serviços, portas e dependências de um Compose.',
			'Inspect services, ports and dependencies in a Compose file.',
			'Inspecciona servicios, puertos y dependencias de un archivo Compose.',
			'tools.compose-viewer',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/compose-viewer.tool').then((module) => module.definition),
	},
	{
		id: 'env-diff',
		category: 'infrastructure',
		name: text('.env Diff', '.env Diff', undefined, 'tools.env-diff'),
		description: text(
			'Compare variáveis entre dois arquivos .env.',
			'Compare variables in two .env files.',
			'Compara variables entre dos archivos .env.',
			'tools.env-diff',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/env-diff.tool').then((module) => module.definition),
	},
	{
		id: 'env-validator',
		category: 'infrastructure',
		name: text('.env Validator', '.env Validator', undefined, 'tools.env-validator'),
		description: text(
			'Confira sintaxe e referências de variáveis em .env.',
			'Check syntax and variable references in .env files.',
			'Comprueba sintaxis y referencias de variables en archivos .env.',
			'tools.env-validator',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/env-validator.tool').then((module) => module.definition),
	},
	{
		id: 'gitignore',
		category: 'infrastructure',
		name: text('Gitignore Generator', 'Gitignore Generator', undefined, 'tools.gitignore'),
		description: text(
			'Combine templates locais para gerar um arquivo .gitignore.',
			'Combine local templates to generate a .gitignore file.',
			'Combina plantillas locales para generar un archivo .gitignore.',
			'tools.gitignore',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/gitignore.tool').then((module) => module.definition),
	},
	{
		id: 'kubernetes',
		category: 'infrastructure',
		name: text(
			'Kubernetes YAML Validator',
			'Kubernetes YAML Validator',
			undefined,
			'tools.kubernetes',
		),
		description: text(
			'Valide manifests YAML com schemas locais ou um schema próprio.',
			'Validate YAML manifests with local or custom schemas.',
			'Valida manifests YAML con schemas locales o uno propio.',
			'tools.kubernetes',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/kubernetes.tool').then((module) => module.definition),
	},
	{
		id: 'log-parser',
		category: 'infrastructure',
		name: text('Log Parser', 'Log Parser', undefined, 'tools.log-parser'),
		description: text(
			'Leia logs JSON Lines ou Apache/Nginx combined como dados.',
			'Read JSON Lines or Apache/Nginx combined logs as data.',
			'Lee logs JSON Lines o Apache/Nginx combined como datos.',
			'tools.log-parser',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/log-parser.tool').then((module) => module.definition),
	},
];
