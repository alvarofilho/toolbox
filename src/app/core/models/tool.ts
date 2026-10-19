import { translationKey, type TranslationNamespace } from '@app/core/models/translation-key';

export type Locale = 'pt' | 'en' | 'es';

export type Localized = Readonly<Record<'pt' | 'en', string> & { es?: string; key: string }>;

export const text = (
	pt: string,
	en: string,
	es = en,
	namespace: TranslationNamespace = 'common',
): Localized => ({
	pt,
	en,
	es,
	key: translationKey(en, namespace),
});

export interface ToolControl {
	readonly key: string;
	readonly label: Localized;
	readonly type: 'textarea' | 'text' | 'password' | 'number' | 'select' | 'checkbox' | 'file';
	readonly accept?: string;
	readonly multiple?: boolean;
	readonly value: string;
	readonly options?: readonly { readonly value: string; readonly label: Localized }[];
	readonly min?: number;
	readonly max?: number;
	readonly step?: number | 'any';
	readonly inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'url';
	readonly placeholder?: Localized;
	readonly when?: { readonly key: string; readonly values: readonly string[] };
}

export type ToolValues = Readonly<Record<string, string>>;

export type ToolFiles = Readonly<Record<string, readonly File[]>>;

export interface ToolArtifact {
	readonly blob: Blob;
	readonly filename: string;
}

export interface ToolResult {
	readonly output: string;
	readonly filename?: string;
	readonly mime?: string;
	readonly notice?: Localized;
	readonly artifacts?: readonly ToolArtifact[];
	readonly preview?: string;
}

export interface ToolDefinition {
	readonly id: string;
	readonly controls: readonly ToolControl[];
	readonly action: Localized;
	readonly hint?: Localized;
	readonly example?: ToolValues;
	readonly execution?: 'automatic' | 'manual';
	readonly run: (values: ToolValues, files?: ToolFiles) => ToolResult | Promise<ToolResult>;
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
