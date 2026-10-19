import Papa from 'papaparse';
import DOMPurify from 'dompurify';
import { optimize } from 'svgo/browser';
import { PDFDocument } from 'pdf-lib';
import * as exifr from 'exifr';
import JSZip from 'jszip';
import {
	tool,
	source,
	mode,
	select,
	input,
	number,
	field,
	result,
	firstFile,
	filesFrom,
	file,
	preview,
	escapeHtml,
	text,
} from '@app/features/tools/extended/common';

export async function imageBlob(
	f: File,
	mime: string,
	quality: number,
	maxSize: number,
): Promise<Blob> {
	if (
		![
			'image/png',
			'image/jpeg',
			'image/webp',
			'image/gif',
			'image/bmp',
			'image/avif',
			'image/x-icon',
			'image/vnd.microsoft.icon',
		].includes(f.type)
	) {
		throw new Error('Use uma imagem raster suportada / Use a supported raster image');
	}
	const bitmap = await createImageBitmap(f);
	try {
		if (bitmap.width * bitmap.height > 40000000) {
			throw new Error('Limite de 40 megapixels / Limit: 40 megapixels');
		}
		const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
		canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Canvas indisponível / Canvas unavailable');
		}
		if (mime === 'image/jpeg') {
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise<Blob>((resolve, reject) =>
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error('Conversão falhou / Conversion failed'))),
				mime,
				quality,
			),
		);
		if (blob.type !== mime) {
			throw new Error(
				'Formato não suportado neste navegador / Format not supported in this browser',
			);
		}
		return blob;
	} finally {
		bitmap.close();
	}
}
const imageControls = [
	file('image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif'),
	select('format', 'Formato', 'Format', [
		['image/webp', 'WebP', 'WebP'],
		['image/png', 'PNG', 'PNG'],
		['image/jpeg', 'JPEG', 'JPEG'],
	]),
	number('quality', 'Qualidade (%)', 'Quality (%)', 80, 1, 100),
	number('size', 'Maior dimensão (px)', 'Longest side (px)', 1920, 16, 8192),
];
async function imageResult(
	v: Readonly<Record<string, string>>,
	files: Parameters<typeof firstFile>[0],
) {
	const f = firstFile(files),
		mime = field(v, 'format'),
		blob = await imageBlob(f, mime, Number(field(v, 'quality')) / 100, Number(field(v, 'size')));
	const b64 = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () =>
			typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Read failed'));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
	return {
		...result({
			originalBytes: f.size,
			resultBytes: blob.size,
			changePercent: Math.round((blob.size / f.size - 1) * 100),
			format: mime,
		}),
		preview: preview(`<img src="${escapeHtml(b64)}" alt="Converted image">`),
		artifacts: [{ blob, filename: `${f.name.replace(/\.[^.]+$/, '')}.${mime.split('/')[1]}` }],
	};
}
export const definitions = [
	tool(
		'word-count',
		[source],
		(v) => {
			const s = field(v, 'input');
			return result({
				characters: Array.from(new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }).segment(s))
					.length,
				codePoints: Array.from(s).length,
				utf16Units: s.length,
				utf8Bytes: new TextEncoder().encode(s).length,
				words: (s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length,
				lines: s ? s.split(/\r?\n/).length : 0,
				paragraphs: s.trim() ? s.trim().split(/\n\s*\n/).length : 0,
			});
		},
		{ input: 'Olá, mundo!\n\nUma segunda linha.' },
	),
	tool(
		'dedupe-lines',
		[source, mode(['exact', 'trim', 'ignore-case'])],
		(v) => {
			const seen = new Set<string>();
			return result(
				field(v, 'input')
					.split(/\r?\n/)
					.filter((line) => {
						const m = field(v, 'mode'),
							key =
								m === 'trim' ? line.trim() : m === 'ignore-case' ? line.toLocaleLowerCase() : line;
						if (seen.has(key)) {
							return false;
						}
						seen.add(key);
						return true;
					})
					.join('\n'),
				'unique.txt',
			);
		},
		{ input: 'Ana\nBruno\nAna\nCamila' },
	),
	tool(
		'sort-lines',
		[source, mode(['ascending', 'descending', 'numeric'])],
		(v) => {
			const m = field(v, 'mode');
			return result(
				field(v, 'input')
					.split(/\r?\n/)
					.sort(
						(a, b) =>
							a.localeCompare(b, 'pt-BR', { numeric: m === 'numeric' }) *
							(m === 'descending' ? -1 : 1),
					)
					.join('\n'),
				'sorted.txt',
			);
		},
		{ input: 'item 10\nitem 2\nitem 1' },
	),
	tool(
		'slug',
		[source],
		(v) =>
			result(
				field(v, 'input')
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.toLowerCase()
					.trim()
					.replace(/[^\p{L}\p{N}]+/gu, '-')
					.replace(/^-+|-+$/g, ''),
				'slug.txt',
			),
		{ input: 'Olá, minha primeira página!' },
	),
	tool(
		'csv-cleaner',
		[
			source,
			select('delimiter', 'Delimitador de saída', 'Output delimiter', [
				[',', 'Vírgula', 'Comma'],
				[';', 'Ponto e vírgula', 'Semicolon'],
				['\t', 'Tab', 'Tab'],
			]),
		],
		(v) => {
			const parsed = Papa.parse<string[]>(field(v, 'input'), { skipEmptyLines: 'greedy' });
			if (parsed.errors.length) {
				throw new Error(parsed.errors.map((e) => e.message).join('\n'));
			}
			const rows = parsed.data.map((row) => row.map((s) => s.trim()));
			const seen = new Set<string>(),
				dedup = rows.filter((row) => {
					const key = JSON.stringify(row);
					if (seen.has(key)) {
						return false;
					}
					seen.add(key);
					return true;
				});
			return result(
				Papa.unparse(dedup, { delimiter: field(v, 'delimiter'), escapeFormulae: true }),
				'clean.csv',
			);
		},
		{ input: 'name,city\n Ana , São Paulo \nBruno,Rio\n Ana , São Paulo \n\n' },
	),
	tool(
		'svg-optimizer',
		[source],
		(v) => {
			const input = field(v, 'input');
			if (!/<svg[\s>]/i.test(input)) {
				throw new Error('SVG esperado / Expected SVG');
			}
			const clean = DOMPurify.sanitize(input, {
				USE_PROFILES: { svg: true, svgFilters: true },
				FORBID_TAGS: [
					'style',
					'foreignObject',
					'image',
					'a',
					'use',
					'animate',
					'animateTransform',
					'set',
				],
				FORBID_ATTR: ['style', 'href', 'xlink:href'],
			});
			const svg = optimize(clean, { multipass: true }).data;
			return {
				...result(svg, 'optimized.svg'),
				mime: 'image/svg+xml',
				preview: preview(svg),
				notice: text(
					`${input.length} → ${svg.length} caracteres`,
					`${input.length} → ${svg.length} characters`,
				),
			};
		},
		{
			input:
				'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><!-- test --><rect x="10" y="10" width="80" height="80" fill="#007744"/></svg>',
		},
	),
	tool(
		'image-converter',
		imageControls,
		imageResult,
		undefined,
		text(
			'Conversão raster via navegador; animação e metadados não são preservados. JPEG usa fundo branco para transparência.',
			'Browser raster conversion; animation and metadata are not preserved. JPEG uses a white background for transparency.',
		),
	),
	tool(
		'image-compressor',
		imageControls,
		imageResult,
		undefined,
		text(
			'Ajuste qualidade e dimensão. PNG é sem perdas; reduzir qualidade não diminui seu tamanho. Confira o tamanho final antes de baixar.',
			'Adjust quality and dimensions. PNG is lossless; reducing quality does not reduce its size. Check the final size before downloading.',
		),
	),
	tool('image-exif', [file('image/*')], async (_, files) => {
		const f = firstFile(files);
		return result({
			filename: f.name,
			metadata:
				(await exifr.parse(await f.arrayBuffer(), {
					tiff: true,
					xmp: true,
					icc: true,
					iptc: true,
					gps: true,
				})) ?? null,
		});
	}),
	tool('pdf-metadata', [file('application/pdf')], async (_, files) => {
		const f = firstFile(files),
			pdf = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false });
		return result({
			filename: f.name,
			pages: pdf.getPageCount(),
			title: pdf.getTitle(),
			author: pdf.getAuthor(),
			subject: pdf.getSubject(),
			keywords: pdf.getKeywords(),
			creator: pdf.getCreator(),
			producer: pdf.getProducer(),
			created: pdf.getCreationDate(),
			modified: pdf.getModificationDate(),
			pageSizes: pdf.getPages().map((p) => p.getSize()),
		});
	}),
	tool(
		'pdf-pages',
		[
			file('application/pdf', true),
			mode(['merge', 'extract', 'split']),
			input(
				'pages',
				'Páginas: 1,3-5 (vazio = todas; extract/split)',
				'Pages: 1,3-5 (empty = all; extract/split)',
				'',
				'text',
			),
		],
		async (v, files) => {
			const selected = filesFrom(files),
				operation = field(v, 'mode');
			if (operation !== 'merge' && selected.length !== 1) {
				throw new Error('Selecione um PDF para extrair/dividir / Select one PDF for extract/split');
			}
			const docs = await Promise.all(
				selected.map((f) => f.arrayBuffer().then((b) => PDFDocument.load(b))),
			);
			if (docs.reduce((n, p) => n + p.getPageCount(), 0) > 300) {
				throw new Error('Máximo 300 páginas / Maximum 300 pages');
			}
			let indexes = docs[0].getPageIndices();
			const raw = field(v, 'pages').trim();
			if (operation !== 'merge' && raw) {
				indexes = [
					...new Set(
						raw.split(',').flatMap((piece) => {
							const m = /^(\d+)(?:-(\d+))?$/.exec(piece.trim());
							if (!m) {
								throw new Error('Intervalo inválido / Invalid page range');
							}
							const start = Number(m[1]),
								end = Number(m[2] ?? m[1]);
							if (start < 1 || end < start || end > docs[0].getPageCount()) {
								throw new Error('Página fora do intervalo / Page out of range');
							}
							return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
						}),
					),
				];
			}
			if (operation === 'split') {
				const zip = new JSZip();
				for (const index of indexes) {
					const out = await PDFDocument.create();
					const pages = await out.copyPages(docs[0], [index]);
					pages.forEach((p) => out.addPage(p));
					zip.file(`page-${index + 1}.pdf`, await out.save());
				}
				return {
					...result({ pages: indexes.map((i) => i + 1) }),
					artifacts: [
						{ blob: await zip.generateAsync({ type: 'blob' }), filename: 'pdf-pages.zip' },
					],
				};
			}
			const out = await PDFDocument.create();
			for (const doc of docs) {
				const pages = await out.copyPages(
					doc,
					operation === 'merge' ? doc.getPageIndices() : indexes,
				);
				pages.forEach((p) => out.addPage(p));
			}
			return {
				...result({ pages: out.getPageCount(), operation }),
				artifacts: [
					{
						blob: new Blob([new Uint8Array(await out.save()).buffer], { type: 'application/pdf' }),
						filename: `${operation}.pdf`,
					},
				],
			};
		},
		undefined,
		text(
			'Arquivos em ordem de seleção. PDFs criptografados são rejeitados; assinaturas digitais não são preservadas na saída.',
			'Files follow selection order. Encrypted PDFs are rejected; digital signatures are not preserved in output.',
		),
	),
	tool('file-signature', [file()], async (_, files) => {
		const f = firstFile(files),
			bytes = new Uint8Array(await f.slice(0, 512).arrayBuffer()),
			hex = Array.from(bytes.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
		const signatures: [string, string][] = [
			['89504e470d0a1a0a', 'PNG'],
			['ffd8ff', 'JPEG'],
			['474946383761', 'GIF87a'],
			['474946383961', 'GIF89a'],
			['255044462d', 'PDF'],
			['504b0304', 'ZIP (also DOCX/XLSX/JAR/APK)'],
			['504b0506', 'ZIP empty'],
			['1f8b08', 'GZIP'],
			['4d5a', 'DOS/Windows executable'],
			['7f454c46', 'ELF executable'],
			['377abcaf271c', '7-Zip'],
			['526172211a07', 'RAR'],
			['424d', 'BMP'],
			['49492a00', 'TIFF (LE)'],
			['4d4d002a', 'TIFF (BE)'],
			['00000100', 'ICO'],
		];
		let detected = signatures.find(([prefix]) => hex.startsWith(prefix))?.[1] ?? 'Unknown';
		if (hex.startsWith('52494646') && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') {
			detected = 'WebP';
		}
		return result({
			filename: f.name,
			bytes: f.size,
			declaredMime: f.type,
			detected,
			first16Bytes: hex,
			classification: 'Magic bytes only; not a malware or full-format validation',
		});
	}),
];
