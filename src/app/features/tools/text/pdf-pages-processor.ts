import { degrees, PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface PdfPagesMessage {
	readonly files: readonly ArrayBuffer[];
	readonly operation: string;
	readonly pages: string;
	readonly rotation: string;
}

export interface PdfPagesResponse {
	readonly output: ArrayBuffer;
	readonly filename: string;
	readonly mime: string;
	readonly pageCount: number;
}

export async function processPdfPages({
	files,
	operation,
	pages: raw,
	rotation,
}: PdfPagesMessage): Promise<PdfPagesResponse> {
	const docs = await Promise.all(files.map((bytes) => PDFDocument.load(bytes)));
	const pageCount = docs.reduce((count, doc) => count + doc.getPageCount(), 0);
	if (pageCount > 300) {
		throw new Error('page_limit');
	}
	let indexes = docs[0]?.getPageIndices() ?? [];
	if (operation !== 'merge' && raw.trim()) {
		const parsed = raw.split(',').flatMap((piece) => {
			const match = /^(\d+)(?:-(\d+))?$/.exec(piece.trim());
			if (!match) {
				throw new Error('invalid_page_range');
			}
			const start = Number(match[1]);
			const end = Number(match[2] ?? match[1]);
			if (start < 1 || end < start || end > (docs[0]?.getPageCount() ?? 0)) {
				throw new Error('page_out_of_range');
			}
			return Array.from({ length: end - start + 1 }, (_, index) => start + index - 1);
		});
		indexes = operation === 'reorder' ? parsed : [...new Set(parsed)];
	}
	if (operation === 'delete') {
		if (!raw.trim()) {
			throw new Error('pages_required');
		}
		indexes = (docs[0]?.getPageIndices() ?? []).filter((index) => !new Set(indexes).has(index));
		if (!indexes.length) {
			throw new Error('keep_one_page');
		}
	}
	if (operation === 'rotate') {
		const amount = Number(rotation);
		if (![90, 180, 270].includes(amount)) {
			throw new Error('invalid_rotation');
		}
		for (const index of indexes) {
			const page = docs[0]?.getPage(index);
			page?.setRotation(degrees((page.getRotation().angle + amount) % 360));
		}
	}
	if (operation === 'split') {
		const zip = new JSZip();
		for (const index of indexes) {
			const doc = await PDFDocument.create();
			const copied = await doc.copyPages(docs[0]!, [index]);
			copied.forEach((page) => doc.addPage(page));
			zip.file(`page-${index + 1}.pdf`, await doc.save());
		}
		return {
			output: await zip.generateAsync({ type: 'arraybuffer' }),
			filename: 'pdf-pages.zip',
			mime: 'application/zip',
			pageCount: indexes.length,
		};
	}
	const doc = await PDFDocument.create();
	for (const source of docs) {
		const copied = await doc.copyPages(
			source,
			operation === 'merge' || operation === 'rotate' ? source.getPageIndices() : indexes,
		);
		copied.forEach((page) => doc.addPage(page));
	}
	return {
		output: (await doc.save()).buffer as ArrayBuffer,
		filename: `${operation}.pdf`,
		mime: 'application/pdf',
		pageCount: indexes.length,
	};
}
