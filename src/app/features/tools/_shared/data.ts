import { TranslatedToolError } from '@app/core/models/tool';

export function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new TranslatedToolError('common.json_object_required', {}, 'input');
	}
	return value as Record<string, unknown>; // Runtime guard above establishes a record.
}

export function jsonErrorLocation(
	message: string,
	value: string,
): Readonly<{ line: number; column: number }> | undefined {
	const location = /(?:position\s+(\d+)|line\s+(\d+)\s+column\s+(\d+))/i.exec(message);
	if (location?.[2] && location[3]) {
		return { line: Number(location[2]), column: Number(location[3]) };
	}
	if (location?.[1]) {
		const position = Number(location[1]);
		return {
			line: value.slice(0, position).split('\n').length,
			column: position - value.lastIndexOf('\n', position - 1),
		};
	}
	return undefined;
}

export function json(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch (error: unknown) {
		if (!(error instanceof SyntaxError)) {
			throw error;
		}
		const location = jsonErrorLocation(error.message, value);
		if (location) {
			throw new TranslatedToolError('common.json_syntax_error', location, 'input');
		}
		throw new TranslatedToolError('common.json_syntax_error_generic', {}, 'input');
	}
}
