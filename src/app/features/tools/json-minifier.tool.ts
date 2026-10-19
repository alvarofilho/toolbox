import { field, text, type ToolDefinition } from '../../core/models/tool';
import { source } from './controls';

export const definition: ToolDefinition = {
  id: 'json-minifier',
  controls: [source],
  action: text('Minificar JSON', 'Minify JSON'),
  example: { input: '{\n  "project": "Toolbox",\n  "local": true\n}' },
  run: (v) => ({
    output: JSON.stringify(JSON.parse(field(v, 'input'))),
    filename: 'minified.json',
    mime: 'application/json',
  }),
};
