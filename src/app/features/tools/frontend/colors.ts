import { parse, formatRgb, converter } from 'culori';

export const rgb = converter('rgb');

export function color(s: string): string {
	const parsed = parse(s);
	if (!parsed) {
		throw new Error('Cor CSS inválida / Invalid CSS color');
	}
	return formatRgb(parsed);
}
