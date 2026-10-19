export type Locale = 'pt' | 'en';
export type Localized = Readonly<Record<Locale, string>>;
export const text = (pt: string, en: string): Localized => ({ pt, en });
export interface ToolControl {
  readonly key: string;
  readonly label: Localized;
  readonly type: 'textarea' | 'text' | 'number' | 'select' | 'checkbox';
  readonly value: string;
  readonly options?: readonly { readonly value: string; readonly label: Localized }[];
  readonly min?: number;
  readonly max?: number;
}
export type ToolValues = Readonly<Record<string, string>>;
export interface ToolResult {
  readonly output: string;
  readonly filename?: string;
  readonly mime?: string;
  readonly notice?: Localized;
}
export interface ToolDefinition {
  readonly id: string;
  readonly controls: readonly ToolControl[];
  readonly action: Localized;
  readonly hint?: Localized;
  readonly example?: ToolValues;
  readonly run: (values: ToolValues) => ToolResult | Promise<ToolResult>;
}
export interface ToolInfo {
  readonly id: string;
  readonly name: Localized;
  readonly description: Localized;
  readonly category: string;
  readonly icon: string;
  readonly keywords: string;
  readonly available: boolean;
  readonly isNew?: boolean;
  readonly popular?: boolean;
}
export function field(values: ToolValues, key: string): string {
  return values[key] ?? '';
}
export function boundedNumber(value: string, min: number, max: number): number {
  const number = Number(value);
  if (!value.trim() || !Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Use ${min}–${max}.`);
  }
  return number;
}
