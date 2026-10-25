import { DOCUMENT } from '@angular/common';
import {
	declareExperimentalWebMcpTool,
	inject,
	provideEnvironmentInitializer,
} from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { WebMcpWorkbench, type WebMcpToolId } from '@app/core/services/webmcp-workbench';

const textSchema = {
	type: 'object',
	properties: {
		input: { type: 'string', description: 'Text to transform (maximum 100,000 characters).' },
	},
	required: ['input'],
	additionalProperties: false,
} as const;

function record(value: unknown): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('Arguments must be an object.');
	}
	const result: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(value)) {
		result[key] = entry;
	}
	return result;
}

export function validateWebMcpInput(args: unknown, toolId: WebMcpToolId): Record<string, string> {
	const values = record(args);
	const allowed =
		toolId === 'json-formatter'
			? ['input', 'indent']
			: toolId === 'base64'
				? ['input', 'mode']
				: ['version', 'count'];
	if (Object.keys(values).some((key) => !allowed.includes(key))) {
		throw new Error('Arguments contain unsupported properties.');
	}
	const parsed: Record<string, string> = {};
	if (toolId !== 'uuid') {
		const input = values['input'];
		if (typeof input !== 'string') {
			throw new Error('input must be a string.');
		}
		if (input.length > 100_000) {
			throw new Error('input exceeds 100,000 characters.');
		}
		parsed['input'] = input;
	}
	if (toolId === 'json-formatter') {
		const indent = values['indent'] ?? '2';
		if (indent !== '2' && indent !== '4') {
			throw new Error('indent must be 2 or 4.');
		}
		parsed['indent'] = indent;
	}
	if (toolId === 'base64') {
		const mode = values['mode'] ?? 'encode';
		if (mode !== 'encode' && mode !== 'decode') {
			throw new Error('mode must be encode or decode.');
		}
		parsed['mode'] = mode;
	}
	if (toolId === 'uuid') {
		const version = values['version'] ?? '4';
		const count = values['count'] ?? 1;
		if (version !== '4' && version !== '7') {
			throw new Error('version must be 4 or 7.');
		}
		if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 1000) {
			throw new Error('count must be an integer from 1 to 1,000.');
		}
		parsed['version'] = version;
		parsed['count'] = String(count);
	}
	return parsed;
}

async function executeWebMcpTool(
	toolId: WebMcpToolId,
	args: unknown,
	signal: AbortSignal,
): Promise<string> {
	const workbench = inject(WebMcpWorkbench);
	try {
		const values = validateWebMcpInput(args, toolId);
		return (
			await workbench.execute({
				toolId,
				values,
				signal,
			})
		).output;
	} catch (error: unknown) {
		if (!signal.aborted) {
			workbench.reportError(toolId, error);
		}
		throw error;
	}
}

function registerJsonFormatter(): Promise<void> {
	return declareExperimentalWebMcpTool({
		name: 'toolbox_json_format',
		description: 'Validate and format JSON text using 2 or 4 spaces.',
		inputSchema: {
			...textSchema,
			properties: { ...textSchema.properties, indent: { type: 'string', enum: ['2', '4'] } },
		},
		annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
		execute: (args, client) => executeWebMcpTool('json-formatter', args, client.signal),
	});
}

function registerBase64(): Promise<void> {
	return declareExperimentalWebMcpTool({
		name: 'toolbox_base64_convert',
		description: 'Encode UTF-8 text to Base64 or decode Base64 to UTF-8 text.',
		inputSchema: {
			...textSchema,
			properties: {
				...textSchema.properties,
				mode: { type: 'string', enum: ['encode', 'decode'] },
			},
		},
		annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
		execute: (args, client) => executeWebMcpTool('base64', args, client.signal),
	});
}

function registerUuid(): Promise<void> {
	return declareExperimentalWebMcpTool({
		name: 'toolbox_uuid_generate',
		description: 'Generate UUID version 4 or 7 identifiers.',
		inputSchema: {
			type: 'object',
			properties: {
				version: { type: 'string', enum: ['4', '7'], description: 'UUID version.' },
				count: { type: 'integer', minimum: 1, maximum: 1000, description: 'Number of UUIDs.' },
			},
			additionalProperties: false,
		},
		annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
		execute: (args, client) => executeWebMcpTool('uuid', args, client.signal),
	});
}

export function provideWebMcpTool(toolId: WebMcpToolId): EnvironmentProviders {
	return provideEnvironmentInitializer(() => {
		const browserDocument = inject(DOCUMENT);
		const documentContext = browserDocument as Document & {
			modelContext?: { registerTool?: unknown };
		};
		const navigatorContext = browserDocument.defaultView?.navigator as
			(Navigator & { modelContext?: { registerTool?: unknown } }) | undefined;
		if (
			typeof documentContext.modelContext?.registerTool !== 'function' &&
			typeof navigatorContext?.modelContext?.registerTool !== 'function'
		) {
			return;
		}
		const registration =
			toolId === 'json-formatter'
				? registerJsonFormatter()
				: toolId === 'base64'
					? registerBase64()
					: registerUuid();
		void registration.catch(() => undefined);
	});
}
