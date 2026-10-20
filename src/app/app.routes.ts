import { inject } from '@angular/core';
import type { ResolveFn, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import type { TranslationKey } from '@app/core/models/translation-key';
import { PreferencesService } from '@app/core/services/preferences';
import { TOOLS } from '@app/features/tools/catalog/tools';

function translatedTitle(key: TranslationKey): ResolveFn<string> {
	return async () => {
		const transloco = inject(TranslocoService);
		const locale = inject(PreferencesService).locale();
		await firstValueFrom(transloco.load(locale));
		return `${transloco.translate(key, {}, locale)} | Toolbox`;
	};
}

const home = () => import('./features/home/home').then((m) => m.Home);
export const routes: Routes = [
	{
		path: '',
		loadComponent: home,
		data: { mode: 'home' },
		title: 'Toolbox — ferramentas para desenvolvedores',
	},
	{
		path: 'tools',
		loadComponent: home,
		data: { mode: 'all' },
		title: 'Todas as ferramentas · Toolbox',
	},
	{
		path: 'favorites',
		loadComponent: home,
		data: { mode: 'favorites' },
		title: 'Favoritos · Toolbox',
	},
	{ path: 'recent', loadComponent: home, data: { mode: 'recent' }, title: 'Recentes · Toolbox' },
	{ path: 'category/brazilian', redirectTo: '/category/country-data', pathMatch: 'full' },
	{ path: 'category/mercosur', redirectTo: '/category/country-data', pathMatch: 'full' },
	{
		path: 'category/:id',
		loadComponent: home,
		data: { mode: 'category' },
		title: 'Categorias · Toolbox',
	},
	...TOOLS.map((tool) => ({
		path: `tools/${tool.id}`,
		loadComponent: () =>
			import('./features/tools/workbench/tool-workbench').then((m) => m.ToolWorkbench),
		resolve: { definition: tool.loadDefinition },
		title: translatedTitle(tool.name),
	})),
	{
		path: '**',
		loadComponent: () => import('./features/not-found').then((m) => m.NotFound),
		title: '404 · Toolbox',
	},
];
