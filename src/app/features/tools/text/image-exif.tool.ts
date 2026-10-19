import * as exifr from 'exifr';

import { tool, result } from '@app/features/tools/_shared/definition';

import { firstFile, file } from '@app/features/tools/_shared/files';

export const definition = tool('image-exif', [file('image/*')], async (_, files) => {
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
});
