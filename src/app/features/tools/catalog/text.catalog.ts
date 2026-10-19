import { text } from '@app/core/models/tool';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const TEXT_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'text-diff',
		name: text('Text Diff', 'Text Diff', undefined, 'tools.text-diff'),
		description: text(
			'Veja diferenças entre duas versões de um texto.',
			'See differences between two versions of text.',
			undefined,
			'tools.text-diff',
		),
		category: 'text',
		icon: 'diff',
		keywords: 'comparar diferença texto linhas',
		available: true,
		loadDefinition: () => import('../text/text-diff.tool').then((module) => module.definition),
	},
	{
		id: 'case',
		name: text('Conversor de texto', 'Case Converter', undefined, 'tools.case'),
		description: text(
			'Alterne entre camelCase, snake_case e mais.',
			'Switch between camelCase, snake_case and more.',
			undefined,
			'tools.case',
		),
		category: 'text',
		icon: 'type',
		keywords: 'case maiúsculas minúsculas pascal kebab slug',
		available: true,
		loadDefinition: () => import('../text/case.tool').then((module) => module.definition),
	},
	{
		id: 'word-count',
		category: 'text',
		name: text(
			'Contador de palavras e caracteres',
			'Word and Character Counter',
			undefined,
			'tools.word-count',
		),
		description: text(
			'Conte palavras, caracteres e linhas de um texto.',
			'Count words, characters and lines in text.',
			'Cuenta palabras, caracteres y líneas de un texto.',
			'tools.word-count',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/word-count.tool').then((module) => module.definition),
	},
	{
		id: 'dedupe-lines',
		category: 'text',
		name: text(
			'Remover linhas duplicadas',
			'Remove Duplicate Lines',
			undefined,
			'tools.dedupe-lines',
		),
		description: text(
			'Remova linhas repetidas com comparação exata ou normalizada.',
			'Remove duplicate lines with exact or normalized comparison.',
			'Elimina líneas duplicadas con comparación exacta o normalizada.',
			'tools.dedupe-lines',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/dedupe-lines.tool').then((module) => module.definition),
	},
	{
		id: 'sort-lines',
		category: 'text',
		name: text('Ordenar linhas', 'Sort Lines', undefined, 'tools.sort-lines'),
		description: text(
			'Ordene linhas por texto ou valor numérico.',
			'Sort lines by text or numeric value.',
			'Ordena líneas por texto o valor numérico.',
			'tools.sort-lines',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/sort-lines.tool').then((module) => module.definition),
	},
	{
		id: 'slug',
		category: 'text',
		name: text('Slug Generator', 'Slug Generator', undefined, 'tools.slug'),
		description: text(
			'Transforme um título em um slug para URLs.',
			'Turn a title into a URL slug.',
			'Convierte un título en un slug para URL.',
			'tools.slug',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/slug.tool').then((module) => module.definition),
	},
	{
		id: 'csv-cleaner',
		category: 'text',
		name: text('CSV Cleaner', 'CSV Cleaner', undefined, 'tools.csv-cleaner'),
		description: text(
			'Limpe espaços e duplicatas de CSV e escolha o delimitador.',
			'Clean CSV whitespace and duplicates and choose a delimiter.',
			'Limpia espacios y duplicados de CSV y elige el delimitador.',
			'tools.csv-cleaner',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/csv-cleaner.tool').then((module) => module.definition),
	},
	{
		id: 'svg-optimizer',
		category: 'text',
		name: text('SVG Optimizer', 'SVG Optimizer', undefined, 'tools.svg-optimizer'),
		description: text(
			'Sanitize e reduza um SVG, com prévia isolada.',
			'Sanitize and optimize SVG with an isolated preview.',
			'Sanea y optimiza SVG con una vista previa aislada.',
			'tools.svg-optimizer',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/svg-optimizer.tool').then((module) => module.definition),
	},
	{
		id: 'image-converter',
		category: 'text',
		name: text('Image Converter', 'Image Converter', undefined, 'tools.image-converter'),
		description: text(
			'Converta imagens raster para WebP, PNG ou JPEG.',
			'Convert raster images to WebP, PNG or JPEG.',
			'Convierte imágenes raster a WebP, PNG o JPEG.',
			'tools.image-converter',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../text/image-converter.tool').then((module) => module.definition),
	},
	{
		id: 'image-compressor',
		category: 'text',
		name: text('Image Compressor', 'Image Compressor', undefined, 'tools.image-compressor'),
		description: text(
			'Ajuste dimensão e qualidade de imagens e compare os tamanhos.',
			'Adjust image dimensions and quality and compare file sizes.',
			'Ajusta dimensiones y calidad de imágenes y compara sus tamaños.',
			'tools.image-compressor',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../text/image-compressor.tool').then((module) => module.definition),
	},
	{
		id: 'image-exif',
		category: 'text',
		name: text('Image EXIF Viewer', 'Image EXIF Viewer', undefined, 'tools.image-exif'),
		description: text(
			'Leia metadados EXIF de uma imagem local.',
			'Read EXIF metadata from a local image.',
			'Lee metadatos EXIF de una imagen local.',
			'tools.image-exif',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/image-exif.tool').then((module) => module.definition),
	},
	{
		id: 'pdf-metadata',
		category: 'text',
		name: text('PDF Metadata Viewer', 'PDF Metadata Viewer', undefined, 'tools.pdf-metadata'),
		description: text(
			'Leia título, autor e outras propriedades de um PDF.',
			"Read a PDF's title, author and other properties.",
			'Lee el título, el autor y otras propiedades de un PDF.',
			'tools.pdf-metadata',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/pdf-metadata.tool').then((module) => module.definition),
	},
	{
		id: 'pdf-pages',
		category: 'text',
		name: text('PDF Merge/Split', 'PDF Merge/Split', undefined, 'tools.pdf-pages'),
		description: text(
			'Una PDFs, extraia páginas ou divida arquivos em ZIP.',
			'Merge PDFs, extract pages or split files into a ZIP.',
			'Une PDF, extrae páginas o divide archivos en un ZIP.',
			'tools.pdf-pages',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/pdf-pages.tool').then((module) => module.definition),
	},
	{
		id: 'file-signature',
		category: 'text',
		name: text(
			'File Signature Inspector',
			'File Signature Inspector',
			undefined,
			'tools.file-signature',
		),
		description: text(
			'Identifique o formato de um arquivo pelos bytes iniciais.',
			'Identify a file format from its leading bytes.',
			'Identifica el formato de un archivo por sus bytes iniciales.',
			'tools.file-signature',
		),
		icon: 'type',
		keywords: '',
		available: true,

		loadDefinition: () => import('../text/file-signature.tool').then((module) => module.definition),
	},
];
