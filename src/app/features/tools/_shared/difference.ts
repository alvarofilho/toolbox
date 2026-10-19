import { diffLines } from 'diff';

export interface DiffRow {
	readonly kind: 'equal' | 'change' | 'removed' | 'added';
	readonly leftNumber: number | null;
	readonly leftText: string;
	readonly rightNumber: number | null;
	readonly rightText: string;
}

export function sideBySideDiff(left: string, right: string): readonly DiffRow[] {
	const changes = diffLines(left, right, { timeout: 300, maxEditLength: 2000 });
	if (!changes) {
		throw new Error(
			'Comparação muito grande. Reduza as entradas / Diff too complex. Reduce inputs.',
		);
	}

	const rows: DiffRow[] = [];
	let leftNumber = 1;
	let rightNumber = 1;
	let removed: string[] = [];
	let added: string[] = [];

	const lines = (value: string): string[] => {
		const result = value.split('\n');
		if (result.at(-1) === '') {
			result.pop();
		}
		return result;
	};

	const flushChanges = (): void => {
		const count = Math.max(removed.length, added.length);
		for (let index = 0; index < count; index++) {
			const leftText = removed[index];
			const rightText = added[index];
			rows.push({
				kind:
					leftText !== undefined && rightText !== undefined
						? 'change'
						: leftText !== undefined
							? 'removed'
							: 'added',
				leftNumber: leftText === undefined ? null : leftNumber++,
				leftText: leftText ?? '',
				rightNumber: rightText === undefined ? null : rightNumber++,
				rightText: rightText ?? '',
			});
		}
		removed = [];
		added = [];
	};

	for (const change of changes) {
		if (change.removed) {
			removed.push(...lines(change.value));
			continue;
		}
		if (change.added) {
			added.push(...lines(change.value));
			continue;
		}

		flushChanges();
		for (const line of lines(change.value)) {
			rows.push({
				kind: 'equal',
				leftNumber: leftNumber++,
				leftText: line,
				rightNumber: rightNumber++,
				rightText: line,
			});
		}
	}

	flushChanges();
	return rows;
}

export function lineDiff(left: string, right: string): string {
	if (left === right) {
		return '= Sem diferenças / No differences';
	}
	const changes = diffLines(left, right, { timeout: 300, maxEditLength: 2000 });
	if (!changes) {
		throw new Error(
			'Comparação muito grande. Reduza as entradas / Diff too complex. Reduce inputs.',
		);
	}
	return changes
		.map((change) =>
			change.value
				.split('\n')
				.map((line, i, lines) =>
					i === lines.length - 1 && !line
						? ''
						: `${change.added ? '+' : change.removed ? '-' : ' '} ${line}\n`,
				)
				.join(''),
		)
		.join('');
}

export function canonicalJson(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(canonicalJson);
	}
	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value)
				.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
				.map(([key, val]) => [key, canonicalJson(val)]),
		);
	}
	return value;
}
