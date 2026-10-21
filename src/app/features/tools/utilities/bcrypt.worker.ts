/// <reference lib="webworker" />

import { compare, hash } from 'bcryptjs';

type BcryptRequest =
	| { readonly mode: 'hash'; readonly password: string; readonly cost: number }
	| { readonly mode: 'verify'; readonly password: string; readonly hash: string };

const validHash = /^\$2[aby]\$(0[4-9]|1[0-4])\$[./A-Za-z0-9]{53}$/;

addEventListener('message', async ({ data }: MessageEvent<BcryptRequest>) => {
	try {
		if (data.mode === 'hash') {
			postMessage({ hash: await hash(data.password, data.cost), cost: data.cost });
			return;
		}
		if (data.mode === 'verify' && validHash.test(data.hash)) {
			postMessage({ matches: await compare(data.password, data.hash) });
			return;
		}
		postMessage({ error: 'Invalid bcrypt request' });
	} catch (error: unknown) {
		postMessage({ error: error instanceof Error ? error.message : 'Bcrypt operation failed' });
	}
});
