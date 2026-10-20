import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const MERCOSUR_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'mercosur-data',
		category: 'mercosur',
		name: 'tools.mercosur-data.mercosur_test_data_generator',
		description: 'tools.mercosur-data.generate_fictional_people_and_companies_fo',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../mercosur/mercosur-data.tool').then((module) => module.definition),
	},
];
