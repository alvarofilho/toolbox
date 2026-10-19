import { DOCUMENT } from '@angular/common';
import {
	computed,
	DestroyRef,
	effect,
	inject,
	Injectable,
	signal,
	PendingTasks,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { TOOLS } from '@app/features/tools/catalog/tools';
import type { Locale } from '@app/core/models/tool';

interface Preferences {
	readonly locale: Locale;
	readonly theme: 'light' | 'dark';
	readonly themeMode: 'system' | 'light' | 'dark';
	readonly favorites: readonly string[];
	readonly recent: readonly string[];
}

const KEY = 'toolbox.preferences.v1';

export function readPreferences(value: string | null): Preferences {
	const fallback: Preferences = {
		locale: 'pt',
		theme: 'light',
		themeMode: 'system',
		favorites: [],
		recent: [],
	};
	try {
		const data: unknown = JSON.parse(value ?? 'null');
		if (typeof data !== 'object' || data === null) {
			return fallback;
		}
		const ids = (list: unknown): readonly string[] =>
			Array.isArray(list)
				? [
						...new Set(
							list.filter(
								(id: unknown): id is string =>
									typeof id === 'string' && TOOLS.some((t) => t.id === id),
							),
						),
					]
				: [];
		const themeMode =
			'themeMode' in data &&
			(data.themeMode === 'system' || data.themeMode === 'light' || data.themeMode === 'dark')
				? data.themeMode
				: 'theme' in data && data.theme === 'dark'
					? 'dark'
					: 'system';
		return {
			locale:
				'locale' in data && (data.locale === 'en' || data.locale === 'es') ? data.locale : 'pt',
			theme: themeMode === 'dark' ? 'dark' : 'light',
			themeMode,
			favorites: ids('favorites' in data ? data.favorites : []),
			recent: ids('recent' in data ? data.recent : []).slice(0, 8),
		};
	} catch {
		return fallback;
	}
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
	private readonly document = inject(DOCUMENT);
	private readonly transloco = inject(TranslocoService);
	private readonly pendingTasks = inject(PendingTasks);
	private readonly destroyRef = inject(DestroyRef);
	private readonly systemThemeQuery = this.document.defaultView?.matchMedia?.(
		'(prefers-color-scheme: dark)',
	);

	readonly translationsReady = signal(false);
	readonly storageUnavailable = signal(false);
	private readonly saved = this.read();
	readonly locale = signal<Locale>(this.saved.locale);
	readonly themeMode = signal<Preferences['themeMode']>(this.saved.themeMode);
	readonly theme = signal<'light' | 'dark'>(
		this.saved.themeMode === 'system' && this.systemThemeQuery?.matches ? 'dark' : this.saved.theme,
	);

	readonly favorites = signal<readonly string[]>(this.saved.favorites);
	readonly recent = signal<readonly string[]>(this.saved.recent);
	readonly favoriteTools = computed(() => TOOLS.filter((t) => this.favorites().includes(t.id)));
	readonly recentTools = computed(() =>
		this.recent().flatMap((id) => TOOLS.filter((t) => t.id === id)),
	);

	constructor() {
		const initialLocale = this.locale();
		this.loadLocale(initialLocale);
		this.systemThemeQuery?.addEventListener('change', this.onSystemThemeChange);
		this.destroyRef.onDestroy(() =>
			this.systemThemeQuery?.removeEventListener('change', this.onSystemThemeChange),
		);
		effect(() => {
			this.document.documentElement.dataset['theme'] = this.theme();
			this.document.documentElement.lang =
				this.locale() === 'pt' ? 'pt-BR' : this.locale() === 'es' ? 'es' : 'en';
		});
	}

	toggleTheme(): void {
		this.theme.update((v) => (v === 'light' ? 'dark' : 'light'));
		this.themeMode.set(this.theme());
		this.save();
	}

	private readonly onSystemThemeChange = (event: MediaQueryListEvent): void => {
		if (this.themeMode() === 'system') {
			this.theme.set(event.matches ? 'dark' : 'light');
		}
	};

	toggleLocale(): void {
		const next = this.locale() === 'pt' ? 'en' : this.locale() === 'en' ? 'es' : 'pt';
		this.setLocale(next);
	}

	setLocale(locale: Locale): void {
		if (this.locale() === locale) {
			return;
		}
		this.locale.set(locale);
		this.document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en';
		this.transloco.setActiveLang(locale);
		this.translationsReady.set(false);
		this.save();
		this.loadLocale(locale);
	}

	private loadLocale(locale: Locale): void {
		this.pendingTasks.run(async () => {
			await firstValueFrom(this.transloco.load(locale));
			if (this.locale() === locale) {
				this.transloco.setActiveLang(locale);
				this.translationsReady.set(true);
			}
		});
	}

	toggleFavorite(id: string): void {
		this.favorites.update((ids) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
		this.save();
	}

	visit(id: string): void {
		if (TOOLS.some((t) => t.id === id)) {
			this.recent.update((ids) => [id, ...ids.filter((v) => v !== id)].slice(0, 8));
			this.save();
		}
	}

	clearRecent(): void {
		this.recent.set([]);
		this.save();
	}

	private read(): Preferences {
		try {
			return readPreferences(localStorage.getItem(KEY));
		} catch {
			this.storageUnavailable.set(true);
			return readPreferences(null);
		}
	}

	private save(): void {
		try {
			localStorage.setItem(
				KEY,
				JSON.stringify({
					locale: this.locale(),
					theme: this.theme(),
					themeMode: this.themeMode(),
					favorites: this.favorites(),
					recent: this.recent(),
				}),
			);
		} catch {
			this.storageUnavailable.set(true);
		}
	}
}
