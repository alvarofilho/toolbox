import { PDFDocument } from 'pdf-lib';

import { tool, result } from '@app/features/tools/_shared/definition';

import { firstFile, file } from '@app/features/tools/_shared/files';

export const definition = tool('pdf-metadata', [file('application/pdf')], async (_, files) => {
	const f = firstFile(files),
		pdf = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false });
	return result({
		filename: f.name,
		pages: pdf.getPageCount(),
		title: pdf.getTitle(),
		author: pdf.getAuthor(),
		subject: pdf.getSubject(),
		keywords: pdf.getKeywords(),
		creator: pdf.getCreator(),
		producer: pdf.getProducer(),
		created: pdf.getCreationDate(),
		modified: pdf.getModificationDate(),
		pageSizes: pdf.getPages().map((p) => p.getSize()),
	});
});
