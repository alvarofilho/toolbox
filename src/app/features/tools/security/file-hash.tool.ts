import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { file, firstFile } from '@app/features/tools/_shared/files';

import { field } from '@app/core/models/tool';

import { bytesHex } from '@app/features/tools/_shared/bytes';

import { algorithm } from '@app/features/tools/security/controls';

export const definition = tool('file-hash', [file(), algorithm], async (v, files) => {
	const f = firstFile(files);
	return result({
		filename: f.name,
		bytes: f.size,
		algorithm: field(v, 'algorithm'),
		hash: bytesHex(
			new Uint8Array(await crypto.subtle.digest(field(v, 'algorithm'), await f.arrayBuffer())),
		),
	});
});
