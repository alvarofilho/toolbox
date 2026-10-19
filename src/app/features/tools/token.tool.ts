import { field, boundedNumber, type ToolDefinition } from '../../core/models/tool';
import { hex } from '../../shared/utils/random';
import { select, number, generate } from './controls';
export const definition: ToolDefinition = {
  id: 'token',
  controls: [
    number('bytes', 'Bytes de entropia', 'Entropy bytes', 32, 16, 256),
    select('encoding', 'Formato', 'Format', [
      ['hex', 'Hexadecimal', 'Hexadecimal'],
      ['base64', 'Base64 URL-safe', 'Base64 URL-safe'],
    ]),
  ],
  action: generate,
  run: (v) => {
    const bytes = crypto.getRandomValues(new Uint8Array(boundedNumber(field(v, 'bytes'), 16, 256)));
    return {
      output:
        field(v, 'encoding') === 'hex'
          ? hex(bytes)
          : btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, ''),
    };
  },
};
