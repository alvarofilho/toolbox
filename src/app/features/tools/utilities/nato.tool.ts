import { field } from '@app/core/models/tool';

import { result, tool } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

const nato: Readonly<Record<string, string>> = {
	A: 'Alfa',
	B: 'Bravo',
	C: 'Charlie',
	D: 'Delta',
	E: 'Echo',
	F: 'Foxtrot',
	G: 'Golf',
	H: 'Hotel',
	I: 'India',
	J: 'Juliett',
	K: 'Kilo',
	L: 'Lima',
	M: 'Mike',
	N: 'November',
	O: 'Oscar',
	P: 'Papa',
	Q: 'Quebec',
	R: 'Romeo',
	S: 'Sierra',
	T: 'Tango',
	U: 'Uniform',
	V: 'Victor',
	W: 'Whiskey',
	X: 'X-ray',
	Y: 'Yankee',
	Z: 'Zulu',
};

export const definition = tool('nato', [source], (v) =>
	result(
		Array.from(field(v, 'input').toUpperCase())
			.map((char) => nato[char] ?? (char === ' ' ? '(espaço)' : char))
			.join(' '),
	),
);
