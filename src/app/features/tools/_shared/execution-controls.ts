import type { ToolControl, TranslationKey } from '@app/core/models/tool';
import { input, number, select } from '@app/features/tools/_shared/controls';

export const second = input('second', 'common.second_input');

export const count = number('count', 'common.count', 5, 1, 1000);

const operations: Readonly<Record<string, TranslationKey>> = {
	encode: 'common.encode',
	decode: 'common.decode',
	generate: 'common.generate',
	validate: 'common.validate',
	verify: 'common.verify',
	encrypt: 'common.encrypt',
	decrypt: 'common.decrypt',
	merge: 'common.merge_files',
	extract: 'common.extract_pages',
	split: 'common.split_files',
	hash: 'common.generate_hash',
	format: 'common.apply_formatting',
	strip: 'common.remove_formatting',
	barcode: 'common.barcode',
	line: 'common.payment_line',
	exact: 'common.exact_comparison',
	trim: 'common.ignore_surrounding_whitespace',
	'ignore-case': 'common.ignore_case',
	ascending: 'common.ascending_order',
	descending: 'common.descending_order',
	numeric: 'common.numeric_order',
	'ticks-to-iso': 'common.ticks_to_iso',
	'iso-to-ticks': 'common.iso_to_ticks',
	regular: 'common.regular_string',
	verbatim: 'common.verbatim_string',
	pascal: 'common.pascalcase',
	camel: 'common.camelcase',
};

export const mode = (options: readonly string[]): ToolControl =>
	select(
		'mode',
		'common.operation',
		options.map((value) => [value, operations[value]]),
	);
