export const CATEGORIES = [
	{
		id: 'json',
		name: 'categories.json_data',
		icon: 'braces',
	},
	{
		id: 'converters',
		name: 'categories.converters',
		icon: 'arrows',
	},
	{
		id: 'generators',
		name: 'categories.generators',
		icon: 'spark',
	},
	{
		id: 'security',
		name: 'categories.cryptography_security',
		icon: 'shield',
	},
	{
		id: 'development',
		name: 'categories.development',
		icon: 'code',
	},
	{
		id: 'utilities',
		name: 'categories.general_utilities',
		icon: 'spark',
	},
	{ id: 'text', name: 'categories.text', icon: 'type' },
	{
		id: 'brazilian',
		name: 'categories.brazilian_tools',
		icon: 'document',
	},
	{ id: 'mercosur', name: 'categories.mercosur', icon: 'document' },
	{
		id: 'database',
		name: 'categories.databases_net',
		icon: 'building',
	},
	{
		id: 'infrastructure',
		name: 'categories.networks_infrastructure',
		icon: 'link',
	},
	{
		id: 'frontend',
		name: 'categories.css_frontend',
		icon: 'grid',
	},
] as const;

export type ToolCategory = (typeof CATEGORIES)[number]['id'];
