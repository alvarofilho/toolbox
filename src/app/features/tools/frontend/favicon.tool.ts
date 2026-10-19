import JSZip from 'jszip';

import { imageBlob } from '@app/features/tools/text/image-processing';

import { tool, result } from '@app/features/tools/_shared/definition';

import { file, firstFile } from '@app/features/tools/_shared/files';

export const definition = tool(
	'favicon',
	[file('image/png,image/jpeg,image/webp')],
	async (_, files) => {
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
	},
);
