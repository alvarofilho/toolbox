import { select, number } from '@app/features/tools/_shared/controls';

import { file } from '@app/features/tools/_shared/files';

export const imageControls = [
	file('image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif'),
	select('format', 'common.format', [
		['image/webp', 'common.webp'],
		['image/png', 'common.png'],
		['image/jpeg', 'common.jpeg'],
	]),
	number('quality', 'common.quality', 80, 1, 100),
	number('size', 'common.longest_side_px', 1920, 16, 8192),
];
