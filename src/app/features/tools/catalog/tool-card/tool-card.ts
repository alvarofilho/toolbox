import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { RouterLink } from '@angular/router';
import { PreferencesService } from '@app/core/services/preferences';
import type { ToolInfo } from '@app/core/models/tool';
import { Icon } from '@app/shared/components/icon';
import { CATEGORIES } from '@app/features/tools/catalog/tools';

@Component({
	selector: 'app-tool-card',
	imports: [RouterLink, Icon, TranslocoPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './tool-card.scss',
	templateUrl: './tool-card.html',
})
export class ToolCard {
	readonly tool = input.required<ToolInfo>();
	readonly variant = input<'standard' | 'compact' | 'list'>('standard');
	protected readonly p = inject(PreferencesService);
	private readonly translationState = computed(() => ({
		locale: this.p.locale(),
		ready: this.p.translationsReady(),
	}));
	private readonly transloco = inject(TranslocoService);
	protected readonly categoryName = computed(() => {
		const category = CATEGORIES.find((c) => c.id === this.tool().category);
		return category
			? this.transloco.translate(category.name, {}, this.translationState().locale)
			: this.transloco.translate('common.tool', {}, this.translationState().locale);
	});
}
