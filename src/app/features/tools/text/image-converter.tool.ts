import { tool } from '@app/features/tools/_shared/definition';

import { imageControls } from '@app/features/tools/text/image-controls';

import { imageResult } from '@app/features/tools/text/image-processing';

export const definition = tool(
	'image-converter',
	imageControls,
	imageResult,
	undefined,
	'tools.image-converter.browser_raster_conversion_animation_and_me',
);
