import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { select } from '@app/features/tools/_shared/controls';

import { file, firstFile } from '@app/features/tools/_shared/files';

import { field } from '@app/core/models/tool';

import { bytesBase64 } from '@app/features/tools/_shared/bytes';

export const definition = tool(
	'sri',
	[
		file(),
		select(
			'algorithm',
			'Algoritmo',
			'Algorithm',
			[
				['SHA-256', 'SHA-256', 'SHA-256'],
				['SHA-384', 'SHA-384', 'SHA-384'],
				['SHA-512', 'SHA-512', 'SHA-512'],
			],
			undefined,
			'tools.sri',
		),
	],
	async (v, files) => {
		const f = firstFile(files),
			alg = field(v, 'algorithm');
		return result(
			`${alg.toLowerCase().replace('-', '')}-${bytesBase64(new Uint8Array(await crypto.subtle.digest(alg, await f.arrayBuffer())))}`,
			'integrity.txt',
		);
	},
);
