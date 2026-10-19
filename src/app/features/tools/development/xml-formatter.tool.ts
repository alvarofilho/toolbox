import XMLBuilder from 'fast-xml-builder';

import { XMLParser } from 'fast-xml-parser';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field } from '@app/core/models/tool';

import { xml } from '@app/features/tools/development/xml-validation';

export const definition = tool(
	'xml-formatter',
	[source],
	(v) => {
		const value = field(v, 'input');
		xml(value);
		const parser = new XMLParser({
			ignoreAttributes: false,
			preserveOrder: true,
			processEntities: false,
		});
		return result(
			new XMLBuilder({ ignoreAttributes: false, preserveOrder: true, format: true }).build(
				parser.parse(value),
			),
			'formatted.xml',
		);
	},
	{ input: '<root><user id="1">Ana</user><user id="2">Bruno</user></root>' },
);
