import { CronExpressionParser } from 'cron-parser';

import cronstrue from 'cronstrue';

export function cron(expression: string, zone: string, start: string): unknown {
	const currentDate = new Date(start);
	if (!Number.isFinite(currentDate.getTime())) {
		throw new Error('Data inválida / Invalid date');
	}
	const parsed = CronExpressionParser.parse(expression, { tz: zone, currentDate });
	return {
		expression,
		description: cronstrue.toString(expression),
		timezone: zone,
		next: Array.from({ length: 10 }, () => parsed.next().toISOString()),
	};
}
