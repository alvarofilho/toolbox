import type { DataTask } from '@app/features/tools/json/data-processing';
import { object } from '@app/features/tools/_shared/data';

export async function runDataTask(name: DataTask, input: string, second = ''): Promise<unknown> {
	if (typeof Worker === 'undefined') {
		return (await import('./data-processing')).processData(name, input, second);
	}
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('./data.worker', import.meta.url), { type: 'module' });
		const timer = setTimeout(() => {
			worker.terminate();
			reject(new Error('Tempo limite: 2 segundos / Time limit: 2 seconds'));
		}, 2000);
		worker.onmessage = (event: MessageEvent<unknown>) => {
			clearTimeout(timer);
			worker.terminate();
			try {
				const data = object(event.data);
				if (typeof data['error'] === 'string') {
					reject(new Error(data['error']));
				} else if (Object.hasOwn(data, 'value')) {
					resolve(data['value']);
				} else {
					reject(new Error('Resposta inválida / Invalid response'));
				}
			} catch (error: unknown) {
				reject(error);
			}
		};
		worker.onerror = () => {
			clearTimeout(timer);
			worker.terminate();
			reject(new Error('Falha no processamento / Processing failed'));
		};
		worker.postMessage({ task: name, input, second });
	});
}
