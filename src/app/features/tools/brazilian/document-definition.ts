import { field, boundedNumber, type ToolDefinition } from '@app/core/models/tool';
import { generateDocument, validDocument } from '@app/features/tools/brazilian/documents';
import { input, select, number, check, synthetic } from '@app/features/tools/_shared/controls';
import { result } from '@app/features/tools/_shared/definition';

export function documentDefinition(kind: 'cpf' | 'cnpj'): ToolDefinition {
	return {
		id: kind,
		controls: [
			select('mode', 'common.operation', [
				['generate', 'common.generate_test_data'],
				['validate', 'common.validate_document'],
			]),
			input(
				'input',
				kind === 'cpf' ? 'common.cpf_to_validate' : 'common.cnpj_to_validate',
				'',
				'text',
			),
			number('count', 'common.generation_count', 1, 1, 1000),
			check('format', 'common.formatted'),
			...(kind === 'cnpj' ? [check('alpha', 'common.alphanumeric', false)] : []),
		],
		action: 'common.run_title',
		hint: synthetic,
		example: { mode: 'validate', input: kind === 'cpf' ? '529.982.247-25' : '12.ABC.345/01DE-35' },
		run: (v) =>
			field(v, 'mode') === 'validate'
				? result({ valid: validDocument(field(v, 'input'), kind), type: kind.toUpperCase() })
				: {
						output: Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () =>
							generateDocument(kind, field(v, 'alpha') === 'true', field(v, 'format') === 'true'),
						).join('\n'),
						filename: `synthetic-${kind}.txt`,
					},
	};
}
