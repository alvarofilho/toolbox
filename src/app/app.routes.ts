import { Routes } from '@angular/router';
import type { ToolDefinition } from '@app/core/models/tool';
import { TOOLS } from '@app/core/registry/tools';
import { EXTENDED_LOADERS } from '@app/features/tools/extended/loaders';

export const TOOL_LOADERS: Readonly<Record<string, () => Promise<{ definition: ToolDefinition }>>> =
	{
		...EXTENDED_LOADERS,
		'json-formatter': () => import('./features/tools/json-formatter.tool'),
		'json-minifier': () => import('./features/tools/json-minifier.tool'),
		'json-diff': () => import('./features/tools/json-diff.tool'),
		base64: () => import('./features/tools/base64.tool'),
		url: () => import('./features/tools/url.tool'),
		uuid: () => import('./features/tools/uuid.tool'),
		password: () => import('./features/tools/password.tool'),
		token: () => import('./features/tools/token.tool'),
		timestamp: () => import('./features/tools/timestamp.tool'),
		jwt: () => import('./features/tools/jwt.tool'),
		sha: () => import('./features/tools/sha.tool'),
		regex: () => import('./features/tools/regex.tool'),
		'text-diff': () => import('./features/tools/text-diff.tool'),
		case: () => import('./features/tools/case.tool'),
		cpf: () => import('./features/tools/cpf.tool'),
		cnpj: () => import('./features/tools/cnpj.tool'),
		person: () => import('./features/tools/person.tool'),
		'json-yaml': () => import('./features/tools/json-yaml.tool'),
	};
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
		loadComponent: () => import('./shared/components/tool-workbench').then((m) => m.ToolWorkbench),
		resolve: { definition: async () => (await TOOL_LOADERS[tool.id]()).definition },
		title: `${tool.name.pt} · Toolbox`,
	})),
	{
		path: '**',
		loadComponent: () => import('./features/not-found').then((m) => m.NotFound),
		title: '404 · Toolbox',
	},
];
