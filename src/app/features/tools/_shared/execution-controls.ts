import { type ToolControl } from '@app/core/models/tool';
import { input, number, select } from '@app/features/tools/_shared/controls';

export const second = input('second', 'Segunda entrada', 'Second input');

export const count = number('count', 'Quantidade', 'Count', 5, 1, 1000);

export const mode = (options: readonly string[]): ToolControl =>
	select(
		'mode',
		'Operação',
		'Operation',
		options.map((v) => [v, v, v]),
	);
