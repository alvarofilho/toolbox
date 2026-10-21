import { afterEach, describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import type { ToolFiles } from '@app/core/models/tool';
import { definition } from '@app/features/tools/json/batch-text';
import { transformBatchText } from '@app/features/tools/json/batch-text-processor';

class FakeWorker extends EventTarget {
	postMessage(message: unknown): void {
		const task = message as { text: string; operation: string; indent: string };
		setTimeout(() => {
			try {
				let output: string;
				if (task.operation === 'csv-json') {
					const [header = '', ...rows] = task.text.trim().split(/\r?\n/);
					const keys = header.split(',');
					output = JSON.stringify(
						rows.map((row) =>
							Object.fromEntries(row.split(',').map((value, index) => [keys[index] ?? '', value])),
						),
						null,
						2,
					);
				} else {
					output = JSON.stringify(
						JSON.parse(task.text),
						null,
						task.operation === 'json-format' ? Number(task.indent) : undefined,
					);
				}
				this.dispatchEvent(new MessageEvent('message', { data: { output } }));
			} catch (error: unknown) {
				this.dispatchEvent(
					new MessageEvent('message', {
						data: { error: error instanceof Error ? error.message : String(error) },
					}),
				);
			}
		}, 0);
	}
	terminate(): void {
		void this;
	}
}

afterEach(() => vi.unstubAllGlobals());

describe('batch text conversion', () => {
	it('converts CSV with quoted fields and Unicode using the shared parser', () => {
		const converted = transformBatchText('id,name\n1,"Ana, a\u00e7\u00e3o"', 'csv-json', '2');
		expect(JSON.parse(converted)).toEqual([{ id: '1', name: 'Ana, a\u00e7\u00e3o' }]);
		expect(transformBatchText('{"ok": true}', 'json-minify', '2')).toBe('{"ok":true}');
	});

	it('keeps valid Unicode outputs, reports failures and writes collision-safe ZIP entries', async () => {
		vi.stubGlobal('Worker', FakeWorker);
		const files: ToolFiles = {
			files: [
				new File(['{"nome":"ação"}'], 'folder/a.json'),
				new File(['{invalid'], 'a.json'),
				new File(['{"ok":true}'], 'other\\a.json'),
			],
		};
		const result = await definition.run({ operation: 'json-format', indent: '2' }, files);
		expect(result.output).toContain('Converted: 2');
		expect(result.output).toContain('Failed: 1');
		const archive = await JSZip.loadAsync(result.artifacts?.[0]?.blob ?? new Blob());
		expect(Object.keys(archive.files)).toEqual(['a.json', 'a (2).json']);
		expect(await archive.file('a.json')?.async('string')).toContain('ação');
	});

	it('enforces file count and bytes before starting workers', async () => {
		const files: ToolFiles = {
			files: Array.from({ length: 21 }, (_, index) => new File(['{}'], `${index}.json`)),
		};
		await expect(definition.run({ operation: 'json-format' }, files)).rejects.toThrow(
			'Batch limits',
		);
		const oversized = new File(['{}'], 'large.json');
		Object.defineProperty(oversized, 'size', { value: 20 * 1024 * 1024 + 1 });
		await expect(
			definition.run({ operation: 'json-format' }, { files: [oversized] }),
		).rejects.toThrow('Batch limits');
		const aggregate = Array.from({ length: 3 }, (_, index) => {
			const file = new File(['{}'], `${index}.json`);
			Object.defineProperty(file, 'size', { value: 17 * 1024 * 1024 });
			return file;
		});
		await expect(
			definition.run({ operation: 'json-format' }, { files: aggregate }),
		).rejects.toThrow('Batch limits');
	});

	it('terminates active file work on cancellation', async () => {
		vi.stubGlobal(
			'Worker',
			class extends FakeWorker {
				override postMessage(): void {
					void this;
				}
			},
		);
		const controller = new AbortController();
		const promise = definition.run(
			{ operation: 'json-format' },
			{ files: [new File(['{}'], 'a.json')] },
			controller.signal,
		);
		controller.abort();
		await expect(promise).rejects.toMatchObject({ kind: 'cancelled' });
	});
});
