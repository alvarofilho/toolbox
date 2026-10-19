import { field, type ToolDefinition } from '../../core/models/tool';
import { base64Decode, base64Encode } from '../../shared/utils/encoding';
import { source, select, transform } from './controls';
export const definition: ToolDefinition = {
  id: 'base64',
  controls: [
    source,
    select('mode', 'Operação', 'Operation', [
      ['encode', 'Codificar', 'Encode'],
      ['decode', 'Decodificar', 'Decode'],
    ]),
  ],
  action: transform,
  example: { input: 'Olá, mundo! 🌎', mode: 'encode' },
  run: (v) => ({
    output:
      field(v, 'mode') === 'encode'
        ? base64Encode(field(v, 'input'))
        : base64Decode(field(v, 'input')),
  }),
};
