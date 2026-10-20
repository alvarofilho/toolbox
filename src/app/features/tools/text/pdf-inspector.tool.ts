import { PDFDocument, PDFName } from 'pdf-lib';
import { tool, result } from '@app/features/tools/_shared/definition';
import { select } from '@app/features/tools/_shared/controls';
import { file, filesFrom, firstFile } from '@app/features/tools/_shared/files';
import { field } from '@app/core/models/tool';

export const definition = tool(
	'pdf-inspector',
	[
		file('application/pdf', true),
		select('mode', 'tools.pdf-inspector.operation', [
			['inspect', 'tools.pdf-inspector.inspect_validate'],
			['strip', 'tools.pdf-inspector.remove_metadata'],
			['repair', 'tools.pdf-inspector.resave_repair'],
		]),
	],
	async (values, supplied) => {
		const files = filesFrom(supplied),
			mode = field(values, 'mode');
		if (mode === 'inspect') {
			const reports = await Promise.all(
				files.map(async (file) => {
					const bytes = await file.arrayBuffer(),
						pdf = await PDFDocument.load(bytes, { updateMetadata: false }),
						source = new TextDecoder('latin1').decode(bytes);
					const fields = pdf.getForm().getFields();
					return {
						filename: file.name,
						pages: pdf.getPageCount(),
						metadata: {
							title: pdf.getTitle(),
							author: pdf.getAuthor(),
							subject: pdf.getSubject(),
							keywords: pdf.getKeywords(),
						},
						pageSizes: pdf.getPages().map((page) => page.getSize()),
						formFields: fields.map((f) => f.getName()),
						signatureFieldPresent: fields.some((f) =>
							f.constructor.name.toLowerCase().includes('signature'),
						),
						pdfAClaimInXmp: /pdfaid:part|pdfaid:conformance/i.test(source),
						note: 'PDF/A markers and signature fields are detected only; conformance and cryptographic validity are not verified.',
					};
				}),
			);
			const comparisons = reports.slice(1).map((report) => {
				const first = reports[0];
				return {
					files: [first.filename, report.filename],
					pageCount: {
						equal: first.pages === report.pages,
						left: first.pages,
						right: report.pages,
					},
					pageSizesEqual: JSON.stringify(first.pageSizes) === JSON.stringify(report.pageSizes),
					metadataEqual: JSON.stringify(first.metadata) === JSON.stringify(report.metadata),
					formFieldsEqual: JSON.stringify(first.formFields) === JSON.stringify(report.formFields),
				};
			});
			return result({ reports, comparisons });
		}
		if (files.length !== 1) {
			throw new Error('Selecione um PDF / Select one PDF');
		}
		const pdf = await PDFDocument.load(await firstFile(supplied).arrayBuffer());
		if (mode === 'strip') {
			pdf.context.trailerInfo.Info = undefined;
			pdf.catalog.delete(PDFName.of('Metadata'));
		} else if (mode !== 'repair') {
			throw new Error('Selecione uma operação válida / Select a valid operation');
		}
		return {
			...result({
				pages: pdf.getPageCount(),
				mode,
				note:
					mode === 'repair'
						? 'Best-effort parse and rewrite; this cannot recover arbitrary damaged PDFs.'
						: undefined,
			}),
			notice: mode === 'repair' ? 'tools.pdf-inspector.repair_limit' : undefined,
			artifacts: [
				{
					blob: new Blob([new Uint8Array(await pdf.save({ useObjectStreams: false }))], {
						type: 'application/pdf',
					}),
					filename: mode === 'strip' ? 'metadata-removed.pdf' : 'rewritten.pdf',
				},
			],
		};
	},
	undefined,
	'tools.pdf-inspector.inspects_pdfa_claims_signatures_structure_metadata_and_compares_files',
);
