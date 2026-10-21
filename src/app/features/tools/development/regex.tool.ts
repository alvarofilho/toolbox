import { field, ToolExecutionError, type ToolDefinition } from '@app/core/models/tool';
import { input } from '@app/features/tools/_shared/controls';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

export const definition: ToolDefinition = {
	id: 'regex',
	controls: [
		input('pattern', 'tools.regex.pattern_without', '', 'text'),
		input('flags', 'tools.regex.flags', 'g', 'text'),
		input('input', 'tools.regex.test_text', undefined, undefined),
	],
	action: 'tools.regex.test_expression',
	hint: 'tools.regex.isolated_execution_limited_to_500_ms_1_000',
	example: { pattern: '[A-Z][a-z]+', flags: 'g', input: 'Ana e Bruno usam Toolbox.' },
	run: async (v, _files, signal) => {
		const output = await runWorkerTask(
			() => new Worker(new URL('./regex.worker', import.meta.url), { type: 'module' }),
			{
				pattern: field(v, 'pattern'),
				flags: field(v, 'flags'),
				input: field(v, 'input'),
			},
			{
				signal,
				timeoutMs: 500,
				parse: (value) => {
					if (typeof value === 'object' && value !== null) {
						if ('output' in value && typeof value.output === 'string') {
							return value.output;
						}
						if ('error' in value && typeof value.error === 'string') {
							throw new ToolExecutionError('input', value.error);
						}
					}
					throw new ToolExecutionError('worker');
				},
			},
		);
		if (signal?.aborted) {
			throw new ToolExecutionError('cancelled');
		}
		return { output, filename: 'matches.json', mime: 'application/json' };
	},
};
