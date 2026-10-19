import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const INFRASTRUCTURE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ipv4',
		category: 'infrastructure',
		name: text('IPv4 Subnet Calculator', 'IPv4 Subnet Calculator'),
		description: text(
			'Calcule rede, máscara e intervalo de endereços IPv4.',
			'Calculate IPv4 network, mask and address range.',
			'Calcula red, máscara e intervalo de direcciones IPv4.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv4.tool').then((module) => module.definition),
	},
	{
		id: 'cidr',
		category: 'infrastructure',
		name: text('CIDR Calculator', 'CIDR Calculator'),
		description: text(
			'Explore os limites de rede de um bloco CIDR IPv4.',
			'Inspect the network boundaries of an IPv4 CIDR block.',
			'Consulta los límites de red de un bloque CIDR IPv4.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/cidr.tool').then((module) => module.definition),
	},
	{
		id: 'ipv6',
		category: 'infrastructure',
		name: text('IPv6 Calculator', 'IPv6 Calculator'),
		description: text(
			'Expanda endereços IPv6 e calcule seu prefixo de rede.',
			'Expand IPv6 addresses and calculate their network prefix.',
			'Expande direcciones IPv6 y calcula su prefijo de red.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../infrastructure/ipv6.tool').then((module) => module.definition),
	},
	{
		id: 'chmod',
		category: 'infrastructure',
		name: text('Chmod Calculator', 'Chmod Calculator'),
		description: text(
			'Converta permissões octais em representação simbólica.',
			'Convert octal permissions to symbolic notation.',
			'Convierte permisos octales a representación simbólica.',
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
		name: text('Docker Run para Docker Compose', 'Docker Run to Docker Compose'),
		description: text(
			'Transforme um comando docker run POSIX em Docker Compose.',
			'Turn a POSIX docker run command into Docker Compose.',
			'Convierte un comando docker run POSIX en Docker Compose.',
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
		name: text('Docker Compose Visualizer', 'Docker Compose Visualizer'),
		description: text(
			'Inspecione serviços, portas e dependências de um Compose.',
			'Inspect services, ports and dependencies in a Compose file.',
			'Inspecciona servicios, puertos y dependencias de un archivo Compose.',
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
		name: text('.env Diff', '.env Diff'),
		description: text(
			'Compare variáveis entre dois arquivos .env.',
			'Compare variables in two .env files.',
			'Compara variables entre dos archivos .env.',
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
		name: text('.env Validator', '.env Validator'),
		description: text(
			'Confira sintaxe e referências de variáveis em .env.',
			'Check syntax and variable references in .env files.',
			'Comprueba sintaxis y referencias de variables en archivos .env.',
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
		name: text('Gitignore Generator', 'Gitignore Generator'),
		description: text(
			'Combine templates locais para gerar um arquivo .gitignore.',
			'Combine local templates to generate a .gitignore file.',
			'Combina plantillas locales para generar un archivo .gitignore.',
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
		name: text('Kubernetes YAML Validator', 'Kubernetes YAML Validator'),
		description: text(
			'Valide manifests YAML com schemas locais ou um schema próprio.',
			'Validate YAML manifests with local or custom schemas.',
			'Valida manifests YAML con schemas locales o uno propio.',
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
		name: text('Log Parser', 'Log Parser'),
		description: text(
			'Leia logs JSON Lines ou Apache/Nginx combined como dados.',
			'Read JSON Lines or Apache/Nginx combined logs as data.',
			'Lee logs JSON Lines o Apache/Nginx combined como datos.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../infrastructure/log-parser.tool').then((module) => module.definition),
	},
];
