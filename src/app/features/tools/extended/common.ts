import {
  boundedNumber,
  field,
  text,
  type ToolControl,
  type ToolDefinition,
  type ToolResult,
  type ToolFiles,
  type ToolValues,
} from '../../../core/models/tool';
import { input, number, select, source } from '../controls';

export { input, number, select, source, field, text, boundedNumber };
export const second = input('second', 'Segunda entrada', 'Second input');
export const count = number('count', 'Quantidade', 'Count', 5, 1, 1000);
export const mode = (options: readonly string[]): ToolControl =>
  select(
    'mode',
    'Operação',
    'Operation',
    options.map((v) => [v, v, v]),
  );

export const file = (accept = '', multiple = false): ToolControl => ({
  key: 'files',
  label: text('Arquivos locais (até 20 MB cada)', 'Local files (up to 20 MB each)'),
  type: 'file',
  value: '',
  accept,
  multiple,
});

export function tool(
  id: string,
  controls: readonly ToolControl[],
  run: ToolDefinition['run'],
  example?: ToolValues,
  hint?: ToolDefinition['hint'],
): ToolDefinition {
  return { id, controls, run, example, hint, action: text('Executar', 'Run') };
}

export const result = (value: unknown, filename = 'result.json'): ToolResult => ({
  output: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  filename,
});

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Objeto esperado / Expected an object');
  return value as Record<string, unknown>; // Runtime guard above establishes a record.
}

export const json = (value: string): unknown => JSON.parse(value);

export const escapeHtml = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

export function filesFrom(files?: ToolFiles): readonly File[] {
  const selected = files?.['files'] ?? [];
  if (!selected.length) throw new Error('Selecione arquivos / Select files');
  if (
    selected.length > 20 ||
    selected.some((f) => f.size > 20 * 1024 * 1024) ||
    selected.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
  )
    throw new Error('Limite: 20 arquivos, 20 MB por arquivo, 50 MB no total / File limit exceeded');
  return selected;
}

export function firstFile(files?: ToolFiles): File {
  const selected = filesFrom(files);
  if (selected.length !== 1) throw new Error('Selecione um arquivo / Select one file');
  return selected[0];
}

export function bytesHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexBytes(s: string): Uint8Array<ArrayBuffer> {
  if (!/^(?:[0-9a-f]{2})+$/i.test(s)) throw new Error('Hexadecimal inválido / Invalid hex');
  return Uint8Array.from(s.match(/../g) ?? [], (c) => parseInt(c, 16));
}

export function base64Bytes(s: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function bytesBase64(b: Uint8Array): string {
  let s = '';
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s);
}

export const utf8 = (s: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(s);

export function preview(body: string, css = ''): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>body{font:16px system-ui;padding:20px;color:#152b24;background:#fafaf7;overflow-wrap:anywhere}img{max-width:100%}pre{white-space:pre-wrap}${css}</style></head><body>${body}</body></html>`;
}
