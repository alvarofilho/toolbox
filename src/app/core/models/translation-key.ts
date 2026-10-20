import type en from '@app/i18n/en.json';

type LeafKeys<T> = {
	[K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafKeys<T[K]>}`;
}[keyof T & string];

export type TranslationKey = LeafKeys<typeof en>;
