import {
	text,
	type ToolControl,
	type ToolDefinition,
	type ToolResult,
	type ToolValues,
} from '@app/core/models/tool';

export function tool(
	id: string,
	controls: readonly ToolControl[],
	run: ToolDefinition['run'],
	example?: ToolValues,
	hint?: ToolDefinition['hint'],
): ToolDefinition {
	return { id, controls, run, example, hint, action: text('Executar', 'Run') };
}

export const result = (value: unknown, filename = 'result.json'): ToolResult => ({
	output: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
	filename,
});
