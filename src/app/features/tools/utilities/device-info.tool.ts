import { result, tool } from '@app/features/tools/_shared/definition';

export const definition = tool('device-info', [], () =>
	result({
		browserUserAgent: navigator.userAgent,
		platform: navigator.platform,
		language: navigator.language,
		languages: navigator.languages,
		screen: { width: screen.width, height: screen.height, pixelRatio: devicePixelRatio },
		viewport: { width: innerWidth, height: innerHeight },
		hardwareConcurrency: navigator.hardwareConcurrency,
		touchPoints: navigator.maxTouchPoints,
	}),
);
