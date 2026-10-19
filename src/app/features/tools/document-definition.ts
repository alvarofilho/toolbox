import { field, text, boundedNumber, type ToolDefinition } from '../../core/models/tool';
import { generateDocument, validDocument } from '../../shared/utils/documents';
import { input, select, number, check, synthetic } from './controls';
export function documentDefinition(kind: 'cpf' | 'cnpj'): ToolDefinition {
  return {
    id: kind,
    controls: [
      select('mode', 'Operação', 'Operation', [
        ['generate', 'Gerar dados para teste', 'Generate test data'],
        ['validate', 'Validar documento', 'Validate document'],
      ]),
      input(
        'input',
        `${kind.toUpperCase()} para validar`,
        `${kind.toUpperCase()} to validate`,
        '',
        'text',
      ),
      number('count', 'Quantidade a gerar', 'Generation count', 1, 1, 1000),
      check('format', 'Com pontuação', 'Formatted'),
      ...(kind === 'cnpj' ? [check('alpha', 'Alfanumérico', 'Alphanumeric', false)] : []),
    ],
    action: text('Executar', 'Run'),
    hint: synthetic,
    example: { mode: 'validate', input: kind === 'cpf' ? '529.982.247-25' : '12.ABC.345/01DE-35' },
    run: (v) =>
      field(v, 'mode') === 'validate'
        ? {
            output: validDocument(field(v, 'input'), kind)
              ? 'Dígitos verificadores válidos / Valid check digits'
              : 'Documento inválido / Invalid document',
          }
        : {
            output: Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () =>
              generateDocument(kind, field(v, 'alpha') === 'true', field(v, 'format') === 'true'),
            ).join('\n'),
            filename: `synthetic-${kind}.txt`,
          },
  };
}
