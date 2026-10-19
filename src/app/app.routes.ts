import type { Routes } from '@angular/router';
import { TOOLS } from '@app/features/tools/catalog/tools';

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
		title: `${tool.name.pt} · Toolbox`,
	})),
	{
		path: '**',
		loadComponent: () => import('./features/not-found').then((m) => m.NotFound),
		title: '404 · Toolbox',
	},
];
