import { field, boundedNumber, type ToolDefinition } from '../../core/models/tool';
import { password } from '../../shared/utils/random';
import { number, check, generate } from './controls';
const sets = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}:,.?',
};
export const definition: ToolDefinition = {
  id: 'password',
  controls: [
    number('length', 'Comprimento', 'Length', 24, 8, 256),
    check('upper', 'Maiúsculas', 'Uppercase'),
    check('lower', 'Minúsculas', 'Lowercase'),
    check('digits', 'Números', 'Numbers'),
    check('symbols', 'Símbolos', 'Symbols'),
  ],
  action: generate,
  run: (v) => ({
    output: password(
      boundedNumber(field(v, 'length'), 8, 256),
      Object.entries(sets)
        .filter(([key]) => field(v, key) === 'true')
        .map(([, value]) => value),
    ),
  }),
};
