import { yamlToJson } from '@app/features/tools/json/json-yaml.tool';

import { json } from '@app/features/tools/_shared/data';

export function parseDocument(value: string): unknown {
	return json(yamlToJson(value));
}
