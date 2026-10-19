import { text } from '@app/core/models/tool';

export const CATEGORIES = [
	{ id: 'json', name: text('JSON e dados', 'JSON & data'), icon: 'braces' },
	{
		id: 'converters',
		name: text('Codificação e conversores', 'Encoding & converters'),
		icon: 'arrows',
	},
	{ id: 'generators', name: text('Geradores', 'Generators'), icon: 'spark' },
	{
		id: 'security',
		name: text('Criptografia e segurança', 'Cryptography & security'),
		icon: 'shield',
	},
	{ id: 'development', name: text('Desenvolvimento', 'Development'), icon: 'code' },
	{ id: 'utilities', name: text('Utilitários gerais', 'General utilities'), icon: 'spark' },
	{ id: 'text', name: text('Texto', 'Text'), icon: 'type' },
	{ id: 'brazilian', name: text('Ferramentas brasileiras', 'Brazilian tools'), icon: 'document' },
	{ id: 'mercosur', name: text('Mercosul', 'Mercosur'), icon: 'document' },
	{ id: 'database', name: text('Banco de dados e .NET', 'Databases & .NET'), icon: 'building' },
	{
		id: 'infrastructure',
		name: text('Redes e infraestrutura', 'Networks & infrastructure'),
		icon: 'link',
	},
	{ id: 'frontend', name: text('CSS e frontend', 'CSS & frontend'), icon: 'grid' },
] as const;

export type ToolCategory = (typeof CATEGORIES)[number]['id'];
