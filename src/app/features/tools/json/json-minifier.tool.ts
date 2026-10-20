import { field, type ToolDefinition } from '@app/core/models/tool';
import { source } from '@app/features/tools/_shared/controls';

export const definition: ToolDefinition = {
	id: 'json-minifier',
	controls: [source],
	action: 'tools.json-minifier.minify_json',
	example: { input: '{\n  "project": "Toolbox",\n  "local": true\n}' },
	run: (v) => ({
		output: JSON.stringify(JSON.parse(field(v, 'input'))),
		filename: 'minified.json',
		mime: 'application/json',
	}),
};
