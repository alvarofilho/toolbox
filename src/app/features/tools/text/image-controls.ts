import { select, number } from '@app/features/tools/_shared/controls';

import { file } from '@app/features/tools/_shared/files';

export const imageControls = [
	file('image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif'),
	select('format', 'Formato', 'Format', [
		['image/webp', 'WebP', 'WebP'],
		['image/png', 'PNG', 'PNG'],
		['image/jpeg', 'JPEG', 'JPEG'],
	]),
	number('quality', 'Qualidade (%)', 'Quality (%)', 80, 1, 100),
	number('size', 'Maior dimensão (px)', 'Longest side (px)', 1920, 16, 8192),
];
