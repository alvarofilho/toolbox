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
		id: 'pdf',
		name: 'categories.pdf_tools',
		icon: 'document',
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
		name: 'categories.databases_sql',
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

export const PDF_TOOL_GROUPS = [
	{ id: 'pages', name: 'categories.pdf_pages', toolIds: ['pdf-pages'] },
	{ id: 'conversion', name: 'categories.pdf_conversion', toolIds: ['pdf-convert'] },
	{ id: 'forms', name: 'categories.pdf_forms', toolIds: ['pdf-forms'] },
	{ id: 'markups', name: 'categories.pdf_markups', toolIds: ['pdf-overlay'] },
	{
		id: 'inspection',
		name: 'categories.pdf_inspection',
		toolIds: ['pdf-metadata', 'pdf-inspector'],
	},
] as const;
