import Papa from 'papaparse';

export function transformBatchText(text: string, operation: string, indent: string): string {
	if (operation === 'csv-json') {
		const parsed = Papa.parse<Record<string, string>>(text, {
			header: true,
			skipEmptyLines: true,
		});
		if (parsed.errors.length) {
			throw new Error(parsed.errors.map((error) => error.message).join('; '));
		}
		return JSON.stringify(parsed.data, null, 2);
	}
	const data: unknown = JSON.parse(text);
	return JSON.stringify(data, null, operation === 'json-format' ? Number(indent) : undefined);
}
