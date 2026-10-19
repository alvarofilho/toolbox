import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const FRONTEND_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'color',
		category: 'frontend',
		name: text('Color Converter', 'Color Converter', undefined, 'tools.color'),
		description: text(
			'Converta cores CSS entre hexadecimal, RGB e HSL.',
			'Convert CSS colors between hexadecimal, RGB and HSL.',
			'Convierte colores CSS entre hexadecimal, RGB y HSL.',
			'tools.color',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/color.tool').then((module) => module.definition),
	},
	{
		id: 'gradient',
		category: 'frontend',
		name: text('CSS Gradient Generator', 'CSS Gradient Generator', undefined, 'tools.gradient'),
		description: text(
			'Crie um gradiente CSS com duas cores e um ângulo.',
			'Build a CSS gradient with two colors and an angle.',
			'Crea un degradado CSS con dos colores y un ángulo.',
			'tools.gradient',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/gradient.tool').then((module) => module.definition),
	},
	{
		id: 'box-shadow',
		category: 'frontend',
		name: text(
			'CSS Box Shadow Generator',
			'CSS Box Shadow Generator',
			undefined,
			'tools.box-shadow',
		),
		description: text(
			'Ajuste deslocamento, desfoque, expansão e cor de uma sombra CSS.',
			"Adjust a CSS shadow's offset, blur, spread and color.",
			'Ajusta desplazamiento, desenfoque, extensión y color de una sombra CSS.',
			'tools.box-shadow',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/box-shadow.tool').then((module) => module.definition),
	},
	{
		id: 'clamp',
		category: 'frontend',
		name: text('CSS Clamp Calculator', 'CSS Clamp Calculator', undefined, 'tools.clamp'),
		description: text(
			'Calcule CSS clamp para variar um tamanho entre dois viewports.',
			'Calculate CSS clamp for sizes between two viewports.',
			'Calcula CSS clamp para variar un tamaño entre dos viewports.',
			'tools.clamp',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/clamp.tool').then((module) => module.definition),
	},
	{
		id: 'flexbox',
		category: 'frontend',
		name: text('Flexbox Playground', 'Flexbox Playground', undefined, 'tools.flexbox'),
		description: text(
			'Experimente alinhamento, direção e espaçamento em um layout Flexbox.',
			'Explore alignment, direction and spacing in a Flexbox layout.',
			'Explora alineación, dirección y espaciado en un diseño Flexbox.',
			'tools.flexbox',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/flexbox.tool').then((module) => module.definition),
	},
	{
		id: 'css-grid',
		category: 'frontend',
		name: text('CSS Grid Playground', 'CSS Grid Playground', undefined, 'tools.css-grid'),
		description: text(
			'Configure colunas, linhas e espaçamento de um CSS Grid.',
			'Configure columns, rows and spacing in a CSS Grid.',
			'Configura columnas, filas y espaciado de un CSS Grid.',
			'tools.css-grid',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/css-grid.tool').then((module) => module.definition),
	},
	{
		id: 'contrast',
		category: 'frontend',
		name: text('WCAG Contrast Checker', 'WCAG Contrast Checker', undefined, 'tools.contrast'),
		description: text(
			'Compare duas cores e confira as relações de contraste WCAG.',
			'Compare two colors and check WCAG contrast ratios.',
			'Compara dos colores y comprueba las relaciones de contraste WCAG.',
			'tools.contrast',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/contrast.tool').then((module) => module.definition),
	},
	{
		id: 'favicon',
		category: 'frontend',
		name: text('Favicon Generator', 'Favicon Generator', undefined, 'tools.favicon'),
		description: text(
			'Gere ícones PNG, ICO e manifest em um pacote ZIP.',
			'Generate PNG icons, ICO and a manifest in a ZIP bundle.',
			'Genera iconos PNG, ICO y un manifest en un paquete ZIP.',
			'tools.favicon',
		),
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/favicon.tool').then((module) => module.definition),
	},
];
