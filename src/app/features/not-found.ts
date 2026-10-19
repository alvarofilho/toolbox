import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreferencesService } from '@app/core/services/preferences';

@Component({
	imports: [RouterLink],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<section class="empty-state">
		<h1>{{ p.label('Página não encontrada', 'Page not found') }}</h1>
		<p>
			{{ p.label('Esse endereço não está no nosso kit.', 'This address is not in our toolkit.') }}
		</p>
		<a class="btn btn-primary" routerLink="/tools">{{
			p.label('Explorar ferramentas', 'Explore tools')
		}}</a>
	</section>`,
})
export class NotFound {
	protected readonly p = inject(PreferencesService);
}
