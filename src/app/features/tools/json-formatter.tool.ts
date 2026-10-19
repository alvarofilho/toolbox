import { field, text, type ToolDefinition } from '../../core/models/tool';
import { source, select } from './controls';

export const definition: ToolDefinition = {
  id: 'json-formatter',
  controls: [
    source,
    select('indent', 'Indentação', 'Indentation', [
      ['2', '2 espaços', '2 spaces'],
      ['4', '4 espaços', '4 spaces'],
    ]),
  ],
  action: text('Formatar e validar', 'Format and validate'),
  example: { input: '{"project":"Toolbox","local":true,"tools":["JSON","CPF"]}' },
  run: (v) => ({
    output: JSON.stringify(JSON.parse(field(v, 'input')), null, Number(field(v, 'indent'))),
    filename: 'formatted.json',
    mime: 'application/json',
    notice: text('JSON válido.', 'Valid JSON.'),
  }),
};
