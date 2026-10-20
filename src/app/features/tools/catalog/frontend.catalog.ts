import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const FRONTEND_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'color',
		category: 'frontend',
		name: 'tools.color.color_converter',
		description: 'tools.color.convert_css_colors_between_hexadecimal_rgb',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/color.tool').then((module) => module.definition),
	},
	{
		id: 'gradient',
		category: 'frontend',
		name: 'tools.gradient.css_gradient_generator',
		description: 'tools.gradient.build_a_css_gradient_with_two_colors_and_a',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/gradient.tool').then((module) => module.definition),
	},
	{
		id: 'box-shadow',
		category: 'frontend',
		name: 'tools.box-shadow.css_box_shadow_generator',
		description: 'tools.box-shadow.adjust_a_css_shadow_s_offset_blur_spread_a',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/box-shadow.tool').then((module) => module.definition),
	},
	{
		id: 'clamp',
		category: 'frontend',
		name: 'tools.clamp.css_clamp_calculator',
		description: 'tools.clamp.calculate_css_clamp_for_sizes_between_two_',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/clamp.tool').then((module) => module.definition),
	},
	{
		id: 'flexbox',
		category: 'frontend',
		name: 'tools.flexbox.flexbox_playground',
		description: 'tools.flexbox.explore_alignment_direction_and_spacing_in',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/flexbox.tool').then((module) => module.definition),
	},
	{
		id: 'css-grid',
		category: 'frontend',
		name: 'tools.css-grid.css_grid_playground',
		description: 'tools.css-grid.configure_columns_rows_and_spacing_in_a_cs',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/css-grid.tool').then((module) => module.definition),
	},
	{
		id: 'contrast',
		category: 'frontend',
		name: 'tools.contrast.wcag_contrast_checker',
		description: 'tools.contrast.compare_two_colors_and_check_wcag_contrast',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/contrast.tool').then((module) => module.definition),
	},
	{
		id: 'favicon',
		category: 'frontend',
		name: 'tools.favicon.favicon_generator',
		description: 'tools.favicon.generate_png_icons_ico_and_a_manifest_in_a',
		icon: 'code',
		keywords: '',
		available: true,

		loadDefinition: () => import('../frontend/favicon.tool').then((module) => module.definition),
	},
];
