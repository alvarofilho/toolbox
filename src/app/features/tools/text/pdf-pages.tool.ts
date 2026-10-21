import { ToolExecutionError, TranslatedToolError } from '@app/core/models/tool';
import { tool } from '@app/features/tools/_shared/definition';
import { input, select } from '@app/features/tools/_shared/controls';
import { field } from '@app/core/models/tool';
import { filesFrom, file } from '@app/features/tools/_shared/files';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

export const definition = tool(
	'pdf-pages',
	[
		file('application/pdf', true),
		select(
			'mode',
			'tools.pdf-pages.operation',
			[
				['merge', 'tools.pdf-pages.merge_pdfs'],
				['extract', 'tools.pdf-pages.extract_pages'],
				['split', 'tools.pdf-pages.split_pages_into_files'],
				['reorder', 'tools.pdf-pages.reorder_pages'],
				['delete', 'tools.pdf-pages.delete_pages'],
				['rotate', 'tools.pdf-pages.rotate_pages'],
			],
			undefined,
		),
		{
			...input('pages', 'tools.pdf-pages.pages_1_3_5_empty_all', '', 'text'),
			when: { key: 'mode', values: ['extract', 'split', 'reorder', 'delete', 'rotate'] },
		},
		{
			...select(
				'rotation',
				'tools.pdf-pages.rotation',
				[
					['90', 'tools.pdf-pages.90_clockwise'],
					['180', 'tools.pdf-pages.180'],
					['270', 'tools.pdf-pages.90_counterclockwise'],
				],
				undefined,
			),
			when: { key: 'mode', values: ['rotate'] },
		},
	],
	async (v, files, signal) => {
		const selected = filesFrom(files),
			operation = field(v, 'mode');
		if (!['merge', 'extract', 'split', 'reorder', 'delete', 'rotate'].includes(operation)) {
			throw new TranslatedToolError('tools.pdf-pages.invalid_operation', {}, 'mode');
		}
		if (operation !== 'merge' && selected.length !== 1) {
			throw new TranslatedToolError('tools.pdf-pages.select_one_pdf_for_operation', {}, 'files');
		}
		const raw = field(v, 'pages').trim();
		const buffers = await Promise.all(selected.map((selectedFile) => selectedFile.arrayBuffer()));
		const response = await runWorkerTask(
			() => new Worker(new URL('./pdf-pages.worker', import.meta.url), { type: 'module' }),
			{ files: buffers, operation, pages: raw, rotation: field(v, 'rotation') },
			{
				signal,
				timeoutMs: 120_000,
				parse: (value) => {
					if (
						typeof value === 'object' &&
						value !== null &&
						'error' in value &&
						typeof value.error === 'string'
					) {
						const keys: Record<string, ConstructorParameters<typeof TranslatedToolError>[0]> = {
							invalid_pdf: 'tools.pdf-pages.invalid_pdf',
							page_limit: 'tools.pdf-pages.page_limit',
							invalid_page_range: 'tools.pdf-pages.invalid_page_range',
							page_out_of_range: 'tools.pdf-pages.page_out_of_range',
							pages_required: 'tools.pdf-pages.pages_required',
							keep_one_page: 'tools.pdf-pages.keep_one_page',
							invalid_rotation: 'tools.pdf-pages.invalid_rotation',
						};
						const key = keys[value.error];
						if (key) {
							throw new TranslatedToolError(
								key,
								{},
								value.error.includes('page') ? 'pages' : 'files',
							);
						}
						throw new TranslatedToolError('tools.pdf-pages.invalid_pdf', {}, 'files');
					}
					if (
						typeof value === 'object' &&
						value !== null &&
						'output' in value &&
						value.output instanceof ArrayBuffer &&
						'filename' in value &&
						typeof value.filename === 'string' &&
						'mime' in value &&
						typeof value.mime === 'string' &&
						'pageCount' in value &&
						typeof value.pageCount === 'number'
					) {
						return {
							output: value.output,
							filename: value.filename,
							mime: value.mime,
							pageCount: value.pageCount,
						};
					}
					throw new ToolExecutionError('worker');
				},
			},
		);
		if (signal?.aborted) {
			throw new ToolExecutionError('cancelled');
		}
		return {
			output: JSON.stringify({ pages: response.pageCount, operation }),
			artifacts: [
				{
					blob: new Blob([response.output], { type: response.mime }),
					filename: response.filename,
				},
			],
		};
	},
	undefined,
	'tools.pdf-pages.merge_follows_file_selection_order_extract',
);
