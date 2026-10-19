import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const MERCOSUR_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'mercosur-data',
		category: 'mercosur',
		name: text('Gerador de dados do Mercosul', 'Mercosur Test Data Generator'),
		description: text(
			'Gerador de dados do Mercosul: processe e exporte localmente.',
			'Mercosur Test Data Generator: process and export locally.',
			'Gerador de dados do Mercosul: procesa y exporta localmente.',
		),
		icon: 'code',
		keywords: 'Gerador de dados do Mercosul Mercosur Test Data Generator',
		available: true,
		isNew: true,
		loadDefinition: () =>
			import('../mercosur/mercosur-data.tool').then((module) => module.definition),
	},
];
