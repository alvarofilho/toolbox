import { diffLines } from 'diff';

export function lineDiff(left: string, right: string): string {
  if (left === right) return '= Sem diferenças / No differences';
  const changes = diffLines(left, right, { timeout: 300, maxEditLength: 2000 });
  if (!changes)
    throw new Error(
      'Comparação muito grande. Reduza as entradas / Diff too complex. Reduce inputs.',
    );
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
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, val]) => [key, canonicalJson(val)]),
    );
  return value;
}
