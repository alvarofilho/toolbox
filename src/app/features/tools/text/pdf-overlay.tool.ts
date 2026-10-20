import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { tool, result } from '@app/features/tools/_shared/definition';
import { input, select } from '@app/features/tools/_shared/controls';
import { file, firstFile } from '@app/features/tools/_shared/files';
import { field } from '@app/core/models/tool';

export const definition = tool(
	'pdf-overlay',
	[
		file('application/pdf'),
		select('mode', 'tools.pdf-overlay.operation', [
			['number', 'tools.pdf-overlay.page_numbers'],
			['watermark', 'tools.pdf-overlay.watermark'],
		]),
		input('text', 'tools.pdf-overlay.text', 'CONFIDENTIAL', 'text'),
	],
	async (values, supplied) => {
		const pdf = await PDFDocument.load(await firstFile(supplied).arrayBuffer()),
			font = await pdf.embedFont(StandardFonts.Helvetica),
			text = field(values, 'text').slice(0, 100);
		if (!text.trim()) {
			throw new Error('Informe o texto / Enter text');
		}
		for (const [index, page] of pdf.getPages().entries()) {
			if (field(values, 'mode') === 'number') {
				page.drawText(`${index + 1} / ${pdf.getPageCount()}`, {
					x: page.getWidth() / 2 - 20,
					y: 24,
					size: 10,
					font,
				});
			} else if (field(values, 'mode') === 'watermark') {
				page.drawText(text, {
					x: page.getWidth() * 0.15,
					y: page.getHeight() * 0.48,
					size: Math.min(48, page.getWidth() / 10),
					font,
					color: rgb(0.65, 0.65, 0.65),
					opacity: 0.35,
					rotate: degrees(35),
				});
			} else {
				throw new Error('Selecione uma operação válida / Select a valid operation');
			}
		}
		return {
			...result({ pages: pdf.getPageCount() }),
			artifacts: [
				{
					blob: new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' }),
					filename: 'annotated.pdf',
				},
			],
		};
	},
	undefined,
	'tools.pdf-overlay.adds_page_numbers_or_a_text_watermark',
);
