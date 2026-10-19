import { DOCUMENT } from '@angular/common';
import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	ElementRef,
	inject,
	Injector,
	linkedSignal,
	signal,
	viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { text, type Localized } from '@app/core/models/tool';
import { CATEGORIES, findTools } from '@app/features/tools/catalog/tools';
import { PreferencesService } from '@app/core/services/preferences';
import { Icon } from '@app/shared/components/icon';

interface Command {
	readonly id: string;
	readonly name: Localized;
	readonly description: Localized;
	readonly icon: string;
	readonly keywords: string;
	readonly route?: string;
	readonly action?: 'theme' | 'locale';
}
const normalize = (value: string): string =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

@Component({
	imports: [Icon],
	selector: 'app-command-palette',
	styleUrl: './command-palette.scss',
	templateUrl: './command-palette.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
	protected readonly p = inject(PreferencesService);
	private readonly router = inject(Router);
	private readonly document = inject(DOCUMENT);
	private readonly injector = inject(Injector);
	private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
	private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
	private readonly opened = signal(false);
	readonly isOpen = this.opened.asReadonly();
	protected readonly query = signal('');
	private previousOverflow: string | undefined;

	protected readonly groups = computed(() => {
		const navigation: readonly Command[] = [
			{
				id: 'home',
				name: text('Visão geral', 'Overview'),
				icon: 'home',
				route: '/',
				keywords: 'inicio home',
				description: text('Navegação', 'Navigation'),
			},
			{
				id: 'all',
				name: text('Todas as ferramentas', 'All tools'),
				icon: 'grid',
				route: '/tools',
				keywords: 'catalogo catalog',
				description: text('Navegação', 'Navigation'),
			},
			{
				id: 'favorites',
				name: text('Favoritos', 'Favorites'),
				icon: 'star',
				route: '/favorites',
				keywords: 'salvos saved',
				description: text('Navegação', 'Navigation'),
			},
			{
				id: 'recent',
				name: text('Recentes', 'Recent tools'),
				icon: 'clock',
				route: '/recent',
				keywords: 'historico history',
				description: text('Navegação', 'Navigation'),
			},
			...CATEGORIES.map((category) => ({
				id: `category-${category.id}`,
				name: category.name,
				description: text('Categoria', 'Category'),
				icon: category.icon,
				route: `/category/${category.id}`,
				keywords: category.id,
			})),
		];
		const actions: readonly Command[] = [
			{
				id: 'theme',
				name:
					this.p.theme() === 'light'
						? text('Ativar tema escuro', 'Switch to dark theme')
						: text('Ativar tema claro', 'Switch to light theme'),
				description: text('Aparência', 'Appearance'),
				icon: this.p.theme() === 'light' ? 'moon' : 'sun',
				keywords: 'tema theme dark light claro escuro appearance',
				action: 'theme',
			},
			{
				id: 'locale',
				name:
					this.p.locale() === 'pt'
						? text('Mudar para inglês', 'Switch to English', 'Cambiar a inglés')
						: this.p.locale() === 'en'
							? text('Mudar para espanhol', 'Switch to Spanish', 'Cambiar a español')
							: text('Mudar para português', 'Switch to Portuguese', 'Cambiar a portugués'),
				description: text('Idioma', 'Language'),
				icon: 'type',
				keywords: 'idioma language locale portugues english ingles',
				action: 'locale',
			},
		];
		const words = normalize(this.query()).trim().split(/\s+/);
		const matches = (command: Command): boolean =>
			words.every((word) =>
				normalize(
					`${command.name.pt} ${command.name.en} ${command.name.es ?? ''} ${this.p.t(command.name)} ${command.description.pt} ${command.description.en} ${command.description.es ?? ''} ${this.p.t(command.description)} ${command.keywords}`,
				).includes(word),
			);
		const recent = this.p.recent();
		const favorites = this.p.favorites();
		const priority = (id: string): number => {
			const index = recent.indexOf(id);
			return index >= 0 ? 100 - index : favorites.includes(id) ? 50 : 0;
		};
		const tools: readonly Command[] = [...findTools(this.query(), (value) => this.p.t(value))]
			.sort((a, b) => priority(b.id) - priority(a.id))
			.map((tool) => ({
				id: `tool-${tool.id}`,
				name: tool.name,
				description: tool.description,
				icon: tool.icon,
				keywords: tool.keywords,
				route: `/tools/${tool.id}`,
			}));
		return [
			{ id: 'tools', label: this.p.label('Ferramentas', 'Tools'), commands: tools },
			{
				id: 'navigation',
				label: this.p.label('Navegação', 'Navigation'),
				commands: navigation.filter(matches),
			},
			{ id: 'actions', label: this.p.label('Ações', 'Actions'), commands: actions.filter(matches) },
		].filter((group) => group.commands.length > 0);
	});
	protected readonly results = computed(() => this.groups().flatMap((group) => group.commands));
	protected readonly activeIndex = linkedSignal({ source: this.results, computation: () => 0 });
	protected readonly activeId = computed(() => this.results()[this.activeIndex()]?.id ?? null);

	constructor() {
		inject(DestroyRef).onDestroy(() => this.restoreScroll());
	}
	open(): void {
		if (this.isOpen()) {
			return;
		}
		this.query.set('');
		this.activeIndex.set(0);
		this.previousOverflow = this.document.body.style.overflow;
		this.document.body.style.overflow = 'hidden';
		this.opened.set(true);
		this.dialog().nativeElement.showModal();
		afterNextRender(
			() => {
				if (this.isOpen()) {
					this.search().nativeElement.focus();
					this.document.getElementById('command-results')?.scrollTo?.({ top: 0 });
				}
			},
			{ injector: this.injector },
		);
	}
	close(): void {
		if (!this.isOpen()) {
			return;
		}
		this.dialog().nativeElement.close();
		this.opened.set(false);
		this.restoreScroll();
	}
	protected onClose(): void {
		if (!this.dialog().nativeElement.open) {
			this.opened.set(false);
			this.restoreScroll();
		}
	}

	protected cancel(event: Event): void {
		event.preventDefault();
		this.close();
	}
	protected onBackdrop(event: MouseEvent): void {
		if (event.target !== this.dialog().nativeElement) {
			return;
		}
		const bounds = this.dialog().nativeElement.getBoundingClientRect();
		if (
			event.clientX < bounds.left ||
			event.clientX > bounds.right ||
			event.clientY < bounds.top ||
			event.clientY > bounds.bottom
		) {
			this.close();
		}
	}
	protected onInput(event: Event): void {
		if (event.target instanceof HTMLInputElement) {
			this.query.set(event.target.value);
		}
	}
	protected onKey(event: KeyboardEvent): void {
		if (event.isComposing || event.target !== this.search().nativeElement) {
			return;
		}
		const results = this.results();
		if (event.key === 'Enter') {
			event.preventDefault();
			const command = results[this.activeIndex()];
			if (command) {
				this.execute(command);
			}
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!results.length) {
				return;
			}
			const step = event.key === 'ArrowDown' ? 1 : -1;
			this.activeIndex.update((index) => (index + step + results.length) % results.length);
			this.document
				.getElementById(`command-${this.activeId()}`)
				?.scrollIntoView?.({ block: 'nearest' });
		}
	}
	protected select(command: Command): void {
		const index = this.results().findIndex((result) => result.id === command.id);
		if (index >= 0) {
			this.activeIndex.set(index);
		}
	}
	protected execute(command: Command): void {
		this.close();
		if (command.action === 'theme') {
			this.p.toggleTheme();
		} else if (command.action === 'locale') {
			this.p.toggleLocale();
		} else if (command.route) {
			void this.router.navigateByUrl(command.route);
		}
	}
	private restoreScroll(): void {
		if (this.previousOverflow === undefined) {
			return;
		}
		this.document.body.style.overflow = this.previousOverflow;
		this.previousOverflow = undefined;
	}
}
