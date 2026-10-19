import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const MERCOSUR_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'mercosur-data',
		category: 'mercosur',
		name: text('Gerador de dados do Mercosul', 'Mercosur Test Data Generator'),
		description: text(
			'Gere pessoas e empresas fictícias para países do Mercosul.',
			'Generate fictional people and companies for Mercosur countries.',
			'Genera personas y empresas ficticias para países del Mercosur.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../mercosur/mercosur-data.tool').then((module) => module.definition),
	},
];
