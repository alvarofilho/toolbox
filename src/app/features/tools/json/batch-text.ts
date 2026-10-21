import JSZip from 'jszip';
import {
	ToolExecutionError,
	type ToolDefinition,
	type ToolFiles,
	type ToolValues,
} from '@app/core/models/tool';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';
import { select } from '@app/features/tools/_shared/controls';

const MAX_FILES = 20;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 50 * 1024 * 1024;
const CONCURRENCY = 2;

function safeName(name: string): string {
	const leaf = name.replace(/\\/g, '/').split('/').pop() ?? 'file';
	const normalized = leaf
		.normalize('NFC')
		.replace(/[^\p{L}\p{N}._-]+/gu, '_')
		.replace(/^\.+/, '');
	return normalized || 'file';
}

function uniqueName(name: string, used: Set<string>): string {
	const dot = name.lastIndexOf('.');
	const stem = dot > 0 ? name.slice(0, dot) : name;
	const ext = dot > 0 ? name.slice(dot) : '';
	let candidate = name;
	let index = 2;
	while (used.has(candidate.toLocaleLowerCase())) {
		candidate = `${stem} (${index++})${ext}`;
	}
	used.add(candidate.toLocaleLowerCase());
	return candidate;
}

async function transformFile(
	file: File,
	operation: string,
	indent: string,
	signal: AbortSignal,
): Promise<string> {
	const text = await file.text();
	if (signal.aborted) {
		throw new ToolExecutionError('cancelled');
	}
	return runWorkerTask(
		() => new Worker(new URL('./batch-text.worker', import.meta.url), { type: 'module' }),
		{ text, operation, indent },
		{
			signal,
			timeoutMs: 30_000,
			parse: (value: unknown) => {
				if (typeof value !== 'object' || value === null) {
					throw new Error('Invalid worker response');
				}
				if ('error' in value && typeof value.error === 'string') {
					throw new Error(value.error);
				}
				if ('output' in value && typeof value.output === 'string') {
					return value.output;
				}
				throw new Error('Invalid worker response');
			},
		},
	);
}

export const definition: ToolDefinition = {
	id: 'batch-text',
	controls: [
		{
			key: 'files',
			label: 'tools.batch-text.files',
			type: 'file',
			accept: '.json,.csv,text/csv,application/json',
			multiple: true,
			value: '',
		},
		select('operation', 'tools.batch-text.transformation', [
			['json-format', 'tools.batch-text.json_format'],
			['json-minify', 'tools.batch-text.json_minify'],
			['csv-json', 'tools.batch-text.csv_to_json'],
		]),
		select(
			'indent',
			'tools.json-formatter.indentation',
			[
				['2', 'tools.json-formatter.2_spaces'],
				['4', 'tools.json-formatter.4_spaces'],
			],
			'2',
		),
	],
	action: 'tools.batch-text.process_and_download_zip',
	execution: 'manual',
	run: async (values: ToolValues, files: ToolFiles = {}, signal = new AbortController().signal) => {
		const selected = files['files'] ?? [];
		if (!selected.length) {
			throw new Error('Select at least one file.');
		}
		if (
			selected.length > MAX_FILES ||
			selected.some((file) => file.size > MAX_FILE_BYTES) ||
			selected.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES
		) {
			throw new Error('Batch limits: 20 files, 20 MB per file, 50 MB total.');
		}
		const zip = new JSZip();
		const used = new Set<string>();
		const successes: string[] = [];
		const failures: string[] = [];
		let cursor = 0;
		let outputBytes = 0;
		const worker = async (): Promise<void> => {
			while (cursor < selected.length) {
				if (signal.aborted) {
					throw new ToolExecutionError('cancelled');
				}
				const index = cursor++;
				const file = selected[index];
				if (!file) {
					continue;
				}
				try {
					const output = await transformFile(
						file,
						values['operation'] ?? 'json-format',
						values['indent'] ?? '2',
						signal,
					);
					const bytes = new Blob([output]).size;
					if (outputBytes + bytes > MAX_OUTPUT_BYTES) {
						throw new Error('Output exceeds 50 MB.');
					}
					outputBytes += bytes;
					const converted =
						values['operation'] === 'csv-json'
							? `${safeName(file.name).replace(/\.csv$/i, '')}.json`
							: safeName(file.name);
					const outputName = uniqueName(converted, used);
					zip.file(outputName, output);
					successes.push(`${file.name} → ${outputName}`);
				} catch (error: unknown) {
					if (signal.aborted) {
						throw new ToolExecutionError('cancelled');
					}
					failures.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		};
		await Promise.all(
			Array.from({ length: Math.min(CONCURRENCY, selected.length) }, () => worker()),
		);
		if (signal.aborted) {
			throw new ToolExecutionError('cancelled');
		}
		if (!successes.length) {
			throw new Error(`No files were converted.\n${failures.join('\n')}`);
		}
		const blob = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			compressionOptions: { level: 5 },
		});
		if (blob.size > MAX_OUTPUT_BYTES) {
			throw new Error('ZIP exceeds 50 MB.');
		}
		return {
			output: `Converted: ${successes.length}\n${successes.join('\n')}\nFailed: ${failures.length}${failures.length ? `\n\n${failures.join('\n')}` : ''}`,
			filename: 'converted-files.zip',
			mime: 'application/zip',
			artifacts: [{ blob, filename: 'converted-files.zip' }],
		};
	},
};
