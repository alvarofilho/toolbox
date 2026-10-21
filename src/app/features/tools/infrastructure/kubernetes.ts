import { parseAllDocuments } from 'yaml';
import { runDataTask } from '@app/features/tools/json/data-runner';
import { kubernetesSchema } from '@app/features/tools/infrastructure/kubernetes-schemas';
import { object, json } from '@app/features/tools/_shared/data';
import { result } from '@app/features/tools/_shared/definition';

export async function validateKubernetes(
	input: string,
	customSchema: string,
	signal?: AbortSignal,
) {
	const documents = parseAllDocuments(input, { uniqueKeys: true });
	if (!documents.length || documents.some((d) => d.errors.length)) {
		throw new Error(
			documents.flatMap((d) => d.errors.map((e) => e.message)).join('\n') ||
				'YAML vazio / Empty YAML',
		);
	}
	if (documents.length > 50) {
		throw new Error('Máximo 50 documentos / Maximum 50 documents');
	}
	const reports = [];
	for (const [i, document] of documents.entries()) {
		const resource = object(document.toJS({ maxAliasCount: 50 }));
		const errors: string[] = [];
		for (const key of ['apiVersion', 'kind']) {
			if (typeof resource[key] !== 'string' || !resource[key]) {
				errors.push(`${key} required`);
			}
		}
		const schema = customSchema.trim()
			? object(json(customSchema))
			: await kubernetesSchema(resource['apiVersion'], resource['kind']);
		const checked = object(
			await runDataTask('kubernetes', JSON.stringify(resource), JSON.stringify(schema), signal),
		);
		if (Array.isArray(checked['errors'])) {
			for (const e of checked['errors']) {
				const error = object(e);
				errors.push(`${String(error['path'])}: ${String(error['message'])}`);
			}
		}
		reports.push({
			document: i + 1,
			kind: resource['kind'],
			valid: checked['valid'] === true && !errors.length,
			errors,
			validation: customSchema.trim()
				? 'supplied-json-schema'
				: 'kubernetes-1.35.0-standalone-strict',
		});
	}
	return result({ valid: reports.every((r) => r.valid), documents: reports });
}
