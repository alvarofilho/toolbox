import { tool, result } from '@app/features/tools/_shared/definition';

import { input } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

const ignores: Record<string, string> = {
	node: 'node_modules/\ndist/\ncoverage/\n*.log\n.env\n.env.*\n!.env.example',
	angular: '.angular/\nout-tsc/\nnode_modules/\ndist/',
	dotnet: 'bin/\nobj/\n.vs/\nTestResults/\n*.user\n*.suo',
	python: '__pycache__/\n*.py[cod]\n.venv/\nvenv/\n.pytest_cache/\n.env',
	rust: 'target/\n**/*.rs.bk',
	windows: 'Thumbs.db\nDesktop.ini\n$RECYCLE.BIN/',
	macos: '.DS_Store\n._*',
	vscode: '.vscode/*\n!.vscode/extensions.json\n!.vscode/settings.json',
};

export const definition = tool(
	'gitignore',
	[
		input(
			'input',
			'Templates separados por vírgula: node, angular, dotnet, python, rust, windows, macos, vscode',
			'Comma-separated templates: node, angular, dotnet, python, rust, windows, macos, vscode',
			'node,windows,vscode',
			'text',
		),
	],
	(v) =>
		result(
			field(v, 'input')
				.split(',')
				.map((s) => {
					const key = s.trim().toLowerCase();
					if (!ignores[key]) {
						throw new Error(`Template desconhecido / Unknown template: ${key}`);
					}
					return `# ${key}\n${ignores[key]}`;
				})
				.join('\n\n') + '\n',
			'.gitignore',
		),
);
