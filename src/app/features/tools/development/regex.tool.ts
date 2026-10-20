import { field, type ToolDefinition } from '@app/core/models/tool';
import { input } from '@app/features/tools/_shared/controls';

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
	run: (v) =>
		new Promise((resolve, reject) => {
			const worker = new Worker(new URL('./regex.worker', import.meta.url), { type: 'module' });
			const timer = setTimeout(() => {
				worker.terminate();
				reject(
					new Error(
						'Tempo limite de 500 ms. Simplifique a expressão / 500 ms timeout. Simplify pattern.',
					),
				);
			}, 500);
			worker.onmessage = (event: MessageEvent<unknown>) => {
				clearTimeout(timer);
				worker.terminate();
				const data = event.data;
				if (typeof data === 'object' && data !== null) {
					if ('output' in data && typeof data.output === 'string') {
						resolve({ output: data.output, filename: 'matches.json', mime: 'application/json' });
						return;
					}
					if ('error' in data && typeof data.error === 'string') {
						reject(new Error(data.error));
						return;
					}
				}
				reject(new Error('Invalid worker result'));
			};
			worker.onerror = () => {
				clearTimeout(timer);
				worker.terminate();
				reject(new Error('Não foi possível executar / Worker failed'));
			};
			worker.postMessage({
				pattern: field(v, 'pattern'),
				flags: field(v, 'flags'),
				input: field(v, 'input'),
			});
		}),
};
