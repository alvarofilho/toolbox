import { Injectable } from '@angular/core';
import type { TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class ToolboxTranslocoLoader implements TranslocoLoader {
	async getTranslation(lang: string) {
		if (lang === 'en') {
			const module = await import('@app/i18n/en.json');
			return module.default;
		}
		if (lang === 'es') {
			const module_1 = await import('@app/i18n/es.json');
			return module_1.default;
		}
		const module_2 = await import('@app/i18n/pt.json');
		return module_2.default;
	}
}
