import { TranslatedToolError } from '@app/core/models/tool';

export function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new TranslatedToolError('common.json_object_required', {}, 'input');
	}
	return value as Record<string, unknown>; // Runtime guard above establishes a record.
}

export function json(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch (error: unknown) {
		if (!(error instanceof SyntaxError)) {
			throw error;
		}
		const location = /(?:position\s+(\d+)|line\s+(\d+)\s+column\s+(\d+))/i.exec(error.message);
		const position = location?.[1] ? Number(location[1]) : undefined;
		const line = location?.[2]
			? Number(location[2])
			: position === undefined
				? 1
				: value.slice(0, position).split('\n').length;
		const column = location?.[3]
			? Number(location[3])
			: position === undefined
				? 1
				: position - value.lastIndexOf('\n', position - 1);
		throw new TranslatedToolError('common.json_syntax_error', { line, column }, 'input');
	}
}
