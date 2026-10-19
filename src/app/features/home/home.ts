import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PreferencesService } from '@app/core/services/preferences';
import { CATEGORIES, findTools, TOOLS } from '@app/features/tools/catalog/tools';
import { text } from '@app/core/models/tool';
import { ToolCard } from '@app/features/tools/catalog/tool-card/tool-card';
import { Icon } from '@app/shared/components/icon';

@Component({
	selector: 'app-home',
	imports: [ToolCard, Icon, RouterLink],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './home.html',
	styleUrl: './home.scss',
})
export class Home {
	protected readonly p = inject(PreferencesService);
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
	protected readonly category = computed(() =>
		CATEGORIES.find((c) => c.id === this.params().get('id')),
	);
	protected readonly popular = TOOLS.filter((t) => t.popular);
	protected readonly exampleInput = computed(() =>
		this.p.locale() === 'pt' ? '{"nome":"Ana","teste":true}' : '{"name":"Ana","test":true}',
	);
	protected readonly exampleLines = computed(() =>
		JSON.stringify(JSON.parse(this.exampleInput()), null, 2).split('\n'),
	);
	protected readonly filtered = computed(() => {
		const searched = findTools(this.query(), (value) => this.p.t(value));
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
	protected readonly title = computed(() =>
		this.mode === 'favorites'
			? this.p.label('Suas ferramentas favoritas', 'Your favorite tools')
			: this.mode === 'recent'
				? this.p.label('Continue de onde parou', 'Pick up where you left off')
				: this.mode === 'category'
					? this.p.t(
							this.category()?.name ?? text('Categoria não encontrada', 'Category not found'),
						)
					: this.p.label('Todas as ferramentas', 'All tools'),
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
}
