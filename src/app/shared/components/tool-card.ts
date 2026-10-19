import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '../../core/services/preferences';
import type { ToolInfo } from '../../core/models/tool';
import { Icon } from './icon';
import { CATEGORIES } from '../../core/registry/tools';

@Component({
  selector: 'app-tool-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tool-card.scss',
  template: ` <article class="tool-card" [class.tool-card-compact]="variant() === 'compact'">
    <a [routerLink]="['/tools', tool().id]" class="tool-card-link">
      <div class="card-top">
        <span class="tool-icon" [attr.data-category]="tool().category"
          ><app-icon [name]="tool().icon"
        /></span>
        @if (tool().isNew) {
          <span class="new-label">{{ p.label('Novo', 'New') }}</span>
        }
      </div>
      <h3>{{ p.t(tool().name) }}</h3>
      <p>{{ variant() === 'compact' ? categoryName() : p.t(tool().description) }}</p>
      <span class="card-open">{{ categoryName() }} <app-icon name="arrow" /></span>
    </a>
    <button
      class="favorite-button btn btn-ghost btn-square"
      [class.is-favorite]="p.favorites().includes(tool().id)"
      (click)="p.toggleFavorite(tool().id)"
      [attr.aria-pressed]="p.favorites().includes(tool().id)"
      [attr.aria-label]="p.label('Favoritar: ', 'Favorite: ') + p.t(tool().name)"
    >
      <app-icon name="star" />
    </button>
  </article>`,
})
export class ToolCard {
  readonly tool = input.required<ToolInfo>();
  readonly variant = input<'standard' | 'compact'>('standard');
  protected readonly p = inject(PreferencesService);
  protected readonly categoryName = computed(() => {
    const category = CATEGORIES.find((c) => c.id === this.tool().category);
    return category ? this.p.t(category.name) : this.p.label('Ferramenta', 'Tool');
  });
}
