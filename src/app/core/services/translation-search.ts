import { inject, Injectable, signal } from '@angular/core';
import type { TranslationKey } from '@app/core/models/translation-key';
import { ToolboxTranslocoLoader } from '@app/core/services/transloco-loader';

function isTranslationBranch(value: unknown): value is Readonly<Record<string, unknown>> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function indexTranslations(
	dictionary: Readonly<Record<string, unknown>>,
	prefix = '',
): Map<string, string> {
	const entries = new Map<string, string>();
	for (const [name, value] of Object.entries(dictionary)) {
		const key = prefix ? `${prefix}.${name}` : name;
		if (typeof value === 'string') {
			entries.set(key, value);
		} else if (isTranslationBranch(value)) {
			for (const [nestedKey, text] of indexTranslations(value, key)) {
				entries.set(nestedKey, text);
			}
		}
	}
	return entries;
}

@Injectable({ providedIn: 'root' })
export class TranslationSearch {
	private readonly loader = inject(ToolboxTranslocoLoader);
	private readonly indexes = signal<readonly ReadonlyMap<string, string>[]>([]);

	constructor() {
		void this.load();
	}

	text(key: TranslationKey): string {
		return this.indexes()
			.map((index) => index.get(key) ?? '')
			.join(' ');
	}

	private async load(): Promise<void> {
		const dictionaries = await Promise.all(
			['pt', 'en', 'es'].map((locale) => this.loader.getTranslation(locale)),
		);
		this.indexes.set(dictionaries.map((dictionary) => indexTranslations(dictionary)));
	}
}
