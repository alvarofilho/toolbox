import { text } from '@app/core/models/tool';

export const CATEGORIES = [
	{
		id: 'json',
		name: text('JSON e dados', 'JSON & data', undefined, 'categories'),
		icon: 'braces',
	},
	{
		id: 'converters',
		name: text('Conversores', 'Converters', 'Conversores', 'categories'),
		icon: 'arrows',
	},
	{
		id: 'generators',
		name: text('Geradores', 'Generators', undefined, 'categories'),
		icon: 'spark',
	},
	{
		id: 'security',
		name: text('Criptografia e segurança', 'Cryptography & security', undefined, 'categories'),
		icon: 'shield',
	},
	{
		id: 'development',
		name: text('Desenvolvimento', 'Development', undefined, 'categories'),
		icon: 'code',
	},
	{
		id: 'utilities',
		name: text('Utilitários gerais', 'General utilities', undefined, 'categories'),
		icon: 'spark',
	},
	{ id: 'text', name: text('Texto', 'Text', undefined, 'categories'), icon: 'type' },
	{
		id: 'brazilian',
		name: text('Ferramentas brasileiras', 'Brazilian tools', undefined, 'categories'),
		icon: 'document',
	},
	{ id: 'mercosur', name: text('Mercosul', 'Mercosur', undefined, 'categories'), icon: 'document' },
	{
		id: 'database',
		name: text('Banco de dados e .NET', 'Databases & .NET', undefined, 'categories'),
		icon: 'building',
	},
	{
		id: 'infrastructure',
		name: text('Redes e infraestrutura', 'Networks & infrastructure', undefined, 'categories'),
		icon: 'link',
	},
	{
		id: 'frontend',
		name: text('CSS e frontend', 'CSS & frontend', undefined, 'categories'),
		icon: 'grid',
	},
] as const;

export type ToolCategory = (typeof CATEGORIES)[number]['id'];
