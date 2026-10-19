import type { ToolDefinition } from '../../../core/models/tool';
import { EXTENDED_GROUPS, type ExtendedGroup } from '../../../core/registry/extended-tools';

const groups: Record<ExtendedGroup, () => Promise<{ definitions: readonly ToolDefinition[] }>> = {
  generators: () => import('./generators'),
  json: () => import('./data'),
  converters: () => import('./converters'),
  security: () => import('./security'),
  development: () => import('./development'),
  utilities: () => import('./utilities'),
  database: () => import('./database'),
  brazilian: () => import('./brazilian'),
  mercosur: () => import('./mercosur'),
  infrastructure: () => import('./infrastructure'),
  text: () => import('./files-text'),
  frontend: () => import('./frontend'),
};
export const EXTENDED_LOADERS = Object.fromEntries(
  Object.entries(EXTENDED_GROUPS).flatMap(([group, rows]) =>
    rows.map(([id]) => [
      id,
      async () => {
        const { definitions } = await groups[group as ExtendedGroup](); // Keys come from the typed group table above.
        const definition = definitions.find((d) => d.id === id);
        if (!definition) throw new Error(`Missing implementation: ${id}`);
        return { definition };
      },
    ]),
  ),
);
