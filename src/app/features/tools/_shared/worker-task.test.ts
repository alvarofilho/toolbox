import { describe, expect, it } from 'vitest';
import { ToolExecutionError } from '@app/core/models/tool';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

function fakeWorker() {
	const target = new EventTarget();
	let terminated = false;
	let posted: unknown;
	return {
		worker: Object.assign(target, {
			postMessage: (message: unknown) => (posted = message),
			terminate: () => (terminated = true),
		}) as unknown as Worker,
		get terminated() {
			return terminated;
		},
		get posted() {
			return posted;
		},
		respond(data: unknown) {
			target.dispatchEvent(new MessageEvent('message', { data }));
		},
	};
}

const parseNumber = (value: unknown): number => {
	if (typeof value !== 'number') {
		throw new Error('Invalid response');
	}
	return value;
};

describe('runWorkerTask', () => {
	it('terminates the worker and ignores late results when cancelled during execution', async () => {
		const controller = new AbortController();
		const instance = fakeWorker();
		const result = runWorkerTask(
			() => instance.worker,
			{ run: true },
			{
				signal: controller.signal,
				timeoutMs: 1000,
				parse: parseNumber,
			},
		);

		controller.abort();

		await expect(result).rejects.toMatchObject({ kind: 'cancelled' });
		expect(instance.terminated).toBe(true);
		instance.respond(1);
	});

	it('does not create a worker when cancellation happened before start', async () => {
		const controller = new AbortController();
		controller.abort();
		let created = false;

		await expect(
			runWorkerTask(
				() => {
					created = true;
					return fakeWorker().worker;
				},
				{},
				{ signal: controller.signal, timeoutMs: 1000, parse: parseNumber },
			),
		).rejects.toMatchObject({ kind: 'cancelled' });
		expect(created).toBe(false);
	});

	it('cleans up after completion and allows an independent next run', async () => {
		const controller = new AbortController();
		const first = fakeWorker();
		const firstRun = runWorkerTask(
			() => first.worker,
			{ run: 1 },
			{
				signal: controller.signal,
				timeoutMs: 1000,
				parse: parseNumber,
			},
		);
		first.respond(1);
		await expect(firstRun).resolves.toBe(1);
		expect(first.terminated).toBe(true);
		controller.abort();
		first.respond(99);

		const second = fakeWorker();
		const secondRun = runWorkerTask(
			() => second.worker,
			{ run: 2 },
			{
				timeoutMs: 1000,
				parse: parseNumber,
			},
		);
		expect(second.posted).toEqual({ run: 2 });
		second.respond(2);
		await expect(secondRun).resolves.toBe(2);
		expect(second.terminated).toBe(true);
	});

	it('reports timeout as a separate execution state and terminates the worker', async () => {
		const instance = fakeWorker();
		const result = runWorkerTask(
			() => instance.worker,
			{},
			{
				timeoutMs: 1,
				parse: parseNumber,
			},
		);

		await expect(result).rejects.toBeInstanceOf(ToolExecutionError);
		await expect(result).rejects.toMatchObject({ kind: 'timeout' });
		expect(instance.terminated).toBe(true);
	});
});
