import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { ToolboxTranslocoLoader } from '@app/core/services/transloco-loader';

export function provideToolboxTransloco() {
	return provideTransloco({
		config: {
			availableLangs: ['pt', 'en', 'es'],
			defaultLang: 'pt',
			fallbackLang: 'en',
			reRenderOnLangChange: true,
			missingHandler: { logMissingKey: false, useFallbackTranslation: false, allowEmpty: true },
			prodMode: !isDevMode(),
		},
		loader: ToolboxTranslocoLoader,
	});
}
