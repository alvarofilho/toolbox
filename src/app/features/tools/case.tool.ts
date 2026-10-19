import { field, type ToolDefinition } from '../../core/models/tool';
import { convertCase } from '../../shared/utils/encoding';
import { source, select, transform } from './controls';
export const definition: ToolDefinition = {
  id: 'case',
  controls: [
    source,
    select('mode', 'Formato', 'Format', [
      ['camel', 'camelCase', 'camelCase'],
      ['pascal', 'PascalCase', 'PascalCase'],
      ['snake', 'snake_case', 'snake_case'],
      ['kebab', 'kebab-case', 'kebab-case'],
      ['upper', 'MAIÚSCULAS', 'UPPERCASE'],
      ['lower', 'minúsculas', 'lowercase'],
    ]),
  ],
  action: transform,
  example: { input: 'Minha primeira ferramenta', mode: 'camel' },
  run: (v) => ({ output: convertCase(field(v, 'input'), field(v, 'mode')) }),
};
