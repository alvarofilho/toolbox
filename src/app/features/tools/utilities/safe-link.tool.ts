import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

export const definition = tool('safe-link', [source], (v) => {
	let current = field(v, 'input').trim();
	const chain: string[] = [];
	for (let depth = 0; depth < 5; depth++) {
		let parsed: URL;
		try {
			parsed = new URL(current);
		} catch {
			break;
		}
		const next =
			parsed.searchParams.get('url') ??
			parsed.searchParams.get('q') ??
			parsed.searchParams.get('target');
		if (!next || next === current) {
			break;
		}
		chain.push(parsed.hostname);
		current = next;
	}
	return result({
		decodedUrl: current,
		wrappers: chain,
		protocol: (() => {
			try {
				return new URL(current).protocol;
			} catch {
				return null;
			}
		})(),
	});
});
