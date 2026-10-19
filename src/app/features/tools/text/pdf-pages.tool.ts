import { PDFDocument } from 'pdf-lib';

import JSZip from 'jszip';

import { tool, result } from '@app/features/tools/_shared/definition';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { input } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { filesFrom, file } from '@app/features/tools/_shared/files';

export const definition = tool(
	'pdf-pages',
	[
		file('application/pdf', true),
		mode(['merge', 'extract', 'split']),
		input(
			'pages',
			'Páginas: 1,3-5 (vazio = todas; extract/split)',
			'Pages: 1,3-5 (empty = all; extract/split)',
			'',
			'text',
		),
	],
	async (v, files) => {
		const selected = filesFrom(files),
			operation = field(v, 'mode');
		if (operation !== 'merge' && selected.length !== 1) {
			throw new Error('Selecione um PDF para extrair/dividir / Select one PDF for extract/split');
		}
		const docs = await Promise.all(
			selected.map((f) => f.arrayBuffer().then((b) => PDFDocument.load(b))),
		);
		if (docs.reduce((n, p) => n + p.getPageCount(), 0) > 300) {
			throw new Error('Máximo 300 páginas / Maximum 300 pages');
		}
		let indexes = docs[0].getPageIndices();
		const raw = field(v, 'pages').trim();
		if (operation !== 'merge' && raw) {
			indexes = [
				...new Set(
					raw.split(',').flatMap((piece) => {
						const m = /^(\d+)(?:-(\d+))?$/.exec(piece.trim());
						if (!m) {
							throw new Error('Intervalo inválido / Invalid page range');
						}
						const start = Number(m[1]),
							end = Number(m[2] ?? m[1]);
						if (start < 1 || end < start || end > docs[0].getPageCount()) {
							throw new Error('Página fora do intervalo / Page out of range');
						}
						return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
					}),
				),
			];
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
				operation === 'merge' ? doc.getPageIndices() : indexes,
			);
			pages.forEach((p) => out.addPage(p));
		}
		return {
			...result({ pages: out.getPageCount(), operation }),
			artifacts: [
				{
					blob: new Blob([new Uint8Array(await out.save()).buffer], { type: 'application/pdf' }),
					filename: `${operation}.pdf`,
				},
			],
		};
	},
	undefined,
	text(
		'Arquivos em ordem de seleção. PDFs criptografados são rejeitados; assinaturas digitais não são preservadas na saída.',
		'Files follow selection order. Encrypted PDFs are rejected; digital signatures are not preserved in output.',
	),
);
