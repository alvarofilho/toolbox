import { field, text, type ToolDefinition } from '@app/core/models/tool';
import { input } from '@app/features/tools/controls';

export const definition: ToolDefinition = {
	id: 'regex',
	controls: [
		input('pattern', 'Expressão (sem delimitadores / /)', 'Pattern (without / /)', '', 'text'),
		input('flags', 'Flags', 'Flags', 'g', 'text'),
		input('input', 'Texto de teste', 'Test text'),
	],
	action: text('Testar expressão', 'Test expression'),
	hint: text(
		'Execução isolada com limite de 500 ms, 1.000 resultados e 100.000 caracteres.',
		'Isolated execution, limited to 500 ms, 1,000 matches and 100,000 characters.',
	),
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
