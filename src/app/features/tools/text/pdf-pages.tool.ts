import { degrees, PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { tool, result } from '@app/features/tools/_shared/definition';
import { input, select } from '@app/features/tools/_shared/controls';
import { field, TranslatedToolError } from '@app/core/models/tool';
import { filesFrom, file } from '@app/features/tools/_shared/files';

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
	async (v, files) => {
		const selected = filesFrom(files),
			operation = field(v, 'mode');
		if (!['merge', 'extract', 'split', 'reorder', 'delete', 'rotate'].includes(operation)) {
			throw new TranslatedToolError('tools.pdf-pages.invalid_operation', {}, 'mode');
		}
		if (operation !== 'merge' && selected.length !== 1) {
			throw new TranslatedToolError('tools.pdf-pages.select_one_pdf_for_operation', {}, 'files');
		}
		let docs: PDFDocument[];
		try {
			docs = await Promise.all(
				selected.map((f) => f.arrayBuffer().then((b) => PDFDocument.load(b))),
			);
		} catch {
			throw new TranslatedToolError('tools.pdf-pages.invalid_pdf', {}, 'files');
		}
		if (docs.reduce((n, p) => n + p.getPageCount(), 0) > 300) {
			throw new TranslatedToolError('tools.pdf-pages.page_limit', {}, 'files');
		}
		let indexes = docs[0].getPageIndices();
		const raw = field(v, 'pages').trim();
		if (operation !== 'merge' && raw) {
			const parsed = raw.split(',').flatMap((piece) => {
				const match = /^(\d+)(?:-(\d+))?$/.exec(piece.trim());
				if (!match) {
					throw new TranslatedToolError('tools.pdf-pages.invalid_page_range', {}, 'pages');
				}
				const start = Number(match[1]),
					end = Number(match[2] ?? match[1]);
				if (start < 1 || end < start || end > docs[0].getPageCount()) {
					throw new TranslatedToolError('tools.pdf-pages.page_out_of_range', {}, 'pages');
				}
				return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
			});
			indexes = operation === 'reorder' ? parsed : [...new Set(parsed)];
		}
		if (operation === 'delete') {
			if (!raw) {
				throw new TranslatedToolError('tools.pdf-pages.pages_required', {}, 'pages');
			}
			const removed = new Set(indexes);
			indexes = docs[0].getPageIndices().filter((index) => !removed.has(index));
			if (indexes.length === 0) {
				throw new TranslatedToolError('tools.pdf-pages.keep_one_page', {}, 'pages');
			}
		}
		if (operation === 'rotate') {
			const rotation = Number(field(v, 'rotation'));
			if (![90, 180, 270].includes(rotation)) {
				throw new TranslatedToolError('tools.pdf-pages.invalid_rotation', {}, 'rotation');
			}
			const pages = docs[0].getPages();
			for (const index of indexes) {
				const page = pages[index];
				if (page) {
					page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
				}
			}
		}
		if (operation === 'split') {
			const zip = new JSZip();
			for (const index of indexes) {
				const out = await PDFDocument.create();
				const pages = await out.copyPages(docs[0], [index]);
				pages.forEach((p) => out.addPage(p));
				zip.file(`page-${index + 1}.pdf`, await out.save());
			}
			return {
				...result({ pages: indexes.map((i) => i + 1) }),
				artifacts: [{ blob: await zip.generateAsync({ type: 'blob' }), filename: 'pdf-pages.zip' }],
			};
		}
		const out = await PDFDocument.create();
		for (const doc of docs) {
			const pages = await out.copyPages(
				doc,
				operation === 'merge' || operation === 'rotate' ? doc.getPageIndices() : indexes,
			);
			pages.forEach((p) => out.addPage(p));
		}
		return {
			...result({ pages: out.getPageCount(), operation, selectedPages: indexes.map((i) => i + 1) }),
			artifacts: [
				{
					blob: new Blob([new Uint8Array(await out.save()).buffer], { type: 'application/pdf' }),
					filename: `${operation}.pdf`,
				},
			],
		};
	},
	undefined,
	'tools.pdf-pages.merge_follows_file_selection_order_extract',
);
