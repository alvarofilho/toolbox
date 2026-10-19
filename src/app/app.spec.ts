import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslocoService } from '@jsverse/transloco';
import { App } from '@app/app';
import { routes } from '@app/app.routes';
import { provideToolboxTransloco } from '@app/core/services/transloco.providers';
import { PreferencesService, readPreferences } from '@app/core/services/preferences';
import { TOOLS } from '@app/features/tools/catalog/tools';
import { firstValueFrom } from 'rxjs';

// jsdom does not implement the native dialog top layer. Browser QA covers focus trapping.
function mockDialog(element: HTMLElement): HTMLDialogElement {
	const dialog = element.querySelector('dialog');
	if (!dialog) {
		throw new Error('Command dialog missing');
	}
	dialog.showModal = () => {
		dialog.open = true;
	};
	dialog.close = () => {
		dialog.open = false;
		dialog.dispatchEvent(new Event('close'));
	};
	return dialog;
}

describe('platform integration', () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.configureTestingModule({
			imports: [App],
			providers: [provideRouter(routes, withComponentInputBinding()), ...provideToolboxTransloco()],
		});
	});
	it('switches directly to the language selected in the header', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();
		const element: HTMLElement = fixture.nativeElement;
		const language = element.querySelector<HTMLSelectElement>('.language-select');
		if (!language) {
			throw new Error('Language selector missing');
		}
		language.value = 'es';
		language.dispatchEvent(new Event('change', { bubbles: true }));
		expect(TestBed.inject(PreferencesService).locale()).toBe('es');
		expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('es');
		await fixture.whenStable();
		expect(document.documentElement.lang).toBe('es');
	});
	it('opens the command palette, finds a tool and preserves mobile menu focus', async () => {
		const fixture = TestBed.createComponent(App);
		await TestBed.inject(Router).navigateByUrl('/');
		await fixture.whenStable();
		const element: HTMLElement = fixture.nativeElement;
		expect(element.querySelector('h1')?.textContent).toContain('Menos abas');
		const dialog = mockDialog(element);
		const trigger = element.querySelector<HTMLButtonElement>('#global-search');
		trigger?.click();
		await fixture.whenStable();
		expect(dialog.open).toBe(true);
		const search = element.querySelector<HTMLInputElement>('#command-search');
		if (!search) {
			throw new Error('Search missing');
		}
		search.focus();
		search.value = 'alfanumerico';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(element.querySelectorAll('[role=option]')).toHaveLength(1);
		expect(element.querySelector('[role=option]')?.textContent).toContain('CNPJ');
		expect(document.activeElement).toBe(search);
		expect(TestBed.inject(Router).url).toBe('/');
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await fixture.whenStable();
		expect(TestBed.inject(Router).url).toBe('/tools/cnpj');
		expect(dialog.open).toBe(false);
		expect(document.body.style.overflow).toBe('');
		const toggle = element.querySelector<HTMLButtonElement>('#menu-toggle');
		if (!toggle) {
			throw new Error('Menu toggle missing');
		}
		toggle.click();
		await fixture.whenStable();
		const controls = Array.from(
			element.querySelectorAll<HTMLElement>('#sidebar a[href], #sidebar button:not([disabled])'),
		);
		expect(document.activeElement).toBe(controls[0]);
		expect(element.querySelector('.app-body')?.hasAttribute('inert')).toBe(true);
		controls.at(-1)?.focus();
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
		);
		await fixture.whenStable();
		expect(document.activeElement).toBe(controls[0]);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await fixture.whenStable();
		expect(document.activeElement).toBe(toggle);
		expect(element.querySelector('.app-body')?.hasAttribute('inert')).toBe(false);
	});
	it('supports both shortcuts, wraps selection and resets it after filtering', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();
		const element: HTMLElement = fixture.nativeElement;
		const dialog = mockDialog(element);
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
		);
		await fixture.whenStable();
		expect(dialog.open).toBe(true);
		const search = element.querySelector<HTMLInputElement>('#command-search');
		if (!search) {
			throw new Error('Command search missing');
		}
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		await fixture.whenStable();
		expect(search.getAttribute('aria-activedescendant')).toBe('command-locale');
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await fixture.whenStable();
		expect(search.getAttribute('aria-activedescendant')).toBe('command-tool-json-formatter');
		search.value = 'FAVORITOS';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(search.getAttribute('aria-activedescendant')).toBe('command-favorites');
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await fixture.whenStable();
		expect(TestBed.inject(Router).url).toBe('/favorites');
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
		);
		await fixture.whenStable();
		expect(dialog.open).toBe(true);
		expect(search.value).toBe('');
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
		);
		await fixture.whenStable();
		expect(dialog.open).toBe(false);
	});
	it('executes theme and language actions and handles no matches safely', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();
		const element: HTMLElement = fixture.nativeElement;
		const dialog = mockDialog(element);
		const trigger = element.querySelector<HTMLButtonElement>('#global-search');
		const search = element.querySelector<HTMLInputElement>('#command-search');
		if (!trigger || !search) {
			throw new Error('Command controls missing');
		}
		for (const [query, id] of [
			['dark theme', 'theme'],
			['ingles', 'locale'],
		]) {
			trigger.click();
			await fixture.whenStable();
			search.value = query;
			search.dispatchEvent(new Event('input'));
			await fixture.whenStable();
			expect(search.getAttribute('aria-activedescendant')).toBe(`command-${id}`);
			search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			await fixture.whenStable();
			expect(dialog.open).toBe(false);
		}
		const prefs = TestBed.inject(PreferencesService);
		expect(prefs.theme()).toBe('dark');
		expect(prefs.locale()).toBe('en');
		trigger.click();
		await fixture.whenStable();
		search.value = 'spanish';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(search.getAttribute('aria-activedescendant')).toBe('command-locale');
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await fixture.whenStable();
		expect(prefs.locale()).toBe('es');
		expect(document.documentElement.lang).toBe('es');
		expect(element.querySelector('.sidebar-caption')?.textContent).toContain(
			'Tu kit de desarrollo',
		);
		trigger.click();
		await fixture.whenStable();
		search.value = 'generador de empresas';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(element.querySelector('#command-tool-company')?.textContent).toContain(
			'Generador de empresas',
		);
		dialog.close();
		await fixture.whenStable();
		trigger.click();
		await fixture.whenStable();
		search.value = 'portuguese';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(search.getAttribute('aria-activedescendant')).toBe('command-locale');
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await fixture.whenStable();
		expect(prefs.locale()).toBe('pt');
		trigger.click();
		await fixture.whenStable();
		search.value = 'no-such-command';
		search.dispatchEvent(new Event('input'));
		await fixture.whenStable();
		expect(element.querySelector('.command-empty')?.textContent?.toLowerCase()).toContain(
			'comando',
		);
		expect(search.hasAttribute('aria-activedescendant')).toBe(false);
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await fixture.whenStable();
		expect(dialog.open).toBe(true);
		dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
		await fixture.whenStable();
		expect(dialog.open).toBe(false);
		expect(document.body.style.overflow).toBe('');
	});
	it('prioritizes recent and favorite tools and restores scroll on destruction', async () => {
		const prefs = TestBed.inject(PreferencesService);
		prefs.toggleFavorite('cpf');
		prefs.visit('uuid');
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();
		const element: HTMLElement = fixture.nativeElement;
		mockDialog(element);
		document.body.style.overflow = 'auto';
		element.querySelector<HTMLButtonElement>('#global-search')?.click();
		await fixture.whenStable();
		expect(
			Array.from(element.querySelectorAll('[role=option]'))
				.slice(0, 2)
				.map((option) => option.id),
		).toEqual(['command-tool-uuid', 'command-tool-cpf']);
		expect(document.body.style.overflow).toBe('hidden');
		fixture.destroy();
		expect(document.body.style.overflow).toBe('auto');
		document.body.style.overflow = '';
	});
	it('runs JSON, preserves stale output on edits, displays validation errors and resets', async () => {
		const harness = await RouterTestingHarness.create('/tools/json-formatter');
		const element = harness.routeNativeElement;
		if (!element) {
			throw new Error('Tool missing');
		}
		const textarea = element.querySelector<HTMLTextAreaElement>('textarea');
		const form = element.querySelector('form');
		if (!textarea || !form) {
			throw new Error('Form missing');
		}
		textarea.value = '{"ok":true}';
		textarea.dispatchEvent(new Event('input'));
		form.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(element.querySelector('.result-code')?.textContent).toContain('"ok": true');
		textarea.value = '{broken';
		textarea.dispatchEvent(new Event('input'));
		await harness.fixture.whenStable();
		expect(element.querySelector('.result-code')?.textContent).toContain('"ok": true');
		expect(element.querySelector('.result-notice')?.textContent).toContain('Entrada alterada');
		expect(element.querySelector<HTMLButtonElement>('.output-actions button')?.disabled).toBe(true);
		form.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(element.querySelector('[role=alert]')?.textContent).toContain('Confira');
		Array.from(element.querySelectorAll('button'))
			.find((b) => b.textContent?.includes('Limpar'))
			?.click();
		await harness.fixture.whenStable();
		expect(textarea.value).toBe('');
		expect(element.querySelector('[role=alert]')).toBeNull();
		expect(TestBed.inject(PreferencesService).recent()).toEqual(['json-formatter']);
		expect(localStorage.getItem('toolbox.preferences.v1')).not.toContain('broken');
	});
	it('keeps favorite and theme settings and never stores tool inputs', async () => {
		const prefs = TestBed.inject(PreferencesService);
		prefs.toggleFavorite('cpf');
		prefs.toggleTheme();
		prefs.toggleLocale();
		const saved = readPreferences(localStorage.getItem('toolbox.preferences.v1'));
		expect(saved.favorites).toEqual(['cpf']);
		expect(saved.theme).toBe('dark');
		expect(saved.locale).toBe('en');
		const harness = await RouterTestingHarness.create('/favorites');
		expect(harness.routeNativeElement?.querySelectorAll('app-tool-card')).toHaveLength(1);
		prefs.toggleFavorite('cpf');
		await harness.fixture.whenStable();
		expect(harness.routeNativeElement?.textContent).toContain('No favorites yet');
	});
	it('handles corrupt preferences and rejects unknown IDs', () => {
		expect(readPreferences('{broken').favorites).toEqual([]);
		expect(
			readPreferences(
				JSON.stringify({ favorites: ['cpf', 'cpf', 'unknown', 3], recent: 'bad', theme: 'oops' }),
			),
		).toEqual({ locale: 'pt', theme: 'light', favorites: ['cpf'], recent: [] });
	});
	it('preserves more than eighteen favorites when preferences are reopened', () => {
		const ids = TOOLS.slice(0, 30).map((tool) => tool.id);
		const saved = readPreferences(JSON.stringify({ favorites: ids, recent: ids }));
		expect(saved.favorites).toEqual(ids);
		expect(saved.recent).toHaveLength(8);
	});
	it('shows a missing page for unknown tools', async () => {
		await firstValueFrom(TestBed.inject(TranslocoService).load('pt'));
		const harness = await RouterTestingHarness.create('/tools/missing');
		expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
	});
	it('renders people controls with unique keys and successfully generates', async () => {
		const harness = await RouterTestingHarness.create('/tools/person');
		const element = harness.routeNativeElement;
		if (!element) {
			throw new Error('Tool missing');
		}
		element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(element.querySelector('.result-code')?.textContent).toContain('"synthetic": true');
		expect(element.querySelector('[role=alert]')).toBeNull();
	});
});
