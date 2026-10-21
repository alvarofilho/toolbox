import { TranslatedToolError, field } from '@app/core/models/tool';
import { input } from '@app/features/tools/_shared/controls';
import { tool } from '@app/features/tools/_shared/definition';
import { file, filesFrom } from '@app/features/tools/_shared/files';
import { inspectHar } from '@app/features/tools/development/har';

function previewHtml(sanitized: string): string {
	const excerpt = sanitized
		.slice(0, 10_000)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
	return `<html><body><pre>${excerpt}${sanitized.length > 10_000 ? '\n…' : ''}</pre></body></html>`;
}

const baseDefinition = tool(
	'har',
	[
		file('.har,application/json'),
		input('sensitiveNames', 'tools.har.additional_fields', '', 'textarea'),
	],
	async (values, supplied) => {
		const files = filesFrom(supplied);
		if (files.length !== 1) {
			throw new TranslatedToolError('tools.har.select_one_file', {}, 'files');
		}
		const inspection = await inspectHar(files[0], field(values, 'sensitiveNames'));
		const report = { ...inspection.summary };
		return {
			output: JSON.stringify(report, null, 2),
			filename: 'sanitized.har',
			mime: 'application/json;charset=utf-8',
			preview: previewHtml(inspection.sanitized),
			notice: 'tools.har.review_warning',
			artifacts: [
				{
					blob: new Blob([inspection.sanitized], { type: 'application/json;charset=utf-8' }),
					filename: 'sanitized.har',
				},
			],
		};
	},
	undefined,
	'tools.har.sanitization_scope',
);

export const definition = { ...baseDefinition, execution: 'manual' as const };
