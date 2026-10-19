import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const FRONTEND_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'color',
		category: 'frontend',
		name: text('Color Converter', 'Color Converter'),
		description: text(
			'Converta cores CSS entre hexadecimal, RGB e HSL.',
			'Convert CSS colors between hexadecimal, RGB and HSL.',
			'Convierte colores CSS entre hexadecimal, RGB y HSL.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/color.tool').then((module) => module.definition),
	},
	{
		id: 'gradient',
		category: 'frontend',
		name: text('CSS Gradient Generator', 'CSS Gradient Generator'),
		description: text(
			'Crie um gradiente CSS com duas cores e um ângulo.',
			'Build a CSS gradient with two colors and an angle.',
			'Crea un degradado CSS con dos colores y un ángulo.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/gradient.tool').then((module) => module.definition),
	},
	{
		id: 'box-shadow',
		category: 'frontend',
		name: text('CSS Box Shadow Generator', 'CSS Box Shadow Generator'),
		description: text(
			'Ajuste deslocamento, desfoque, expansão e cor de uma sombra CSS.',
			"Adjust a CSS shadow's offset, blur, spread and color.",
			'Ajusta desplazamiento, desenfoque, extensión y color de una sombra CSS.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/box-shadow.tool').then((module) => module.definition),
	},
	{
		id: 'clamp',
		category: 'frontend',
		name: text('CSS Clamp Calculator', 'CSS Clamp Calculator'),
		description: text(
			'Calcule CSS clamp para variar um tamanho entre dois viewports.',
			'Calculate CSS clamp for sizes between two viewports.',
			'Calcula CSS clamp para variar un tamaño entre dos viewports.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/clamp.tool').then((module) => module.definition),
	},
	{
		id: 'flexbox',
		category: 'frontend',
		name: text('Flexbox Playground', 'Flexbox Playground'),
		description: text(
			'Experimente alinhamento, direção e espaçamento em um layout Flexbox.',
			'Explore alignment, direction and spacing in a Flexbox layout.',
			'Explora alineación, dirección y espaciado en un diseño Flexbox.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/flexbox.tool').then((module) => module.definition),
	},
	{
		id: 'css-grid',
		category: 'frontend',
		name: text('CSS Grid Playground', 'CSS Grid Playground'),
		description: text(
			'Configure colunas, linhas e espaçamento de um CSS Grid.',
			'Configure columns, rows and spacing in a CSS Grid.',
			'Configura columnas, filas y espaciado de un CSS Grid.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/css-grid.tool').then((module) => module.definition),
	},
	{
		id: 'contrast',
		category: 'frontend',
		name: text('WCAG Contrast Checker', 'WCAG Contrast Checker'),
		description: text(
			'Compare duas cores e confira as relações de contraste WCAG.',
			'Compare two colors and check WCAG contrast ratios.',
			'Compara dos colores y comprueba las relaciones de contraste WCAG.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/contrast.tool').then((module) => module.definition),
	},
	{
		id: 'favicon',
		category: 'frontend',
		name: text('Favicon Generator', 'Favicon Generator'),
		description: text(
			'Gere ícones PNG, ICO e manifest em um pacote ZIP.',
			'Generate PNG icons, ICO and a manifest in a ZIP bundle.',
			'Genera iconos PNG, ICO y un manifest en un paquete ZIP.',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/favicon.tool').then((module) => module.definition),
	},
];
