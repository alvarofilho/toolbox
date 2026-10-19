export function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error('Objeto esperado / Expected an object');
	}
	return value as Record<string, unknown>; // Runtime guard above establishes a record.
}

export const json = (value: string): unknown => JSON.parse(value);
