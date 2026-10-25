import { Injectable } from '@angular/core';
import type { ToolResult, ToolValues } from '@app/core/models/tool';

export type WebMcpToolId = 'json-formatter' | 'base64' | 'uuid';

export interface WebMcpWorkbenchRequest {
	readonly toolId: WebMcpToolId;
	readonly values: ToolValues;
	readonly signal: AbortSignal;
}

@Injectable({ providedIn: 'root' })
export class WebMcpWorkbench {
	private readonly handlers = new Map<
		WebMcpToolId,
		{
			execute: (request: WebMcpWorkbenchRequest) => Promise<ToolResult>;
			reportError: (message: string) => void;
		}
	>();

	register(
		toolId: WebMcpToolId,
		handler: (request: WebMcpWorkbenchRequest) => Promise<ToolResult>,
		reportError: (message: string) => void,
	): () => void {
		this.handlers.set(toolId, { execute: handler, reportError });
		const registration = this.handlers.get(toolId);
		return () => {
			if (this.handlers.get(toolId) === registration) {
				this.handlers.delete(toolId);
			}
		};
	}

	execute(request: WebMcpWorkbenchRequest): Promise<ToolResult> {
		const registration = this.handlers.get(request.toolId);
		if (!registration) {
			return Promise.reject(new Error('The tool workbench is not ready.'));
		}
		return registration.execute(request);
	}

	reportError(toolId: WebMcpToolId, error: unknown): void {
		const message = error instanceof Error ? error.message : 'Tool arguments are invalid.';
		this.handlers.get(toolId)?.reportError(message);
	}
}
