import { tool } from '@app/features/tools/_shared/definition';

import { text } from '@app/core/models/tool';

import { imageControls } from '@app/features/tools/text/image-controls';

import { imageResult } from '@app/features/tools/text/image-processing';

export const definition = tool(
	'image-compressor',
	imageControls,
	imageResult,
	undefined,
	text(
		'Ajuste qualidade e dimensão. PNG é sem perdas; reduzir qualidade não diminui seu tamanho. Confira o tamanho final antes de baixar.',
		'Adjust quality and dimensions. PNG is lossless; reducing quality does not reduce its size. Check the final size before downloading.',
		undefined,
		'tools.image-compressor',
	),
);
