import { PDFDocument } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { tool, result } from '@app/features/tools/_shared/definition';
import { select } from '@app/features/tools/_shared/controls';
import { file, filesFrom } from '@app/features/tools/_shared/files';
import { field } from '@app/core/models/tool';

GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/legacy/build/pdf.worker.mjs',
	import.meta.url,
).toString();

export const definition = tool(
	'pdf-convert',
	[
		file('application/pdf,image/png,image/jpeg', true),
		select('mode', 'tools.pdf-convert.operation', [
			['images', 'tools.pdf-convert.images_to_pdf'],
			['text', 'tools.pdf-convert.extract_text'],
			['png', 'tools.pdf-convert.export_pages_as_png'],
			['compress', 'tools.pdf-convert.rasterize_compress'],
		]),
		select('quality', 'tools.pdf-convert.jpeg_quality', [
			['0.45', 'tools.pdf-convert.low'],
			['0.7', 'tools.pdf-convert.medium'],
			['0.85', 'tools.pdf-convert.high'],
		]),
	],
	async (values, supplied) => {
		const files = filesFrom(supplied),
			mode = field(values, 'mode');
		if (mode === 'images') {
			const out = await PDFDocument.create();
			for (const f of files) {
				const bytes = await f.arrayBuffer();
				const image =
					f.type === 'image/png' ? await out.embedPng(bytes) : await out.embedJpg(bytes);
				const page = out.addPage([image.width, image.height]);
				page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
			}
			return {
				...result({ pages: files.length }),
				artifacts: [
					{
						blob: new Blob([new Uint8Array(await out.save())], { type: 'application/pdf' }),
						filename: 'images.pdf',
					},
				],
			};
		}
		if (files.length !== 1 || files[0].type !== 'application/pdf') {
			throw new Error('Selecione um PDF / Select one PDF');
		}
		const pdf = await getDocument({ data: new Uint8Array(await files[0].arrayBuffer()) }).promise;
		if (pdf.numPages > 100) {
			throw new Error('Máximo 100 páginas / Maximum 100 pages');
		}
		if (mode === 'text') {
			const pages: string[] = [];
			for (let n = 1; n <= pdf.numPages; n++) {
				const page = await pdf.getPage(n),
					content = await page.getTextContent();
				pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
			}
			return result(
				{ pages: pages.map((text, index) => ({ page: index + 1, text })) },
				'pdf-text.json',
			);
		}
		const quality = Number(field(values, 'quality'));
		if (mode === 'png') {
			const artifacts = [];
			for (let n = 1; n <= pdf.numPages; n++) {
				const page = await pdf.getPage(n),
					viewport = page.getViewport({ scale: 1.5 });
				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const context = canvas.getContext('2d');
				if (!context) {
					throw new Error('Canvas indisponível / Canvas unavailable');
				}
				await page.render({ canvasContext: context, canvas, viewport }).promise;
				const blob = await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob(
						(value) =>
							value
								? resolve(value)
								: reject(new Error('Falha ao exportar PNG / PNG export failed')),
						'image/png',
					),
				);
				artifacts.push({ blob, filename: `page-${n}.png` });
			}
			return { ...result({ pages: artifacts.length }), artifacts };
		}
		if (mode === 'compress') {
			const out = await PDFDocument.create();
			for (let n = 1; n <= pdf.numPages; n++) {
				const page = await pdf.getPage(n),
					viewport = page.getViewport({ scale: 1.4 });
				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const context = canvas.getContext('2d');
				if (!context) {
					throw new Error('Canvas indisponível / Canvas unavailable');
				}
				await page.render({ canvasContext: context, canvas, viewport }).promise;
				const jpeg = await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob(
						(value) =>
							value ? resolve(value) : reject(new Error('Falha ao comprimir / Compression failed')),
						'image/jpeg',
						quality,
					),
				);
				const image = await out.embedJpg(await jpeg.arrayBuffer()),
					target = out.addPage([page.view[2] - page.view[0], page.view[3] - page.view[1]]);
				target.drawImage(image, {
					x: 0,
					y: 0,
					width: target.getWidth(),
					height: target.getHeight(),
				});
			}
			return {
				...result({
					pages: pdf.numPages,
					lossy: true,
					note: 'Rasterized; text, forms, links and signatures are not retained.',
				}),
				notice: 'tools.pdf-convert.rasterized_warning',
				artifacts: [
					{
						blob: new Blob([new Uint8Array(await out.save())], { type: 'application/pdf' }),
						filename: 'compressed-rasterized.pdf',
					},
				],
			};
		}
		throw new Error('Selecione uma operação válida / Select a valid operation');
	},
	undefined,
	'tools.pdf-convert.converts_images_extracts_text_renders_pages_or_rasterizes',
);
