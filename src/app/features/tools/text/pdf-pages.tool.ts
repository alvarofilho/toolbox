import { degrees, PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { tool, result } from '@app/features/tools/_shared/definition';
import { input, select } from '@app/features/tools/_shared/controls';
import { field, text } from '@app/core/models/tool';
import { filesFrom, file } from '@app/features/tools/_shared/files';

export const definition = tool(
	'pdf-pages',
	[
		file('application/pdf', true),
		select(
			'mode',
			'Operação',
			'Operation',
			[
				['merge', 'Unir PDFs', 'Merge PDFs'],
				['extract', 'Extrair páginas', 'Extract pages'],
				['split', 'Separar páginas em arquivos', 'Split pages into files'],
				['reorder', 'Reordenar páginas', 'Reorder pages'],
				['delete', 'Excluir páginas', 'Delete pages'],
				['rotate', 'Girar páginas', 'Rotate pages'],
			],
			undefined,
			'tools.pdf-pages',
		),
		{
			...input(
				'pages',
				'Páginas: 1,3-5 (vazio = todas)',
				'Pages: 1,3-5 (empty = all)',
				'',
				'text',
				'tools.pdf-pages',
			),
			when: { key: 'mode', values: ['extract', 'split', 'reorder', 'delete', 'rotate'] },
		},
		{
			...select(
				'rotation',
				'Rotação',
				'Rotation',
				[
					['90', '90° no sentido horário', '90° clockwise'],
					['180', '180°', '180°'],
					['270', '90° no sentido anti-horário', '90° counterclockwise'],
				],
				undefined,
				'tools.pdf-pages',
			),
			when: { key: 'mode', values: ['rotate'] },
		},
	],
	async (v, files) => {
		const selected = filesFrom(files),
			operation = field(v, 'mode');
		if (!['merge', 'extract', 'split', 'reorder', 'delete', 'rotate'].includes(operation)) {
			throw new Error('Selecione uma operação válida / Select a valid operation');
		}
		if (operation !== 'merge' && selected.length !== 1) {
			throw new Error(
				'Para esta operação, selecione apenas um PDF / Select exactly one PDF for this operation',
			);
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
			const parsed = raw.split(',').flatMap((piece) => {
				const match = /^(\d+)(?:-(\d+))?$/.exec(piece.trim());
				if (!match) {
					throw new Error('Intervalo inválido / Invalid page range');
				}
				const start = Number(match[1]),
					end = Number(match[2] ?? match[1]);
				if (start < 1 || end < start || end > docs[0].getPageCount()) {
					throw new Error('Página fora do intervalo / Page out of range');
				}
				return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
			});
			indexes = operation === 'reorder' ? parsed : [...new Set(parsed)];
		}
		if (operation === 'delete') {
			if (!raw) {
				throw new Error('Informe as páginas que deseja excluir / Enter the pages to delete');
			}
			const removed = new Set(indexes);
			indexes = docs[0].getPageIndices().filter((index) => !removed.has(index));
			if (indexes.length === 0) {
				throw new Error('Mantenha ao menos uma página / Keep at least one page');
			}
		}
		if (operation === 'rotate') {
			const rotation = Number(field(v, 'rotation'));
			if (![90, 180, 270].includes(rotation)) {
				throw new Error('Selecione uma rotação válida / Select a valid rotation');
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
	text(
		'Unir segue a ordem dos arquivos. Extrair e reordenar seguem a ordem informada (ex.: 3,1-2). Excluir remove as páginas informadas; girar aplica a rotação às páginas informadas. Vazio = todas. PDFs criptografados são rejeitados; assinaturas digitais não são preservadas.',
		'Merge follows file selection order. Extract and reorder follow the entered order (e.g. 3,1-2). Delete removes the entered pages; rotate applies to the entered pages. Empty = all. Encrypted PDFs are rejected; digital signatures are not preserved.',
		undefined,
		'tools.pdf-pages',
	),
);
