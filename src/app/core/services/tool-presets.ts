import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import type { ToolControl, ToolValues } from '@app/core/models/tool';

export interface ToolPreset {
	readonly id: string;
	readonly name: string;
	readonly version: 1;
	readonly values: ToolValues;
}

const STORAGE_KEY = 'toolbox.presets.v1';
const PRESET_VERSION = 1;

// This allowlist is the persistence contract. Never infer persisted fields from a tool's controls.
const PERSISTED_KEYS: Readonly<Record<string, readonly string[]>> = {
	person: [
		'count',
		'minAge',
		'maxAge',
		'state',
		'format',
		'include-name',
		'include-cpf',
		'include-email',
		'include-phone',
		'include-birthDate',
		'include-state',
	],
	'data-generator': ['count', 'format'],
	'json-formatter': ['indent'],
};

@Injectable({ providedIn: 'root' })
export class ToolPresetsService {
	private readonly document = inject(DOCUMENT);
	readonly storageUnavailable = signal(false);

	supports(toolId: string, controls: readonly ToolControl[]): boolean {
		return this.controlsFor(toolId, controls) !== undefined;
	}

	list(toolId: string, controls: readonly ToolControl[]): readonly ToolPreset[] {
		const allowed = this.controlsFor(toolId, controls);
		if (!allowed) {
			return [];
		}
		const stored = this.read();
		if (!stored) {
			return [];
		}
		const entries = stored[toolId];
		if (!Array.isArray(entries)) {
			return [];
		}
		return entries.flatMap((entry) => {
			const preset = this.validatePreset(entry, toolId, allowed);
			return preset ? [preset] : [];
		});
	}

	save(
		toolId: string,
		controls: readonly ToolControl[],
		name: string,
		values: ToolValues,
	): 'saved' | 'duplicate' | 'invalid' | 'unavailable' {
		const allowed = this.controlsFor(toolId, controls);
		const cleanName = name.trim();
		if (!allowed || !cleanName || cleanName.length > 40) {
			return 'invalid';
		}
		const presets = this.list(toolId, controls);
		if (
			presets.some((preset) => preset.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())
		) {
			return 'duplicate';
		}
		const savedValues: Record<string, string> = {};
		for (const control of allowed) {
			const value = values[control.key];
			if (typeof value !== 'string' || !this.validValue(control, value)) {
				return 'invalid';
			}
			savedValues[control.key] = value;
		}
		if (!this.validCombination(toolId, savedValues)) {
			return 'invalid';
		}
		return this.write((data) => ({
			...data,
			[toolId]: [
				...this.list(toolId, controls),
				{
					id: this.createId(),
					name: cleanName,
					version: PRESET_VERSION,
					values: savedValues,
				},
			],
		}));
	}

	remove(toolId: string, controls: readonly ToolControl[], id: string): boolean {
		const presets = this.list(toolId, controls);
		if (!presets.some((preset) => preset.id === id)) {
			return false;
		}
		return (
			this.write((data) => ({
				...data,
				[toolId]: presets.filter((preset) => preset.id !== id),
			})) === 'saved'
		);
	}

	find(toolId: string, controls: readonly ToolControl[], id: string): ToolPreset | undefined {
		return this.list(toolId, controls).find((preset) => preset.id === id);
	}

	private controlsFor(
		toolId: string,
		controls: readonly ToolControl[],
	): readonly ToolControl[] | undefined {
		const keys = PERSISTED_KEYS[toolId];
		if (!keys) {
			return undefined;
		}
		const byKey = new Map(controls.map((control) => [control.key, control]));
		const selected = keys.map((key) => byKey.get(key));
		return selected.every((control): control is ToolControl => control !== undefined)
			? selected
			: undefined;
	}

	private validValue(control: ToolControl, value: string): boolean {
		if (control.type === 'checkbox') {
			return value === 'true' || value === 'false';
		}
		if (control.type === 'select') {
			return control.options?.some((option) => option.value === value) ?? false;
		}
		if (control.type === 'number') {
			const number = Number(value);
			return (
				value.trim() !== '' &&
				Number.isFinite(number) &&
				number >= (control.min ?? -Infinity) &&
				number <= (control.max ?? Infinity)
			);
		}
		return false;
	}

	private validatePreset(
		value: unknown,
		toolId: string,
		controls: readonly ToolControl[],
	): ToolPreset | undefined {
		if (typeof value !== 'object' || value === null) {
			return undefined;
		}
		const candidate = value as Record<string, unknown>;
		if (
			candidate['version'] !== PRESET_VERSION ||
			typeof candidate['id'] !== 'string' ||
			typeof candidate['name'] !== 'string' ||
			candidate['name'].trim() === '' ||
			candidate['name'].length > 40 ||
			typeof candidate['values'] !== 'object' ||
			candidate['values'] === null
		) {
			return undefined;
		}
		const saved = candidate['values'] as Record<string, unknown>;
		const keys = controls.map((control) => control.key);
		if (
			Object.keys(saved).length !== keys.length ||
			Object.keys(saved).some((key) => !keys.includes(key))
		) {
			return undefined;
		}
		const values: Record<string, string> = {};
		for (const control of controls) {
			const entry = saved[control.key];
			if (typeof entry !== 'string' || !this.validValue(control, entry)) {
				return undefined;
			}
			values[control.key] = entry;
		}
		if (!this.validCombination(toolId, values)) {
			return undefined;
		}
		return { id: candidate['id'], name: candidate['name'].trim(), version: PRESET_VERSION, values };
	}

	private validCombination(toolId: string, values: ToolValues): boolean {
		if (toolId !== 'person') {
			return true;
		}
		return Number(values['minAge']) <= Number(values['maxAge']);
	}

	private read(): Record<string, unknown> | undefined {
		try {
			const raw = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				return {};
			}
			const parsed: unknown = JSON.parse(raw);
			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'version' in parsed &&
				parsed.version === PRESET_VERSION &&
				'tools' in parsed &&
				typeof parsed.tools === 'object' &&
				parsed.tools !== null
			) {
				return this.sanitizeTools(parsed.tools as Record<string, unknown>);
			}
			return {};
		} catch {
			return undefined;
		}
	}

	private write(
		update: (data: Record<string, unknown>) => Record<string, unknown>,
	): 'saved' | 'unavailable' {
		try {
			const storage = this.document.defaultView?.localStorage;
			if (!storage) {
				throw new Error('Storage unavailable');
			}
			const data = this.read() ?? {};
			storage.setItem(
				STORAGE_KEY,
				JSON.stringify({ version: PRESET_VERSION, tools: update(data) }),
			);
			this.storageUnavailable.set(false);
			return 'saved';
		} catch {
			this.storageUnavailable.set(true);
			return 'unavailable';
		}
	}

	private sanitizeTools(tools: Record<string, unknown>): Record<string, unknown> {
		const safe: Record<string, unknown> = {};
		for (const [toolId, entries] of Object.entries(tools)) {
			const allowedKeys = PERSISTED_KEYS[toolId];
			if (!allowedKeys || !Array.isArray(entries)) {
				continue;
			}
			safe[toolId] = entries.flatMap((entry) => {
				if (typeof entry !== 'object' || entry === null) {
					return [];
				}
				const candidate = entry as Record<string, unknown>;
				const values = candidate['values'];
				if (
					candidate['version'] !== PRESET_VERSION ||
					typeof candidate['id'] !== 'string' ||
					candidate['id'].length > 100 ||
					typeof candidate['name'] !== 'string' ||
					candidate['name'].trim() === '' ||
					candidate['name'].length > 40 ||
					typeof values !== 'object' ||
					values === null
				) {
					return [];
				}
				const saved = values as Record<string, unknown>;
				const keys = Object.keys(saved);
				if (keys.length !== allowedKeys.length || keys.some((key) => !allowedKeys.includes(key))) {
					return [];
				}
				if (Object.values(saved).some((value) => typeof value !== 'string' || value.length > 100)) {
					return [];
				}
				return [
					{
						id: candidate['id'],
						name: candidate['name'].trim(),
						version: PRESET_VERSION,
						values: Object.fromEntries(allowedKeys.map((key) => [key, saved[key]])),
					},
				];
			});
		}
		return safe;
	}

	private createId(): string {
		return (
			this.document.defaultView?.crypto.randomUUID() ??
			`${Date.now()}-${Math.random().toString(36).slice(2)}`
		);
	}
}
