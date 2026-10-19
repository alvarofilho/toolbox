import {
	parse,
	formatHex,
	formatHex8,
	formatRgb,
	formatHsl,
	converter,
	wcagContrast,
} from 'culori';
import JSZip from 'jszip';
import { imageBlob } from '@app/features/tools/extended/files-text';
import {
	tool,
	source,
	input,
	number,
	select,
	file,
	firstFile,
	field,
	result,
	preview,
	escapeHtml,
} from '@app/features/tools/extended/common';

const rgb = converter('rgb');
function color(s: string): string {
	const parsed = parse(s);
	if (!parsed) {
		throw new Error('Cor CSS inválida / Invalid CSS color');
	}
	return formatRgb(parsed);
}

const colorInput = (key: string, pt: string, en: string, value: string) =>
	input(key, pt, en, value, 'text');

const size = (key: string, pt: string, en: string, value: number, min = 0, max = 1000) =>
	number(key, pt, en, value, min, max);

const choose = (key: string, pt: string, en: string, options: readonly string[]) =>
	select(
		key,
		pt,
		en,
		options.map((s) => [s, s, s]),
	);

export function clampCss(
	minSize: number,
	maxSize: number,
	minWidth: number,
	maxWidth: number,
): string {
	if (
		![minSize, maxSize, minWidth, maxWidth].every(Number.isFinite) ||
		maxWidth <= minWidth ||
		maxSize < minSize ||
		minSize < 0 ||
		minWidth <= 0
	) {
		throw new Error('Use máximo ≥ mínimo e largura máxima > mínima > 0 / Invalid size/width range');
	}
	const slope = ((maxSize - minSize) / (maxWidth - minWidth)) * 100,
		intercept = minSize - (slope * minWidth) / 100;
	return `clamp(${minSize}px, ${Number(intercept.toFixed(6))}px + ${Number(slope.toFixed(6))}vw, ${maxSize}px)`;
}
export const definitions = [
	tool(
		'color',
		[source],
		(v) => {
			const c = parse(field(v, 'input'));
			if (!c) {
				throw new Error('Cor CSS inválida / Invalid CSS color');
			}
			return {
				...result({
					hex: formatHex(c),
					hex8: formatHex8(c),
					rgb: formatRgb(c),
					hsl: formatHsl(c),
					channels: rgb(c),
				}),
				preview: preview(
					`<div style="height:160px;background:${escapeHtml(formatHex(c))};border:1px solid #aaa;border-radius:8px"></div>`,
				),
			};
		},
		{ input: '#176b46' },
	),
	tool(
		'gradient',
		[
			colorInput('start', 'Cor inicial', 'Start color', '#176b46'),
			colorInput('end', 'Cor final', 'End color', '#e6c66b'),
			size('angle', 'Ângulo (graus)', 'Angle (degrees)', 135, 0, 360),
		],
		(v) => {
			const css = `linear-gradient(${Number(field(v, 'angle'))}deg, ${color(field(v, 'start'))}, ${color(field(v, 'end'))})`;
			return {
				...result(`background: ${css};`, 'gradient.css'),
				preview: preview(`<div style="height:240px;background:${css};border-radius:12px"></div>`),
			};
		},
	),
	tool(
		'box-shadow',
		[
			size('x', 'Deslocamento X (px)', 'X offset (px)', 0, -200, 200),
			size('y', 'Deslocamento Y (px)', 'Y offset (px)', 8, -200, 200),
			size('blur', 'Desfoque (px)', 'Blur (px)', 24, 0, 200),
			size('spread', 'Expansão (px)', 'Spread (px)', 0, -100, 100),
			colorInput('color', 'Cor', 'Color', '#173d2b'),
			size('opacity', 'Opacidade (%)', 'Opacity (%)', 25, 0, 100),
		],
		(v) => {
			const c = rgb(parse(color(field(v, 'color'))));
			if (!c) {
				throw new Error('Invalid color');
			}
			const rgba = `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)} / ${Number(field(v, 'opacity')) / 100})`;
			const css = `${Number(field(v, 'x'))}px ${Number(field(v, 'y'))}px ${Number(field(v, 'blur'))}px ${Number(field(v, 'spread'))}px ${rgba}`;
			return {
				...result(`box-shadow: ${css};`, 'shadow.css'),
				preview: preview(
					`<div style="margin:40px;padding:40px;background:white;border-radius:12px;box-shadow:${css}">CSS Box Shadow</div>`,
				),
			};
		},
	),
	tool(
		'clamp',
		[
			size('min', 'Tamanho mínimo (px)', 'Minimum size (px)', 16),
			size('max', 'Tamanho máximo (px)', 'Maximum size (px)', 32),
			size('minWidth', 'Viewport mínimo (px)', 'Minimum viewport (px)', 320, 1, 5000),
			size('maxWidth', 'Viewport máximo (px)', 'Maximum viewport (px)', 1440, 1, 5000),
		],
		(v) => {
			const css = clampCss(
				Number(field(v, 'min')),
				Number(field(v, 'max')),
				Number(field(v, 'minWidth')),
				Number(field(v, 'maxWidth')),
			);
			return {
				...result(`font-size: ${css};`, 'clamp.css'),
				preview: preview(`<p style="font-size:${css}">Uma tipografia que acompanha o espaço.</p>`),
			};
		},
	),
	tool(
		'flexbox',
		[
			choose('direction', 'Direção', 'Direction', [
				'row',
				'column',
				'row-reverse',
				'column-reverse',
			]),
			choose('justify', 'Alinhamento principal', 'Main-axis alignment', [
				'flex-start',
				'center',
				'flex-end',
				'space-between',
				'space-around',
				'space-evenly',
			]),
			choose('align', 'Alinhamento transversal', 'Cross-axis alignment', [
				'stretch',
				'flex-start',
				'center',
				'flex-end',
				'baseline',
			]),
			choose('wrap', 'Quebra de linha', 'Wrapping', ['wrap', 'nowrap']),
			size('gap', 'Espaçamento (px)', 'Gap (px)', 16, 0, 100),
			size('count', 'Itens', 'Items', 6, 1, 30),
		],
		(v) => {
			const allowed: Record<string, readonly string[]> = {
				direction: ['row', 'column', 'row-reverse', 'column-reverse'],
				justify: [
					'flex-start',
					'center',
					'flex-end',
					'space-between',
					'space-around',
					'space-evenly',
				],
				align: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
				wrap: ['wrap', 'nowrap'],
			};
			for (const key of Object.keys(allowed)) {
				if (!allowed[key].includes(field(v, key))) {
					throw new Error('Invalid flex option');
				}
			}
			const css = `display:flex;flex-direction:${field(v, 'direction')};justify-content:${field(v, 'justify')};align-items:${field(v, 'align')};flex-wrap:${field(v, 'wrap')};gap:${Number(field(v, 'gap'))}px;`;
			const items = Array.from(
				{ length: Number(field(v, 'count')) },
				(_, i) => `<div class="item">${i + 1}</div>`,
			).join('');
			return {
				...result(`.container { ${css} }`, 'flexbox.css'),
				preview: preview(
					`<div style="${css}min-height:260px">${items}</div>`,
					'.item{background:#176b46;color:white;padding:24px;min-width:45px;border-radius:8px;text-align:center}',
				),
			};
		},
	),
	tool(
		'css-grid',
		[
			size('columns', 'Colunas', 'Columns', 3, 1, 12),
			size('rows', 'Linhas', 'Rows', 2, 1, 12),
			size('gap', 'Espaçamento (px)', 'Gap (px)', 16, 0, 100),
			size('height', 'Altura das linhas (px)', 'Row height (px)', 80, 20, 300),
		],
		(v) => {
			const columns = Number(field(v, 'columns')),
				rows = Number(field(v, 'rows')),
				gap = Number(field(v, 'gap')),
				height = Number(field(v, 'height'));
			const css = `display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));grid-template-rows:repeat(${rows},${height}px);gap:${gap}px;`;
			return {
				...result(`.container { ${css} }`, 'grid.css'),
				preview: preview(
					`<div style="${css}">${Array.from({ length: columns * rows }, (_, i) => `<div style="display:grid;place-items:center;background:#176b46;color:white;border-radius:6px">${i + 1}</div>`).join('')}</div>`,
				),
			};
		},
	),
	tool(
		'contrast',
		[
			colorInput('foreground', 'Cor do texto (opaca)', 'Text color (opaque)', '#176b46'),
			colorInput('background', 'Cor de fundo (opaca)', 'Background color (opaque)', '#ffffff'),
		],
		(v) => {
			const a = parse(field(v, 'foreground')),
				b = parse(field(v, 'background'));
			if (!a || !b) {
				throw new Error('Cor inválida / Invalid color');
			}
			if ((a.alpha ?? 1) !== 1 || (b.alpha ?? 1) !== 1) {
				throw new Error('Use cores opacas / Use opaque colors');
			}
			const ratio = wcagContrast(a, b);
			return {
				...result({
					ratio: Number(ratio.toFixed(3)),
					AA: { normalText: ratio >= 4.5, largeText: ratio >= 3 },
					AAA: { normalText: ratio >= 7, largeText: ratio >= 4.5 },
					nonText: ratio >= 3,
				}),
				preview: preview(
					`<div style="padding:32px;color:${formatHex(a)};background:${formatHex(b)}"><p style="font-size:18px">Texto de exemplo / Sample text</p><p style="font-size:28px;font-weight:bold">${ratio.toFixed(2)}:1</p></div>`,
				),
			};
		},
	),
	tool('favicon', [file('image/png,image/jpeg,image/webp')], async (_, files) => {
		const f = firstFile(files),
			zip = new JSZip();
		const sizes = [16, 32, 48, 180, 192, 512];
		const icons = await Promise.all(
			sizes.map(async (size) => {
				// imageBlob preserves aspect ratio; place each image on a square canvas for favicon dimensions.
				const blob = await imageBlob(f, 'image/png', 1, size),
					bitmap = await createImageBitmap(blob),
					canvas = document.createElement('canvas');
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					bitmap.close();
					throw new Error('Canvas unavailable');
				}
				ctx.drawImage(bitmap, (size - bitmap.width) / 2, (size - bitmap.height) / 2);
				bitmap.close();
				const png = await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png'),
				);
				const bytes = new Uint8Array(await png.arrayBuffer());
				zip.file(`icon-${size}.png`, bytes);
				return { size, bytes };
			}),
		);
		const icoIcons = icons.filter((i) => i.size <= 48);
		const offsetStart = 6 + icoIcons.length * 16;
		const total = offsetStart + icoIcons.reduce((n, i) => n + i.bytes.length, 0),
			ico = new Uint8Array(total),
			view = new DataView(ico.buffer);
		view.setUint16(2, 1, true);
		view.setUint16(4, icoIcons.length, true);
		let offset = offsetStart;
		icoIcons.forEach((icon, i) => {
			const pos = 6 + i * 16;
			ico[pos] = icon.size;
			ico[pos + 1] = icon.size;
			view.setUint16(pos + 4, 1, true);
			view.setUint16(pos + 6, 32, true);
			view.setUint32(pos + 8, icon.bytes.length, true);
			view.setUint32(pos + 12, offset, true);
			ico.set(icon.bytes, offset);
			offset += icon.bytes.length;
		});
		zip.file('favicon.ico', ico);
		zip.file(
			'site.webmanifest',
			JSON.stringify(
				{
					name: 'App',
					short_name: 'App',
					icons: icons
						.filter((i) => i.size >= 192)
						.map((i) => ({
							src: `icon-${i.size}.png`,
							sizes: `${i.size}x${i.size}`,
							type: 'image/png',
						})),
					display: 'standalone',
				},
				null,
				2,
			),
		);
		const tags =
			'<link rel="icon" href="/favicon.ico">\n<link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">\n<link rel="manifest" href="/site.webmanifest">';
		zip.file('head.html', tags);
		return {
			...result(tags, 'head.html'),
			artifacts: [{ blob: await zip.generateAsync({ type: 'blob' }), filename: 'favicons.zip' }],
		};
	}),
];
