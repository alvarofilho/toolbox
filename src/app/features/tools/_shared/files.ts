import { text, type ToolControl, type ToolFiles } from '@app/core/models/tool';

export const file = (accept = '', multiple = false): ToolControl => ({
	key: 'files',
	label: text('Arquivos locais (até 20 MB cada)', 'Local files (up to 20 MB each)'),
	type: 'file',
	value: '',
	accept,
	multiple,
});

export function filesFrom(files?: ToolFiles): readonly File[] {
	const selected = files?.['files'] ?? [];
	if (!selected.length) {
		throw new Error('Selecione arquivos / Select files');
	}
	if (
		selected.length > 20 ||
		selected.some((f) => f.size > 20 * 1024 * 1024) ||
		selected.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
	) {
		throw new Error('Limite: 20 arquivos, 20 MB por arquivo, 50 MB no total / File limit exceeded');
	}
	return selected;
}

export function firstFile(files?: ToolFiles): File {
	const selected = filesFrom(files);
	if (selected.length !== 1) {
		throw new Error('Selecione um arquivo / Select one file');
	}
	return selected[0];
}
