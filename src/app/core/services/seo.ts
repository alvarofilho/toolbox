import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { PreferencesService } from '@app/core/services/preferences';
import type { Locale, TranslationKey } from '@app/core/models/tool';
import { CATEGORIES, TOOLS } from '@app/features/tools/catalog/tools';

const SITE_ORIGIN = 'https://toolbox.alvaro.dev.br';

@Injectable({ providedIn: 'root' })
export class SeoService {
	private readonly router = inject(Router);
	private readonly document = inject(DOCUMENT);
	private readonly meta = inject(Meta);
	private readonly title = inject(Title);
	private readonly preferences = inject(PreferencesService);
	private readonly transloco = inject(TranslocoService);
	private readonly currentUrl = signal(this.router.url);

	constructor() {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				takeUntilDestroyed(),
			)
			.subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));

		effect(() => {
			if (this.preferences.translationsReady()) {
				this.update(this.currentUrl(), this.preferences.locale());
			}
		});
	}

	private update(url: string, locale: Locale): void {
		const parsedUrl = new URL(url, SITE_ORIGIN);
		const path = parsedUrl.pathname.replace(/\/$/, '') || '/';
		const pathSegments = path.split('/').filter(Boolean);
		const tool =
			pathSegments[0] === 'tools' ? TOOLS.find((item) => item.id === pathSegments[1]) : undefined;
		const category =
			pathSegments[0] === 'category'
				? CATEGORIES.find((item) => item.id === pathSegments[1])
				: undefined;
		const title = this.routeTitle(path, locale, tool, category);
		const description = tool
			? `${this.localized(tool.description, locale)} ${this.localized(
					'seo.tool_description_suffix',
					locale,
				)}`
			: category
				? this.localized(category.name, locale)
				: this.localized('seo.description', locale);
		const privateRoute =
			path === '/favorites' ||
			path === '/recent' ||
			pathSegments.length > 2 ||
			!this.isKnownRoute(path, tool, category);
		const noindex = privateRoute || parsedUrl.searchParams.has('q');
		const canonical = new URL(path, SITE_ORIGIN).href;
		const image = `${SITE_ORIGIN}/og-image.png`;

		this.title.setTitle(title);
		this.meta.updateTag({ name: 'description', content: description });
		this.meta.updateTag({
			name: 'robots',
			content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
		});
		this.meta.updateTag({ property: 'og:type', content: 'website' });
		this.meta.updateTag({ property: 'og:site_name', content: 'Toolbox' });
		this.meta.updateTag({
			property: 'og:locale',
			content: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
		});
		this.meta.updateTag({ property: 'og:title', content: title });
		this.meta.updateTag({ property: 'og:description', content: description });
		this.meta.updateTag({ property: 'og:url', content: canonical });
		this.meta.updateTag({ property: 'og:image', content: image });
		this.meta.updateTag({ property: 'og:image:width', content: '1200' });
		this.meta.updateTag({ property: 'og:image:height', content: '630' });
		this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
		this.meta.updateTag({
			property: 'og:image:alt',
			content: this.localized('seo.image_alt', locale),
		});
		this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
		this.meta.updateTag({ name: 'twitter:title', content: title });
		this.meta.updateTag({ name: 'twitter:description', content: description });
		this.meta.updateTag({ name: 'twitter:image', content: image });

		let canonicalLink = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (!canonicalLink) {
			canonicalLink = this.document.createElement('link');
			canonicalLink.rel = 'canonical';
			this.document.head.append(canonicalLink);
		}
		canonicalLink.href = canonical;
	}

	private routeTitle(
		path: string,
		locale: Locale,
		tool: (typeof TOOLS)[number] | undefined,
		category: (typeof CATEGORIES)[number] | undefined,
	): string {
		if (tool) {
			return `${this.localized(tool.name, locale)} | Toolbox`;
		}
		if (category) {
			return `${this.localized(category.name, locale)} | Toolbox`;
		}
		if (path === '/') {
			return this.localized('seo.home_title', locale) + ' | Toolbox';
		}
		if (path === '/tools') {
			return this.localized('seo.tools_title', locale) + ' | Toolbox';
		}
		if (path === '/favorites') {
			return this.localized('seo.favorites_title', locale) + ' | Toolbox';
		}
		if (path === '/recent') {
			return this.localized('seo.recent_title', locale) + ' | Toolbox';
		}
		return this.localized('seo.not_found_title', locale) + ' | Toolbox';
	}

	private localized(value: TranslationKey, locale: Locale): string {
		return this.transloco.translate(value, {}, locale);
	}

	private isKnownRoute(
		path: string,
		tool: (typeof TOOLS)[number] | undefined,
		category: (typeof CATEGORIES)[number] | undefined,
	): boolean {
		return (
			path === '/' ||
			path === '/tools' ||
			path === '/favorites' ||
			path === '/recent' ||
			!!tool ||
			!!category
		);
	}
}
