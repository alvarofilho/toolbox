import { tool, result } from '@app/features/tools/_shared/definition';

import { source, select } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { object, json } from '@app/features/tools/_shared/data';

export const definition = tool(
	'log-parser',
	[
		source,
		select('format', 'Formato', 'Format', [
			['json', 'JSON Lines', 'JSON Lines'],
			['combined', 'Apache/Nginx combined', 'Apache/Nginx combined'],
		]),
	],
	(v) => {
		const lines = field(v, 'input').split(/\r?\n/).filter(Boolean);
		if (lines.length > 5000) {
			throw new Error('Máximo 5.000 linhas / Maximum 5,000 lines');
		}
		return result(
			lines.map((line, index) => {
				if (field(v, 'format') === 'json') {
					return object(json(line));
				}
				const m =
					/^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"$/.exec(
						line,
					);
				if (!m) {
					throw new Error(`Linha ${index + 1} inválida / Invalid line ${index + 1}`);
				}
				return {
					ip: m[1],
					identity: m[2],
					user: m[3],
					time: m[4],
					request: m[5],
					status: Number(m[6]),
					bytes: m[7] === '-' ? 0 : Number(m[7]),
					referer: m[8],
					userAgent: m[9],
				};
			}),
		);
	},
	{
		input:
			'{"level":"info","message":"Started","timestamp":"2026-01-01T00:00:00Z"}\n{"level":"error","message":"Test failure"}',
	},
);
