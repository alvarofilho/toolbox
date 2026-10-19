import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	effect,
	HostListener,
	inject,
	Injector,
	signal,
	viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { PreferencesService } from '@app/core/services/preferences';
import { CATEGORIES, TOOLS } from '@app/features/tools/catalog/tools';
import { Icon } from '@app/shared/components/icon';
import { CommandPalette } from '@app/features/tools/catalog/command-palette/command-palette';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, CommandPalette, TranslocoPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	protected readonly p = inject(PreferencesService);
	private readonly router = inject(Router);
	private readonly document = inject(DOCUMENT);
	private readonly injector = inject(Injector);
	protected readonly categories = CATEGORIES;
	protected readonly count = TOOLS.length;
	protected readonly menuOpen = signal(false);
	private readonly commands = viewChild.required(CommandPalette);
	protected readonly commandShortcut = /Mac|iPhone|iPad/.test(
		this.document.defaultView?.navigator.platform ?? '',
	)
		? '⌘ K'
		: 'Ctrl K';
	private lastPath = '';

	constructor() {
		effect((onCleanup) => {
			if (this.menuOpen()) {
				const previous = this.document.body.style.overflow;
				this.document.body.style.overflow = 'hidden';
				onCleanup(() => {
					this.document.body.style.overflow = previous;
				});
			}
		});
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				takeUntilDestroyed(),
			)
			.subscribe((event) => {
				const path = event.urlAfterRedirects.split('?')[0];
				this.menuOpen.set(false);
				this.commands().close();
				if (path !== this.lastPath) {
					this.document.getElementById('main-content')?.focus({ preventScroll: true });
				}
				this.lastPath = path;
			});
	}

	protected openCommands(): void {
		if (this.commands().isOpen()) {
			this.commands().close();
			return;
		}
		this.menuOpen.set(false);
		afterNextRender(() => this.commands().open(), { injector: this.injector });
	}
	protected changeLocale(event: Event): void {
		const target = event.target;
		if (target instanceof HTMLSelectElement) {
			this.p.setLocale(target.value === 'en' || target.value === 'es' ? target.value : 'pt');
		}
	}

	@HostListener('document:keydown', ['$event'])
	protected onKey(event: KeyboardEvent): void {
		if (event.key === 'Tab' && this.menuOpen()) {
			const controls = Array.from(
				this.document.querySelectorAll<HTMLElement>(
					'#sidebar a[href], #sidebar button:not([disabled])',
				),
			);
			const first = controls[0],
				last = controls.at(-1),
				active = this.document.activeElement;
			if (
				event.shiftKey &&
				(active === first || !this.document.getElementById('sidebar')?.contains(active))
			) {
				event.preventDefault();
				last?.focus();
			} else if (
				!event.shiftKey &&
				(active === last || !this.document.getElementById('sidebar')?.contains(active))
			) {
				event.preventDefault();
				first?.focus();
			}
		}

		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (!event.repeat && !event.isComposing) {
				this.openCommands();
			}
		}

		if (event.key === 'Escape' && this.menuOpen()) {
			this.closeMenu();
		}
	}
	protected toggleMenu(): void {
		if (this.menuOpen()) {
			this.closeMenu();
			return;
		}

		this.menuOpen.set(true);

		afterNextRender(() => this.document.querySelector<HTMLElement>('#sidebar a[href]')?.focus(), {
			injector: this.injector,
		});
	}

	protected closeMenu(toTrigger = true): void {
		if (!this.menuOpen()) {
			return;
		}

		this.menuOpen.set(false);

		afterNextRender(
			() =>
				this.document
					.getElementById(toTrigger ? 'menu-toggle' : 'main-content')
					?.focus({ preventScroll: true }),
			{ injector: this.injector },
		);
	}

	@HostListener('window:resize')
	protected onResize(): void {
		if (this.menuOpen() && (this.document.defaultView?.innerWidth ?? 0) > 1024) {
			this.closeMenu(false);
		}
	}
}
