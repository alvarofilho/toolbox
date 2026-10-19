export function parseEnv(value: string): {
	values: Record<string, string>;
	duplicates: string[];
	references: string[];
} {
	const values: Record<string, string> = {},
		duplicates: string[] = [],
		references = new Set<string>();
	Object.setPrototypeOf(values, null);
	const lines = value.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line || line.startsWith('#')) {
			continue;
		}
		const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*)$/.exec(line);
		if (!m) {
			throw new Error(`Linha ${i + 1}: atribuição inválida / invalid assignment`);
		}
		const key = m[1];
		let val = m[2];
		const quote = val[0];
		if (quote === '"' || quote === "'") {
			while (!new RegExp(`${quote}(?:\\s*#.*)?$`).test(val.slice(1)) && i < lines.length - 1) {
				val += '\n' + lines[++i];
			}
			const match = new RegExp(`^${quote}([\\s\\S]*)${quote}\\s*(?:#.*)?$`).exec(val);
			if (!match) {
				throw new Error(`Aspas não fechadas / Unclosed quotes: ${key}`);
			}
			val = match[1];
			if (quote === '"') {
				val = val
					.replace(/\\n/g, '\n')
					.replace(/\\r/g, '\r')
					.replace(/\\"/g, '"')
					.replace(/\\\\/g, '\\');
			}
		} else {
			val = val.replace(/\s+#.*$/, '').trim();
		}
		if (Object.hasOwn(values, key)) {
			duplicates.push(key);
		}
		values[key] = val;
		if (quote !== "'") {
			for (const ref of val.matchAll(/\$\{([A-Za-z_][\w]*)\}/g)) {
				references.add(ref[1]);
			}
		}
	}
	return { values, duplicates, references: [...references] };
}
