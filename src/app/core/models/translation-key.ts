export function translationKey(source: string): string {
	const slug = source
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '')
		.slice(0, 42);
	let hash = 0x811c9dc5;
	for (let index = 0; index < source.length; index++) {
		hash = Math.imul(hash ^ source.charCodeAt(index), 0x01000193) >>> 0;
	}
	return `messages.${slug || 'text'}_${hash.toString(16).padStart(8, '0')}`;
}
