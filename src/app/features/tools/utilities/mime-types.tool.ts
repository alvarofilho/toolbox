import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

const mimeByExtension: Readonly<Record<string, string>> = {
	avif: 'image/avif',
	css: 'text/css',
	csv: 'text/csv',
	gz: 'application/gzip',
	html: 'text/html',
	ico: 'image/vnd.microsoft.icon',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	js: 'text/javascript',
	json: 'application/json',
	md: 'text/markdown',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4',
	pdf: 'application/pdf',
	png: 'image/png',
	svg: 'image/svg+xml',
	tar: 'application/x-tar',
	txt: 'text/plain',
	wasm: 'application/wasm',
	webp: 'image/webp',
	xml: 'application/xml',
	yaml: 'application/yaml',
	yml: 'application/yaml',
	zip: 'application/zip',
};

export const definition = tool('mime-types', [source], (v) => {
	const raw = field(v, 'input').trim().toLowerCase();
	const extension = raw.includes('.') ? (raw.split('.').pop() ?? '') : raw.replace(/^\./, '');
	const mimeType = mimeByExtension[extension];
	if (!mimeType) {
		throw new Error(
			'Extensão não encontrada no catálogo local / Extension not found in local catalog',
		);
	}
	return result({ extension, mimeType });
});
