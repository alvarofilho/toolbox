import { tool } from '@app/features/tools/_shared/definition';

import { imageControls } from '@app/features/tools/text/image-controls';

import { imageResult } from '@app/features/tools/text/image-processing';

export const definition = tool(
	'image-compressor',
	imageControls,
	imageResult,
	undefined,
	'tools.image-compressor.adjust_quality_and_dimensions_png_is_lossl',
);
