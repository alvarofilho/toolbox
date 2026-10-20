import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib';
import { tool, result } from '@app/features/tools/_shared/definition';
import { input, select } from '@app/features/tools/_shared/controls';
import { file, firstFile } from '@app/features/tools/_shared/files';
import { field } from '@app/core/models/tool';

export const definition = tool(
	'pdf-forms',
	[
		file('application/pdf'),
		select('mode', 'tools.pdf-forms.operation', [
			['inspect', 'tools.pdf-forms.inspect_fields'],
			['fill', 'tools.pdf-forms.fill_existing'],
			['create', 'tools.pdf-forms.create_form'],
		]),
		input('data', 'tools.pdf-forms.json_data', '{\n  "name": "Ada Lovelace"\n}', 'textarea'),
	],
	async (values, supplied) => {
		const mode = field(values, 'mode'),
			raw = field(values, 'data');
		if (mode === 'create') {
			const definitions: unknown = JSON.parse(raw);
			if (!Array.isArray(definitions) || definitions.length < 1 || definitions.length > 9) {
				throw new Error('Informe de 1 a 9 campos em JSON / Provide 1 to 9 fields as JSON');
			}
			const pdf = await PDFDocument.create(),
				page = pdf.addPage([612, 792]),
				form = pdf.getForm();
			let y = 720;
			for (const item of definitions) {
				if (
					typeof item !== 'object' ||
					item === null ||
					!('name' in item) ||
					typeof item.name !== 'string' ||
					!/^[\w.-]{1,64}$/.test(item.name)
				) {
					throw new Error('Cada campo precisa de name válido / Each field needs a valid name');
				}
				const label = 'label' in item && typeof item.label === 'string' ? item.label : item.name;
				page.drawText(label.slice(0, 60), { x: 50, y: y + 26, size: 10 });
				const type = 'type' in item && typeof item.type === 'string' ? item.type : 'text';
				if (type === 'checkbox') {
					const control = form.createCheckBox(item.name);
					control.addToPage(page, { x: 50, y, width: 18, height: 18 });
				} else if (type === 'text') {
					const control = form.createTextField(item.name);
					control.setMaxLength(500);
					control.addToPage(page, { x: 50, y, width: 500, height: 20 });
				} else {
					throw new Error('Tipo aceito: text ou checkbox / Supported types: text or checkbox');
				}
				y -= 70;
				if (y < 60) {
					throw new Error('Muitos campos para uma página / Too many fields for one page');
				}
			}
			return {
				...result({ fields: definitions.length }),
				artifacts: [
					{
						blob: new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' }),
						filename: 'fillable-form.pdf',
					},
				],
			};
		}
		const pdf = await PDFDocument.load(await firstFile(supplied).arrayBuffer()),
			form = pdf.getForm(),
			fields = form.getFields();
		if (mode === 'inspect') {
			return result(fields.map((item) => ({ name: item.getName(), type: item.constructor.name })));
		}
		if (mode === 'fill') {
			const data: unknown = JSON.parse(raw);
			if (typeof data !== 'object' || data === null || Array.isArray(data)) {
				throw new Error('Informe um objeto JSON / Provide a JSON object');
			}
			for (const item of fields) {
				const value = (data as Record<string, unknown>)[item.getName()];
				if (value === undefined) {
					continue;
				}
				if (typeof value !== 'string' && typeof value !== 'boolean') {
					throw new Error(`Valor inválido: ${item.getName()}`);
				}
				if (typeof value === 'boolean' && item instanceof PDFCheckBox) {
					if (value) {
						item.check();
					} else {
						item.uncheck();
					}
				} else if (typeof value === 'string' && item instanceof PDFTextField) {
					item.setText(value);
				}
			}
			form.flatten();
			return {
				...result({ filled: true, flattened: true }),
				artifacts: [
					{
						blob: new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' }),
						filename: 'filled-form.pdf',
					},
				],
			};
		}
		throw new Error('Selecione uma operação válida / Select a valid operation');
	},
	undefined,
	'tools.pdf-forms.inspect_fill_or_create_simple_acroforms',
);
