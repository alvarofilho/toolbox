import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { TranslocoService } from '@jsverse/transloco';
import { TOOLS } from '@app/features/tools/catalog/tools';

const ESSENTIAL_TOOL_IDS = ['json-formatter', 'base64', 'url', 'uuid'] as const;
type EssentialToolId = (typeof ESSENTIAL_TOOL_IDS)[number];
const ESSENTIAL_TOOLS = ESSENTIAL_TOOL_IDS.map((id) => {
	const tool = TOOLS.find((item) => item.id === id);
	if (!tool) {
		throw new Error(`Essential tool is missing from the catalog: ${id}`);
	}
	return { id, tool };
});
const STATE_CACHE = 'toolbox-offline-state-v1';
const READY_MARKER = '/offline-ready';

type OfflineState = 'checking' | 'ready' | 'not-ready' | 'preparing' | 'failed' | 'unsupported';

interface InstallPromptEvent extends Event {
	prompt(): Promise<void>;
	readonly userChoice: Promise<{ readonly outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class OfflineService {
	private readonly document = inject(DOCUMENT);
	private readonly platformId = inject(PLATFORM_ID);
	private readonly updates = inject(SwUpdate, { optional: true });
	private readonly transloco = inject(TranslocoService);
	private readonly browser = isPlatformBrowser(this.platformId);
	private readonly window = this.document.defaultView;
	private installPromptEvent: InstallPromptEvent | undefined;

	readonly supported = signal(false);
	readonly online = signal(true);
	readonly state = signal<OfflineState>('checking');
	readonly readyTools = signal<ReadonlySet<EssentialToolId>>(new Set());
	readonly installAvailable = signal(false);
	readonly updateAvailable = signal(false);
	readonly tools = computed(() =>
		ESSENTIAL_TOOLS.map(({ id, tool }) => ({
			id,
			name: tool.name,
			ready: this.readyTools().has(id),
		})),
	);

	constructor() {
		if (!this.browser || !this.window) {
			this.state.set('unsupported');
			return;
		}

		const serviceWorker = this.window.navigator.serviceWorker;
		this.online.set(this.window.navigator.onLine);
		this.supported.set(!!this.updates?.isEnabled && !!serviceWorker && !!this.window.caches);
		if (!this.supported()) {
			this.state.set('unsupported');
			return;
		}

		this.window.addEventListener('online', this.onOnline);
		this.window.addEventListener('offline', this.onOffline);
		this.window.addEventListener('beforeinstallprompt', this.onInstallPrompt);
		this.window.addEventListener('appinstalled', this.onInstalled);
		void this.readiness();
		this.updates?.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
			if (event.type === 'VERSION_READY') {
				this.updateAvailable.set(true);
				void this.clearMarker().finally(() => {
					this.readyTools.set(new Set());
					this.state.set('not-ready');
				});
			}
		});
	}

	async prepare(): Promise<void> {
		const window = this.window;
		if (!this.supported() || !window || this.updateAvailable()) {
			return;
		}
		if (!this.online()) {
			this.state.set('failed');
			return;
		}

		this.state.set('preparing');
		try {
			await window.navigator.serviceWorker.ready;
			if (!window.navigator.serviceWorker.controller) {
				throw new Error('The offline service worker does not control this page yet.');
			}
			for (const { tool } of ESSENTIAL_TOOLS) {
				await tool.loadDefinition();
			}
			await import('../../features/tools/workbench/tool-workbench');
			await Promise.all(['pt', 'en', 'es'].map((locale) => this.transloco.load(locale)));

			const moduleUrls = new Set(
				window.performance
					.getEntriesByType('resource')
					.map((entry) => new URL(entry.name, window.location.origin))
					.filter(
						(url) =>
							url.origin === window.location.origin &&
							/^\/(?:chunk|worker)-[^/]+\.js$/.test(url.pathname),
					)
					.map((url) => url.toString()),
			);
			for (const url of moduleUrls) {
				const response = await window.fetch(url, { cache: 'reload' });
				if (!response.ok) {
					throw new Error(`Offline module download failed: ${url}`);
				}
			}

			const cache = await window.caches.open(STATE_CACHE);
			const response = new Response(JSON.stringify(ESSENTIAL_TOOL_IDS), {
				headers: { 'Content-Type': 'application/json' },
			});
			await cache.put(new URL(READY_MARKER, window.location.origin).toString(), response);
			this.readyTools.set(new Set(ESSENTIAL_TOOL_IDS));
			this.state.set('ready');
		} catch {
			this.state.set('failed');
		}
	}

	async clear(): Promise<void> {
		const window = this.window;
		if (!this.supported() || !window) {
			return;
		}
		try {
			const keys = await window.caches.keys();
			await Promise.all(
				keys
					.filter((key) => key.startsWith('ngsw:') || key === STATE_CACHE)
					.map((key) => window.caches.delete(key)),
			);
			const registration = await window.navigator.serviceWorker.getRegistration();
			await registration?.unregister();
			this.readyTools.set(new Set());
			this.state.set('not-ready');
		} catch {
			this.state.set('failed');
		}
	}

	async install(): Promise<void> {
		const prompt = this.installPromptEvent;
		if (!prompt) {
			return;
		}
		this.installPromptEvent = undefined;
		this.installAvailable.set(false);
		await prompt.prompt();
		await prompt.userChoice;
	}

	async applyUpdate(): Promise<void> {
		const updates = this.updates;
		if (!this.updateAvailable() || !this.window || !updates) {
			return;
		}
		await updates.activateUpdate();
		this.window.location.reload();
	}

	private async readiness(): Promise<void> {
		const window = this.window;
		if (!window) {
			return;
		}
		try {
			const cache = await window.caches.open(STATE_CACHE);
			const response = await cache.match(new URL(READY_MARKER, window.location.origin).toString());
			const stored: unknown = response ? await response.json() : [];
			const ready = Array.isArray(stored)
				? stored.filter(
						(id: unknown): id is EssentialToolId =>
							typeof id === 'string' && ESSENTIAL_TOOL_IDS.some((toolId) => toolId === id),
					)
				: [];
			const validReady = this.updateAvailable() ? [] : ready;
			this.readyTools.set(new Set(validReady));
			this.state.set(validReady.length === ESSENTIAL_TOOL_IDS.length ? 'ready' : 'not-ready');
		} catch {
			this.state.set('failed');
		}
	}

	private readonly onOnline = (): void => {
		this.online.set(true);
	};
	private readonly onOffline = (): void => {
		this.online.set(false);
	};
	private readonly onInstallPrompt = (event: Event): void => {
		event.preventDefault();
		this.installPromptEvent = event as InstallPromptEvent;
		this.installAvailable.set(true);
	};
	private readonly onInstalled = (): void => {
		this.installPromptEvent = undefined;
		this.installAvailable.set(false);
	};

	private async clearMarker(): Promise<void> {
		await this.window?.caches.delete(STATE_CACHE);
	}
}
