import { object } from '@app/features/tools/_shared/data';

import { parseDocument } from '@app/features/tools/development/document-parser';

export function openApi(value: string): {
	doc: Record<string, unknown>;
	operations: Record<string, unknown>[];
} {
	const doc = object(parseDocument(value));
	if (typeof doc['openapi'] !== 'string' && doc['swagger'] !== '2.0') {
		throw new Error('Esperado OpenAPI 3.x ou Swagger 2.0 / Expected OpenAPI 3.x or Swagger 2.0');
	}
	const info = object(doc['info']);
	if (typeof info['title'] !== 'string' || typeof info['version'] !== 'string') {
		throw new Error('info.title e info.version obrigatórios / required');
	}
	const paths = object(doc['paths'] ?? {}),
		operations: Record<string, unknown>[] = [];
	for (const [path, item] of Object.entries(paths)) {
		if (!path.startsWith('/')) {
			throw new Error('Paths devem começar com / / Paths must start with /');
		}
		for (const [method, entry] of Object.entries(object(item))) {
			if (!['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
				continue;
			}
			const operation = object(entry);
			operations.push({
				method: method.toUpperCase(),
				path,
				operationId: operation['operationId'] ?? null,
				summary: operation['summary'] ?? '',
				parameters: operation['parameters'] ?? [],
				responses: operation['responses'] ?? {},
			});
		}
	}
	return { doc, operations };
}

export const apiExample =
	'openapi: 3.0.3\ninfo:\n  title: Example API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        "200":\n          description: OK';
