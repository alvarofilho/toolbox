import type { TranslationKey } from '@app/core/models/translation-key';
export type { TranslationKey } from '@app/core/models/translation-key';

export type Locale = 'pt' | 'en' | 'es';

export interface ToolControl {
	readonly key: string;
	readonly label: TranslationKey;
	readonly type: 'textarea' | 'text' | 'password' | 'number' | 'select' | 'checkbox' | 'file';
	readonly accept?: string;
	readonly multiple?: boolean;
	readonly value: string;
	readonly options?: readonly { readonly value: string; readonly label?: TranslationKey }[];
	readonly min?: number;
	readonly max?: number;
	readonly step?: number | 'any';
	readonly inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'url';
	readonly placeholder?: TranslationKey;
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
	readonly notice?: TranslationKey;
	readonly noticeParams?: Readonly<Record<string, string | number>>;
	readonly artifacts?: readonly ToolArtifact[];
	readonly preview?: string;
}

export interface ToolDefinition {
	readonly id: string;
	readonly controls: readonly ToolControl[];
	readonly action: TranslationKey;
	readonly hint?: TranslationKey;
	readonly example?: ToolValues;
	readonly execution?: 'automatic' | 'manual';
	readonly run: (values: ToolValues, files?: ToolFiles) => ToolResult | Promise<ToolResult>;
}

export interface ToolInfo {
	readonly id: string;
	readonly name: TranslationKey;
	readonly description: TranslationKey;
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
