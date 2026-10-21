import { TranslatedToolError, type ToolControl, type ToolFiles } from '@app/core/models/tool';

export const file = (accept = '', multiple = false): ToolControl => ({
	key: 'files',
	label: 'common.local_files_up_to_20_mb_each',
	type: 'file',
	value: '',
	accept,
	multiple,
});

export function filesFrom(files?: ToolFiles): readonly File[] {
	const selected = files?.['files'] ?? [];
	if (!selected.length) {
		throw new TranslatedToolError('common.select_files_to_continue', {}, 'files');
	}
	if (
		selected.length > 20 ||
		selected.some((f) => f.size > 20 * 1024 * 1024) ||
		selected.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
	) {
		throw new TranslatedToolError('common.file_size_or_count_limit', {}, 'files');
	}
	return selected;
}

export function firstFile(files?: ToolFiles): File {
	const selected = filesFrom(files);
	if (selected.length !== 1) {
		throw new TranslatedToolError('common.select_one_file_to_continue', {}, 'files');
	}
	return selected[0];
}
