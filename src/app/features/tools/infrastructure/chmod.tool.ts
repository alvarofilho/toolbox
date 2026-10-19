import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

export const definition = tool(
	'chmod',
	[source],
	(v) => {
		const value = field(v, 'input').trim();
		let n: number;
		if (/^[0-7]{3,4}$/.test(value)) {
			n = parseInt(value, 8);
		} else if (/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(value)) {
			n = 0;
			for (let i = 0; i < 9; i++) {
				const c = value[i];
				if ((i % 3 < 2 && c !== '-') || (i % 3 === 2 && /[xst]/.test(c))) {
					n |= 1 << (8 - i);
				}
			}
			if (/[sS]/.test(value[2])) {
				n |= 0o4000;
			}
			if (/[sS]/.test(value[5])) {
				n |= 0o2000;
			}
			if (/[tT]/.test(value[8])) {
				n |= 0o1000;
			}
		} else {
			throw new Error('Use 755 ou rwxr-xr-x / Use 755 or rwxr-xr-x');
		}
		const symbolic = Array.from({ length: 9 }, (_, i) => (n & (1 << (8 - i)) ? 'rwx'[i % 3] : '-'));
		for (const [index, bit, on, off] of [
			[2, 0o4000, 's', 'S'],
			[5, 0o2000, 's', 'S'],
			[8, 0o1000, 't', 'T'],
		] as const) {
			if (n & bit) {
				symbolic[index] = symbolic[index] === 'x' ? on : off;
			}
		}
		return result({
			octal: n.toString(8).padStart(3, '0'),
			symbolic: symbolic.join(''),
			owner: (n >> 6) & 7,
			group: (n >> 3) & 7,
			others: n & 7,
		});
	},
	{ input: '755' },
);
