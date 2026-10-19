import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'http-headers',
	[source],
	(v) => {
		const headers: Record<string, string[]> = {};
		Object.setPrototypeOf(headers, null);
		for (const line of field(v, 'input').split(/\r?\n/).filter(Boolean)) {
			if (/^HTTP\/\d(?:\.\d)? \d{3}/.test(line)) {
				continue;
			}
			const match = /^([!#$%&'*+.^_`|~\w-]+):\s*(.*)$/.exec(line);
			if (!match) {
				throw new Error(`Header inválido / Invalid header: ${line}`);
			}
			const key = match[1].toLowerCase();
			headers[key] = [...(headers[key] ?? []), match[2]];
		}
		return result({
			headers,
			duplicates: Object.keys(headers).filter((k) => headers[k].length > 1),
			missingSecurityHeaders: [
				'content-security-policy',
				'strict-transport-security',
				'x-content-type-options',
				'referrer-policy',
			].filter((k) => !headers[k]),
			note: 'Presence analysis only; values require contextual review.',
		});
	},
	{
		input:
			'HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: no-store\nX-Content-Type-Options: nosniff',
	},
);
