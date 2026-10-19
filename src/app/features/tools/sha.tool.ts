import { field, text, type ToolDefinition } from '../../core/models/tool';
import { hex } from '../../shared/utils/random';
import { source, select } from './controls';
export const definition: ToolDefinition = {
  id: 'sha',
  controls: [
    source,
    select('algorithm', 'Algoritmo', 'Algorithm', [
      ['SHA-256', 'SHA-256', 'SHA-256'],
      ['SHA-512', 'SHA-512', 'SHA-512'],
    ]),
  ],
  action: text('Calcular hash', 'Calculate hash'),
  example: { input: 'abc', algorithm: 'SHA-256' },
  hint: text(
    'Hash do texto UTF-8. Não é criptografia reversível.',
    'Hash of UTF-8 text. This is not reversible encryption.',
  ),
  run: async (v) => ({
    output: hex(
      new Uint8Array(
        await crypto.subtle.digest(
          field(v, 'algorithm'),
          new TextEncoder().encode(field(v, 'input')),
        ),
      ),
    ),
  }),
};
