import { tool } from '@app/features/tools/_shared/definition';

import { text } from '@app/core/models/tool';

import { imageControls } from '@app/features/tools/text/image-controls';

import { imageResult } from '@app/features/tools/text/image-processing';

export const definition = tool(
	'image-converter',
	imageControls,
	imageResult,
	undefined,
	text(
		'Conversão raster via navegador; animação e metadados não são preservados. JPEG usa fundo branco para transparência.',
		'Browser raster conversion; animation and metadata are not preserved. JPEG uses a white background for transparency.',
	),
);
