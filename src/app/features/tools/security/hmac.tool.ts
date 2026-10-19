import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { secret, algorithm } from '@app/features/tools/security/controls';

import { hmac } from '@app/features/tools/security/hmac';

export const definition = tool(
	'hmac',
	[source, secret, algorithm],
	async (v) =>
		result(await hmac(field(v, 'input'), field(v, 'secret'), field(v, 'algorithm')), 'hmac.txt'),
	{ input: 'message', secret: 'test-secret' },
);
