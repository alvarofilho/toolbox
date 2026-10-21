import { ToolExecutionError } from '@app/core/models/tool';

export interface WorkerTaskOptions<TResult> {
	readonly signal?: AbortSignal;
	readonly timeoutMs: number;
	readonly parse: (value: unknown) => TResult;
}

export function runWorkerTask<TMessage, TResult>(
	createWorker: () => Worker,
	message: TMessage,
	options: WorkerTaskOptions<TResult>,
): Promise<TResult> {
	if (options.signal?.aborted) {
		return Promise.reject(new ToolExecutionError('cancelled'));
	}

	return new Promise((resolve, reject) => {
		let worker: Worker;
		try {
			worker = createWorker();
		} catch (error: unknown) {
			reject(error);
			return;
		}

		let settled = false;
		const cleanup = (): void => {
			clearTimeout(timer);
			options.signal?.removeEventListener('abort', onAbort);
			worker.removeEventListener('message', onMessage);
			worker.removeEventListener('error', onError);
			worker.terminate();
		};
		const settle = (action: () => void): void => {
			if (settled) {
				return;
			}
			settled = true;
			cleanup();
			action();
		};
		const onAbort = (): void => settle(() => reject(new ToolExecutionError('cancelled')));
		const onMessage = (event: MessageEvent<unknown>): void => {
			try {
				const value = options.parse(event.data);
				settle(() => resolve(value));
			} catch (error: unknown) {
				settle(() => reject(error));
			}
		};
		const onError = (): void => settle(() => reject(new ToolExecutionError('worker')));
		const timer = setTimeout(
			() => settle(() => reject(new ToolExecutionError('timeout'))),
			options.timeoutMs,
		);

		worker.addEventListener('message', onMessage);
		worker.addEventListener('error', onError);
		options.signal?.addEventListener('abort', onAbort, { once: true });
		if (options.signal?.aborted) {
			onAbort();
			return;
		}
		try {
			worker.postMessage(message);
		} catch (error: unknown) {
			settle(() => reject(error));
		}
	});
}
