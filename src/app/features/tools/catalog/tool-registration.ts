import type { ToolDefinition, ToolInfo } from '@app/core/models/tool';
import type { ToolCategory } from '@app/features/tools/catalog/categories';

export interface ToolRegistration extends ToolInfo {
	readonly category: ToolCategory;
	readonly loadDefinition: () => Promise<ToolDefinition>;
}
