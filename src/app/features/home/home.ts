import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PreferencesService } from '@app/core/services/preferences';
import { CATEGORIES, findTools, TOOLS } from '@app/features/tools/catalog/tools';
import { text } from '@app/core/models/tool';
import { ToolCard } from '@app/features/tools/catalog/tool-card/tool-card';
import { Icon } from '@app/shared/components/icon';

@Component({
	selector: 'app-home',
	imports: [ToolCard, Icon, RouterLink, TranslocoPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './home.html',
	styleUrl: './home.scss',
})
export class Home {
	protected readonly p = inject(PreferencesService);
	private readonly translationState = computed(() => ({
		locale: this.p.locale(),
		ready: this.p.translationsReady(),
	}));
	private readonly transloco = inject(TranslocoService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly params = toSignal(this.route.paramMap, {
		initialValue: this.route.snapshot.paramMap,
	});
	private readonly queries = toSignal(this.route.queryParamMap, {
		initialValue: this.route.snapshot.queryParamMap,
	});
	protected readonly query = computed(() => this.queries().get('q') ?? '');
	protected readonly mode: string = this.route.snapshot.data['mode'] ?? 'home';
	protected readonly categories = CATEGORIES;
	protected readonly tools = TOOLS;
	protected readonly view = signal<'list' | 'standard'>('list');
	protected readonly categoryDirectory = CATEGORIES.map((category) => ({
		...category,
		count: TOOLS.filter((tool) => tool.category === category.id).length,
	}));
	protected readonly category = computed(() =>
		CATEGORIES.find((c) => c.id === this.params().get('id')),
	);
	protected readonly popular = TOOLS.filter((t) => t.popular);
	protected readonly exampleInput = computed(() =>
		this.translationState().locale === 'pt'
			? '{"nome":"Ana","teste":true}'
			: '{"name":"Ana","test":true}',
	);
	protected readonly exampleLines = computed(() =>
		JSON.stringify(JSON.parse(this.exampleInput()), null, 2).split('\n'),
	);
	protected readonly filtered = computed(() => {
		const searched = findTools(this.query(), (value) =>
			this.transloco.translate(value.key, {}, this.translationState().locale),
		);
		if (this.mode === 'favorites') {
			return searched.filter((t) => this.p.favorites().includes(t.id));
		}
		if (this.mode === 'recent') {
			return this.p.recentTools().filter((t) => searched.includes(t));
		}
		if (this.mode === 'category') {
			return searched.filter((t) => t.category === this.params().get('id'));
		}
		return searched;
	});
	protected readonly groups = computed(() =>
		this.mode === 'all' && !this.query()
			? CATEGORIES.map((category) => ({
					id: category.id,
					name: this.transloco.translate(category.name.key, {}, this.translationState().locale),
					tools: this.filtered().filter((tool) => tool.category === category.id),
				})).filter((group) => group.tools.length)
			: [{ id: 'results', name: '', tools: this.filtered() }],
	);
	protected readonly emptyTitle = computed(() =>
		this.mode === 'category' && !this.category()
			? this.transloco.translate(
					'messages.category_not_found_3e750170',
					{},
					this.translationState().locale,
				)
			: this.query()
				? this.transloco.translate(
						'messages.no_tools_found_29b23135',
						{},
						this.translationState().locale,
					)
				: this.mode === 'favorites'
					? this.transloco.translate(
							'messages.no_favorites_yet_fcb8d481',
							{},
							this.translationState().locale,
						)
					: this.transloco.translate(
							'messages.no_recent_tools_01a8f16e',
							{},
							this.translationState().locale,
						),
	);
	protected readonly emptyDescription = computed(() =>
		this.mode === 'category' && !this.category()
			? this.transloco.translate(
					'messages.choose_a_category_to_continue_cb9ff2ab',
					{},
					this.translationState().locale,
				)
			: this.query()
				? this.transloco.translate(
						'messages.try_another_term_or_clear_the_search_to_se_5c2f6e98',
						{},
						this.translationState().locale,
					)
				: this.mode === 'favorites'
					? this.transloco.translate(
							'messages.star_a_tool_to_find_it_here_54440471',
							{},
							this.translationState().locale,
						)
					: this.transloco.translate(
							'messages.tools_you_open_will_appear_here_your_input_84293c7f',
							{},
							this.translationState().locale,
						),
	);
	protected readonly title = computed(() =>
		this.mode === 'favorites'
			? this.transloco.translate(
					'messages.your_favorite_tools_e1c3fc79',
					{},
					this.translationState().locale,
				)
			: this.mode === 'recent'
				? this.transloco.translate(
						'messages.pick_up_where_you_left_off_8e171b17',
						{},
						this.translationState().locale,
					)
				: this.mode === 'category'
					? this.transloco.translate(
							(this.category()?.name ?? text('Categoria não encontrada', 'Category not found')).key,
							{},
							this.translationState().locale,
						)
					: this.transloco.translate(
							'messages.all_tools_5754d41f',
							{},
							this.translationState().locale,
						),
	);
	protected search(event: Event): void {
		if (event.target instanceof HTMLInputElement) {
			void this.router.navigate([], {
				relativeTo: this.route,
				queryParams: { q: event.target.value || null },
				replaceUrl: true,
			});
		}
	}
	protected clearSearch(): void {
		void this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { q: null },
			replaceUrl: true,
		});
	}
}
