import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '../../core/services/preferences';
import type { ToolInfo } from '../../core/models/tool';
import { Icon } from './icon';
@Component({
  selector: 'app-tool-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <article class="tool-card">
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
      <p>{{ p.t(tool().description) }}</p>
      <span class="card-open"
        >{{ p.label('Abrir ferramenta', 'Open tool') }} <app-icon name="arrow"
      /></span>
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
  protected readonly p = inject(PreferencesService);
}
