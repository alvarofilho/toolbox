/// <reference lib="webworker" />
import { processData } from '@app/features/tools/extended/data-processing';
import { object } from '@app/features/tools/extended/common';

addEventListener('message', (event: MessageEvent<unknown>) => {
	try {
		const data = object(event.data),
			task = data['task'],
			input = data['input'],
			second = data['second'];
		if (
			(task !== 'schema' && task !== 'path' && task !== 'faker' && task !== 'kubernetes') ||
			typeof input !== 'string' ||
			typeof second !== 'string' ||
			input.length > 1000000 ||
			second.length > 1000000
		) {
			throw new Error('Mensagem inválida / Invalid message');
		}
		postMessage({ value: processData(task, input, second) });
	} catch (error: unknown) {
		postMessage({ error: error instanceof Error ? error.message : String(error) });
	}
});
