import { describe, expect, it, vi } from 'vitest';
import { WebMcpWorkbench } from '@app/core/services/webmcp-workbench';

describe('WebMcpWorkbench', () => {
	it('forwards requests and removes the handler with its route lifecycle', async () => {
		const workbench = new WebMcpWorkbench();
		const result = { output: 'formatted' };
		const handler = vi.fn().mockResolvedValue(result);
		const unregister = workbench.register('json-formatter', handler, vi.fn());
		const request = {
			toolId: 'json-formatter' as const,
			values: { input: '{"ok":true}', indent: '2' },
			signal: new AbortController().signal,
		};

		await expect(workbench.execute(request)).resolves.toBe(result);
		expect(handler).toHaveBeenCalledWith(request);
		unregister();
		await expect(workbench.execute(request)).rejects.toThrow('not ready');
	});

	it('does not let an old route cleanup remove a replacement handler', async () => {
		const workbench = new WebMcpWorkbench();
		const request = {
			toolId: 'base64' as const,
			values: { input: 'text', mode: 'encode' },
			signal: new AbortController().signal,
		};
		const unregisterOld = workbench.register('base64', async () => ({ output: 'old' }), vi.fn());
		workbench.register('base64', async () => ({ output: 'new' }), vi.fn());

		unregisterOld();
		await expect(workbench.execute(request)).resolves.toEqual({ output: 'new' });
	});

	it('reports invalid arguments to the active workbench', () => {
		const workbench = new WebMcpWorkbench();
		const reportError = vi.fn();
		workbench.register('uuid', async () => ({ output: '' }), reportError);

		workbench.reportError('uuid', new Error('count is invalid'));
		expect(reportError).toHaveBeenCalledWith('count is invalid');
	});
});
