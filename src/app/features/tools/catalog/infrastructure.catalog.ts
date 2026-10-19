import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const INFRASTRUCTURE_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'ipv4',
		category: 'infrastructure',
		name: text('IPv4 Subnet Calculator', 'IPv4 Subnet Calculator'),
		description: text(
			'IPv4 Subnet Calculator: processe e exporte localmente.',
			'IPv4 Subnet Calculator: process and export locally.',
			'IPv4 Subnet Calculator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'IPv4 Subnet Calculator IPv4 Subnet Calculator',
		available: true,
		isNew: true,
		loadDefinition: () => import('../infrastructure/ipv4.tool').then((module) => module.definition),
	},
	{
		id: 'cidr',
		category: 'infrastructure',
		name: text('CIDR Calculator', 'CIDR Calculator'),
		description: text(
			'CIDR Calculator: processe e exporte localmente.',
			'CIDR Calculator: process and export locally.',
			'CIDR Calculator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'CIDR Calculator CIDR Calculator',
		available: true,
		isNew: true,
		loadDefinition: () => import('../infrastructure/cidr.tool').then((module) => module.definition),
	},
	{
		id: 'ipv6',
		category: 'infrastructure',
		name: text('IPv6 Calculator', 'IPv6 Calculator'),
		description: text(
			'IPv6 Calculator: processe e exporte localmente.',
			'IPv6 Calculator: process and export locally.',
			'IPv6 Calculator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'IPv6 Calculator IPv6 Calculator',
		available: true,
		isNew: true,
		loadDefinition: () => import('../infrastructure/ipv6.tool').then((module) => module.definition),
	},
	{
		id: 'chmod',
		category: 'infrastructure',
		name: text('Chmod Calculator', 'Chmod Calculator'),
		description: text(
			'Chmod Calculator: processe e exporte localmente.',
			'Chmod Calculator: process and export locally.',
			'Chmod Calculator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Chmod Calculator Chmod Calculator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/chmod.tool').then((module) => module.definition),
	},
	{
		id: 'docker-compose',
		category: 'infrastructure',
		name: text('Docker Run para Docker Compose', 'Docker Run to Docker Compose'),
		description: text(
			'Docker Run para Docker Compose: processe e exporte localmente.',
			'Docker Run to Docker Compose: process and export locally.',
			'Docker Run para Docker Compose: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Docker Run para Docker Compose Docker Run to Docker Compose',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/docker-compose.tool').then((module) => module.definition),
	},
	{
		id: 'compose-viewer',
		category: 'infrastructure',
		name: text('Docker Compose Visualizer', 'Docker Compose Visualizer'),
		description: text(
			'Docker Compose Visualizer: processe e exporte localmente.',
			'Docker Compose Visualizer: process and export locally.',
			'Docker Compose Visualizer: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Docker Compose Visualizer Docker Compose Visualizer',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/compose-viewer.tool').then((module) => module.definition),
	},
	{
		id: 'env-diff',
		category: 'infrastructure',
		name: text('.env Diff', '.env Diff'),
		description: text(
			'.env Diff: processe e exporte localmente.',
			'.env Diff: process and export locally.',
			'.env Diff: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: '.env Diff .env Diff',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/env-diff.tool').then((module) => module.definition),
	},
	{
		id: 'env-validator',
		category: 'infrastructure',
		name: text('.env Validator', '.env Validator'),
		description: text(
			'.env Validator: processe e exporte localmente.',
			'.env Validator: process and export locally.',
			'.env Validator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: '.env Validator .env Validator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/env-validator.tool').then((module) => module.definition),
	},
	{
		id: 'gitignore',
		category: 'infrastructure',
		name: text('Gitignore Generator', 'Gitignore Generator'),
		description: text(
			'Gitignore Generator: processe e exporte localmente.',
			'Gitignore Generator: process and export locally.',
			'Gitignore Generator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Gitignore Generator Gitignore Generator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/gitignore.tool').then((module) => module.definition),
	},
	{
		id: 'kubernetes',
		category: 'infrastructure',
		name: text('Kubernetes YAML Validator', 'Kubernetes YAML Validator'),
		description: text(
			'Kubernetes YAML Validator: processe e exporte localmente.',
			'Kubernetes YAML Validator: process and export locally.',
			'Kubernetes YAML Validator: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Kubernetes YAML Validator Kubernetes YAML Validator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/kubernetes.tool').then((module) => module.definition),
	},
	{
		id: 'log-parser',
		category: 'infrastructure',
		name: text('Log Parser', 'Log Parser'),
		description: text(
			'Log Parser: processe e exporte localmente.',
			'Log Parser: process and export locally.',
			'Log Parser: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Log Parser Log Parser',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../infrastructure/log-parser.tool').then((module) => module.definition),
	},
];
