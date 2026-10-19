import { field, text, type ToolDefinition } from '../../core/models/tool';
import { lineDiff } from '../../shared/utils/difference';
import { input } from './controls';
export const definition: ToolDefinition = {
  id: 'text-diff',
  controls: [
    input('input', 'Texto original', 'Original text'),
    input('second', 'Texto modificado', 'Modified text'),
  ],
  action: text('Comparar textos', 'Compare text'),
  hint: text(
    'Comparação por linhas: − removido, + adicionado.',
    'Line comparison: − removed, + added.',
  ),
  example: { input: 'Olá, mundo!\nToolbox', second: 'Olá, Brasil!\nToolbox' },
  run: (v) => ({ output: lineDiff(field(v, 'input'), field(v, 'second')), filename: 'text.diff' }),
};
