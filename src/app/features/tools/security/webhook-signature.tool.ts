import 'reflect-metadata';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source, input, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { secret } from '@app/features/tools/security/controls';

import { hmac } from '@app/features/tools/security/hmac';

export const definition = tool(
	'webhook-signature',
	[
		source,
		secret,
		select(
			'provider',
			'tools.webhook-signature.format',
			[
				['github', 'tools.webhook-signature.github_sha_256'],
				['stripe', 'tools.webhook-signature.stripe_v1'],
				['raw', 'tools.webhook-signature.hmac_sha_256'],
			],
			undefined,
		),
		input('timestamp', 'tools.webhook-signature.unix_timestamp_stripe', '1767225600', 'text'),
	],
	async (v) => {
		const provider = field(v, 'provider'),
			stamp = field(v, 'timestamp');
		if (provider === 'stripe' && !/^\d{1,12}$/.test(stamp)) {
			throw new Error('Timestamp inválido / Invalid timestamp');
		}
		const signature = await hmac(
			provider === 'stripe' ? `${stamp}.${field(v, 'input')}` : field(v, 'input'),
			field(v, 'secret'),
		);
		return result(
			provider === 'github'
				? `sha256=${signature}`
				: provider === 'stripe'
					? `t=${stamp},v1=${signature}`
					: signature,
			'signature.txt',
		);
	},
	{ input: '{"event":"test"}', secret: 'test-secret' },
);
