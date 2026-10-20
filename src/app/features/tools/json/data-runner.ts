import { ToolExecutionError, TranslatedToolError } from '@app/core/models/tool';
import type { DataTask } from '@app/features/tools/json/data-processing';
import { object } from '@app/features/tools/_shared/data';
import { runWorkerTask } from '@app/features/tools/_shared/worker-task';

type DataErrorKey =
	| 'common.json_syntax_error'
	| 'common.json_syntax_error_generic'
	| 'common.json_object_required'
	| 'tools.jsonpath.invalid_expression';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDataErrorKey(value: unknown): value is DataErrorKey {
	return (
		value === 'common.json_syntax_error' ||
		value === 'common.json_syntax_error_generic' ||
		value === 'common.json_object_required' ||
		value === 'tools.jsonpath.invalid_expression'
	);
}

function errorParams(value: unknown): Readonly<Record<string, string | number>> {
	if (!isRecord(value)) {
		return {};
	}
	return Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [string, string | number] =>
				typeof entry[1] === 'string' || typeof entry[1] === 'number',
		),
	);
}

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
				const failure = data['error'];
				if (isRecord(failure)) {
					const translationKey = failure['translationKey'];
					if (isDataErrorKey(translationKey)) {
						const fieldKey =
							translationKey === 'tools.jsonpath.invalid_expression' ? 'path' : 'input';
						throw new TranslatedToolError(
							translationKey,
							errorParams(failure['params']),
							fieldKey,
						);
					}
					if (typeof failure['message'] === 'string') {
						throw new ToolExecutionError('input', failure['message']);
					}
					throw new ToolExecutionError('worker');
				}
				if (typeof failure === 'string') {
					throw new ToolExecutionError('input', failure);
				}
				if (Object.hasOwn(data, 'value')) {
					return data['value'];
				}
				throw new ToolExecutionError('worker');
			},
		},
	);
}
