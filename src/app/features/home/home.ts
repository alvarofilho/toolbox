import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PreferencesService } from '../../core/services/preferences';
import { CATEGORIES, findTools, TOOLS } from '../../core/registry/tools';
import { ToolCard } from '../../shared/components/tool-card';
import { Icon } from '../../shared/components/icon';
@Component({
  selector: 'app-home',
  imports: [ToolCard, Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
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
  protected readonly filtered = computed(() => {
    const searched = findTools(this.query());
    if (this.mode === 'favorites') return searched.filter((t) => this.p.favorites().includes(t.id));
    if (this.mode === 'recent') return this.p.recentTools().filter((t) => searched.includes(t));
    if (this.mode === 'category')
      return searched.filter((t) => t.category === this.params().get('id'));
    return searched;
  });
  protected readonly title = computed(() =>
    this.mode === 'favorites'
      ? this.p.label('Suas ferramentas favoritas', 'Your favorite tools')
      : this.mode === 'recent'
        ? this.p.label('Continue de onde parou', 'Pick up where you left off')
        : this.mode === 'category'
          ? this.p.t(
              this.category()?.name ?? { pt: 'Categoria não encontrada', en: 'Category not found' },
            )
          : this.p.label('Todas as ferramentas', 'All tools'),
  );
  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement)
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: event.target.value || null },
        replaceUrl: true,
      });
  }
}
