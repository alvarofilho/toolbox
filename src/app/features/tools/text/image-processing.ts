import { field } from '@app/core/models/tool';

import { result } from '@app/features/tools/_shared/definition';

import { firstFile } from '@app/features/tools/_shared/files';

import { preview, escapeHtml } from '@app/features/tools/_shared/preview';

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

export async function imageResult(
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
