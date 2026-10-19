import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { TOOLS } from '../registry/tools';
import type { Locale, Localized } from '../models/tool';

interface Preferences {
  readonly locale: Locale;
  readonly theme: 'light' | 'dark';
  readonly favorites: readonly string[];
  readonly recent: readonly string[];
}
const KEY = 'toolbox.preferences.v1';
export function readPreferences(value: string | null): Preferences {
  const fallback: Preferences = { locale: 'pt', theme: 'light', favorites: [], recent: [] };
  try {
    const data: unknown = JSON.parse(value ?? 'null');
    if (typeof data !== 'object' || data === null) return fallback;
    const ids = (list: unknown): readonly string[] =>
      Array.isArray(list)
        ? [
            ...new Set(
              list.filter(
                (id: unknown): id is string =>
                  typeof id === 'string' && TOOLS.some((t) => t.id === id),
              ),
            ),
          ].slice(0, 18)
        : [];
    return {
      locale: 'locale' in data && data.locale === 'en' ? 'en' : 'pt',
      theme: 'theme' in data && data.theme === 'dark' ? 'dark' : 'light',
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
  readonly storageUnavailable = signal(false);
  private readonly saved = this.read();
  readonly locale = signal<Locale>(this.saved.locale);
  readonly theme = signal<'light' | 'dark'>(this.saved.theme);
  readonly favorites = signal<readonly string[]>(this.saved.favorites);
  readonly recent = signal<readonly string[]>(this.saved.recent);
  readonly favoriteTools = computed(() => TOOLS.filter((t) => this.favorites().includes(t.id)));
  readonly recentTools = computed(() =>
    this.recent().flatMap((id) => TOOLS.filter((t) => t.id === id)),
  );
  constructor() {
    effect(() => {
      this.document.documentElement.dataset['theme'] = this.theme();
      this.document.documentElement.lang = this.locale() === 'pt' ? 'pt-BR' : 'en';
    });
  }
  t(value: Localized): string {
    return value[this.locale()];
  }
  label(pt: string, en: string): string {
    return this.locale() === 'pt' ? pt : en;
  }
  toggleTheme(): void {
    this.theme.update((v) => (v === 'light' ? 'dark' : 'light'));
    this.save();
  }
  toggleLocale(): void {
    this.locale.update((v) => (v === 'pt' ? 'en' : 'pt'));
    this.save();
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
          favorites: this.favorites(),
          recent: this.recent(),
        }),
      );
    } catch {
      this.storageUnavailable.set(true);
    }
  }
}
