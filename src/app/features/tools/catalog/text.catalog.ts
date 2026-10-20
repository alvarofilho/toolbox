import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const TEXT_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'text-diff',
		name: 'tools.text-diff.text_diff',
		description: 'tools.text-diff.see_differences_between_two_versions_of_te',
		category: 'text',
		icon: 'diff',
		keywords: 'comparar diferença texto linhas',
		available: true,
		loadDefinition: () => import('../text/text-diff.tool').then((module) => module.definition),
	},
	{
		id: 'case',
		name: 'tools.case.case_converter',
		description: 'tools.case.switch_between_camelcase_snake_case_and_mo',
		category: 'text',
		icon: 'type',
		keywords: 'case maiúsculas minúsculas pascal kebab slug',
		available: true,
		loadDefinition: () => import('../text/case.tool').then((module) => module.definition),
	},
	{
		id: 'word-count',
		category: 'text',
		name: 'tools.word-count.word_and_character_counter',
		description: 'tools.word-count.count_words_characters_and_lines_in_text',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/word-count.tool').then((module) => module.definition),
	},
	{
		id: 'dedupe-lines',
		category: 'text',
		name: 'tools.dedupe-lines.remove_duplicate_lines',
		description: 'tools.dedupe-lines.remove_duplicate_lines_with_exact_or_norma',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/dedupe-lines.tool').then((module) => module.definition),
	},
	{
		id: 'sort-lines',
		category: 'text',
		name: 'tools.sort-lines.sort_lines',
		description: 'tools.sort-lines.sort_lines_by_text_or_numeric_value',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/sort-lines.tool').then((module) => module.definition),
	},
	{
		id: 'slug',
		category: 'text',
		name: 'tools.slug.slug_generator',
		description: 'tools.slug.turn_a_title_into_a_url_slug',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/slug.tool').then((module) => module.definition),
	},
	{
		id: 'csv-cleaner',
		category: 'text',
		name: 'tools.csv-cleaner.csv_cleaner',
		description: 'tools.csv-cleaner.clean_csv_whitespace_and_duplicates_and_ch',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/csv-cleaner.tool').then((module) => module.definition),
	},
	{
		id: 'svg-optimizer',
		category: 'text',
		name: 'tools.svg-optimizer.svg_optimizer',
		description: 'tools.svg-optimizer.sanitize_and_optimize_svg_with_an_isolated',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/svg-optimizer.tool').then((module) => module.definition),
	},
	{
		id: 'image-converter',
		category: 'text',
		name: 'tools.image-converter.image_converter',
		description: 'tools.image-converter.convert_raster_images_to_webp_png_or_jpeg',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../text/image-converter.tool').then((module) => module.definition),
	},
	{
		id: 'image-compressor',
		category: 'text',
		name: 'tools.image-compressor.image_compressor',
		description: 'tools.image-compressor.adjust_image_dimensions_and_quality_and_co',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../text/image-compressor.tool').then((module) => module.definition),
	},
	{
		id: 'image-exif',
		category: 'text',
		name: 'tools.image-exif.image_exif_viewer',
		description: 'tools.image-exif.read_exif_metadata_from_a_local_image',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/image-exif.tool').then((module) => module.definition),
	},
	{
		id: 'pdf-metadata',
		category: 'text',
		name: 'tools.pdf-metadata.pdf_metadata_viewer',
		description: 'tools.pdf-metadata.read_a_pdf_s_title_author_and_other_proper',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/pdf-metadata.tool').then((module) => module.definition),
	},
	{
		id: 'pdf-pages',
		category: 'text',
		name: 'tools.pdf-pages.pdf_merge_split',
		description: 'tools.pdf-pages.merge_pdfs_extract_pages_or_split_files_in',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/pdf-pages.tool').then((module) => module.definition),
	},
	{
		id: 'file-signature',
		category: 'text',
		name: 'tools.file-signature.file_signature_inspector',
		description: 'tools.file-signature.identify_a_file_format_from_its_leading_by',
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/file-signature.tool').then((module) => module.definition),
	},
];
