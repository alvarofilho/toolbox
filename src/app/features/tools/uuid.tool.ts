import { field, boundedNumber, type ToolDefinition } from '../../core/models/tool';
import { uuid } from '../../shared/utils/random';
import { select, number, generate } from './controls';
export const definition: ToolDefinition = {
  id: 'uuid',
  controls: [
    select('version', 'Versão', 'Version', [
      ['4', 'UUID v4 · aleatório', 'UUID v4 · random'],
      ['7', 'UUID v7 · ordenado por tempo', 'UUID v7 · time ordered'],
    ]),
    number('count', 'Quantidade', 'Count', 1, 1, 1000),
  ],
  action: generate,
  run: (v) => ({
    output: Array.from({ length: boundedNumber(field(v, 'count'), 1, 1000) }, () =>
      uuid(field(v, 'version')),
    ).join('\n'),
    filename: 'uuids.txt',
  }),
};
