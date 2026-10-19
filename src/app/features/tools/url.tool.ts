import { field, type ToolDefinition } from '../../core/models/tool';
import { source, select, transform } from './controls';

export const definition: ToolDefinition = {
  id: 'url',
  controls: [
    source,
    select('mode', 'Operação', 'Operation', [
      ['encode', 'Codificar componente', 'Encode component'],
      ['decode', 'Decodificar componente', 'Decode component'],
    ]),
  ],
  action: transform,
  example: { input: 'Olá mundo?x=1&y=2', mode: 'encode' },
  run: (v) => ({
    output:
      field(v, 'mode') === 'encode'
        ? encodeURIComponent(field(v, 'input'))
        : decodeURIComponent(field(v, 'input')),
  }),
};
