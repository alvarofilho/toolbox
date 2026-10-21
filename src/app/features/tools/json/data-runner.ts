import { ToolExecutionError } from '@app/core/models/tool';
import type { DataTask } from '@app/features/tools/json/data-processing';
import { object } from '@app/features/tools/_shared/data';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

export async function runDataTask(
	name: DataTask,
	input: string,
	second = '',
	signal?: AbortSignal,
): Promise<unknown> {
	if (signal?.aborted) {
		throw new ToolExecutionError('cancelled');
	}
	if (typeof Worker === 'undefined') {
		const result = (await import('./data-processing')).processData(name, input, second);
		if (signal?.aborted) {
			throw new ToolExecutionError('cancelled');
		}
		return result;
	}
	return runWorkerTask(
		() => new Worker(new URL('./data.worker', import.meta.url), { type: 'module' }),
		{ task: name, input, second },
		{
			signal,
			timeoutMs: 2000,
			parse: (value) => {
				const data = object(value);
				if (typeof data['error'] === 'string') {
					throw new ToolExecutionError('input', data['error']);
				}
				if (Object.hasOwn(data, 'value')) {
					return data['value'];
				}
				throw new ToolExecutionError('worker');
			},
		},
	);
}
