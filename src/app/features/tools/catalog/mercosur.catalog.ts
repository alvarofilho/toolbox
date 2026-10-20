import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const MERCOSUR_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'mercosur-data',
		category: 'country-data',
		name: 'tools.mercosur-data.mercosur_test_data_generator',
		description: 'tools.mercosur-data.generate_fictional_people_and_companies_fo',
		icon: 'users',
		keywords:
			'mercosur mercosul país country pessoa empresa dados sintéticos fictícios teste argentina bolivia brasil paraguai uruguai venezuela cabo verde cape verde estados unidos united states usa datos sintéticos datos de prueba personas empresas prueba synthetic test data people company json csv sql',
		available: true,

		loadDefinition: () =>
			import('../mercosur/mercosur-data.tool').then((module) => module.definition),
	},
];
