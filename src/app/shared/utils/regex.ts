export interface RegexMatch {
  readonly match: string;
  readonly index: number;
  readonly groups: readonly (string | undefined)[];
}
export function regexMatches(pattern: string, flags: string, input: string): readonly RegexMatch[] {
  if (pattern.length > 1000 || input.length > 100000)
    throw new Error('Regex: input limit exceeded');
  const regex = new RegExp(pattern, flags);
  const results: RegexMatch[] = [];
  if (!regex.global) {
    const match = regex.exec(input);
    if (match) results.push({ match: match[0], index: match.index, groups: match.slice(1) });
    return results;
  }
  for (const match of input.matchAll(regex)) {
    results.push({ match: match[0], index: match.index, groups: match.slice(1) });
    if (results.length > 1000) throw new Error('Regex: max 1000 matches');
  }
  return results;
}
