import { XMLValidator } from 'fast-xml-parser';

export function xml(value: string): void {
	if (/<!DOCTYPE|<!ENTITY/i.test(value)) {
		throw new Error('DOCTYPE/ENTITY não permitidos / DOCTYPE/ENTITY not allowed');
	}
	const validation = XMLValidator.validate(value);
	if (validation !== true) {
		throw new Error(`${validation.err.msg} (${validation.err.line}:${validation.err.col})`);
	}
}
