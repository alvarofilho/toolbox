import { field, text, type ToolDefinition } from '../../core/models/tool';
import { decodeJwt } from '../../shared/utils/encoding';
import { source } from './controls';
export const definition: ToolDefinition = {
  id: 'jwt',
  controls: [source],
  action: text('Decodificar JWT', 'Decode JWT'),
  hint: text(
    'Apenas decodificação. A assinatura e a autenticidade do token não são verificadas.',
    'Decoding only. The token signature and authenticity are not verified.',
  ),
  example: {
    input:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZSIsIm5hbWUiOiJBbmEiLCJleHAiOjE3NjcyMjU2MDB9.c2lnbmF0dXJl',
  },
  run: (v) => ({
    output: decodeJwt(field(v, 'input')),
    filename: 'jwt.json',
    mime: 'application/json',
  }),
};
