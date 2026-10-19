import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { xml } from '@app/features/tools/development/xml-validation';

export const definition = tool(
	'xml-validator',
	[source],
	(v) => {
		xml(field(v, 'input'));
		return result({ valid: true, validation: 'XML well-formedness; no XSD validation' });
	},
	{ input: '<root><item>Test</item></root>' },
);
