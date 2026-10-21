import { Validator } from 'jsonschema';
import { JSONPath } from 'jsonpath-plus';
import { generateSync, type JsonSchema } from 'json-schema-faker';
import { object, json } from '@app/features/tools/_shared/data';
import { TranslatedToolError } from '@app/core/models/tool';

export type DataTask = 'schema' | 'path' | 'faker' | 'kubernetes';
export function processData(task: DataTask, input: string, second: string): unknown {
	const value = json(input);
	if (task === 'path') {
		try {
			return JSONPath({ path: second, json: value as object, eval: 'safe' });
		} catch {
			throw new TranslatedToolError('tools.jsonpath.invalid_expression', {}, 'path');
		}
	} // JSONPath accepts primitives at runtime as well.
	const schema = object(task === 'schema' || task === 'kubernetes' ? json(second) : value);
	const validator = new Validator();
	if (task === 'schema' || task === 'kubernetes') {
		const validation = validator.validate(value, schema, {
			nestedErrors: true,
			allowUnknownAttributes: task === 'kubernetes',
		});
		return {
			valid: validation.valid,
			errors: validation.errors.map((e) => ({ path: e.property, message: e.message })),
		};
	}
	const generated = generateSync(schema as JsonSchema, { maxDepth: 8, maxItems: 20 }); // Parsed record is validated against the schema by the generator and validator.
	const validation = validator.validate(generated, schema);
	if (!validation.valid) {
		throw new Error(validation.errors.map((e) => e.stack).join('\n'));
	}
	return { synthetic: true, data: generated };
}
