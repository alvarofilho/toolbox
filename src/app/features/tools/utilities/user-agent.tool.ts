import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

export const definition = tool('user-agent', [source], (v) => {
	const ua = field(v, 'input');
	const browser = /Edg\//.test(ua)
		? 'Microsoft Edge'
		: /Firefox\//.test(ua)
			? 'Firefox'
			: /Chrome\//.test(ua)
				? 'Chrome'
				: /Safari\//.test(ua)
					? 'Safari'
					: 'Desconhecido';
	const os = /Windows NT/.test(ua)
		? 'Windows'
		: /Android/.test(ua)
			? 'Android'
			: /iPhone|iPad|iOS/.test(ua)
				? 'iOS'
				: /Mac OS X/.test(ua)
					? 'macOS'
					: /Linux/.test(ua)
						? 'Linux'
						: 'Desconhecido';
	const version =
		browser === 'Microsoft Edge'
			? ua.match(/Edg\/([\d.]+)/)?.[1]
			: browser === 'Firefox'
				? ua.match(/Firefox\/([\d.]+)/)?.[1]
				: browser === 'Chrome'
					? ua.match(/Chrome\/([\d.]+)/)?.[1]
					: ua.match(/Version\/([\d.]+)/)?.[1];
	return result({ browser, version: version ?? null, operatingSystem: os, raw: ua });
});
