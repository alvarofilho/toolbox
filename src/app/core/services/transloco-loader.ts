import { Injectable } from '@angular/core';
import type { TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class ToolboxTranslocoLoader implements TranslocoLoader {
	getTranslation(lang: string) {
		if (lang === 'en') {
			return import('@app/i18n/en.json').then((module) => module.default);
		}
		if (lang === 'es') {
			return import('@app/i18n/es.json').then((module) => module.default);
		}
		return import('@app/i18n/pt.json').then((module) => module.default);
	}
}
