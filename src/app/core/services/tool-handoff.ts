import { Injectable, signal } from '@angular/core';

export const TOOL_HANDOFF_TARGETS = ['json-formatter', 'jsonpath', 'json-typescript'] as const;

export type ToolHandoffTarget = (typeof TOOL_HANDOFF_TARGETS)[number];

const compatibleTargets = {
	'csv-json': ['json-formatter'],
	'json-formatter': ['jsonpath', 'json-typescript'],
	jsonpath: ['json-typescript'],
} as const satisfies Readonly<Record<string, readonly ToolHandoffTarget[]>>;

export function compatibleHandoffTargets(sourceToolId: string): readonly ToolHandoffTarget[] {
	return Object.entries(compatibleTargets).find(([id]) => id === sourceToolId)?.[1] ?? [];
}

export function isToolHandoffTarget(toolId: string): toolId is ToolHandoffTarget {
	return TOOL_HANDOFF_TARGETS.some((targetId) => targetId === toolId);
}

interface PendingToolHandoff {
	readonly target: ToolHandoffTarget;
	readonly value: string;
}

@Injectable({ providedIn: 'root' })
export class ToolHandoffService {
	private readonly offeredTransfer = signal<PendingToolHandoff | null>(null);

	offer(target: ToolHandoffTarget, value: string): void {
		this.offeredTransfer.set({ target, value });
	}

	consume(target: ToolHandoffTarget): string | null {
		const transfer = this.offeredTransfer();
		if (!transfer || transfer.target !== target) {
			return null;
		}
		this.offeredTransfer.set(null);
		return transfer.value;
	}

	clear(): void {
		this.offeredTransfer.set(null);
	}
}
