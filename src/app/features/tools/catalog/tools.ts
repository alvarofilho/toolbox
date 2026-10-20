import type { TranslationKey } from '@app/core/models/tool';
import { CATEGORIES } from '@app/features/tools/catalog/categories';
import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';
import { JSON_TOOLS } from '@app/features/tools/catalog/json.catalog';
import { CONVERTERS_TOOLS } from '@app/features/tools/catalog/converters.catalog';
import { GENERATORS_TOOLS } from '@app/features/tools/catalog/generators.catalog';
import { SECURITY_TOOLS } from '@app/features/tools/catalog/security.catalog';
import { DEVELOPMENT_TOOLS } from '@app/features/tools/catalog/development.catalog';
import { UTILITIES_TOOLS } from '@app/features/tools/catalog/utilities.catalog';
import { TEXT_TOOLS } from '@app/features/tools/catalog/text.catalog';
import { BRAZILIAN_TOOLS } from '@app/features/tools/catalog/brazilian.catalog';
import { MERCOSUR_TOOLS } from '@app/features/tools/catalog/mercosur.catalog';
import { DATABASE_TOOLS } from '@app/features/tools/catalog/database.catalog';
import { INFRASTRUCTURE_TOOLS } from '@app/features/tools/catalog/infrastructure.catalog';
import { FRONTEND_TOOLS } from '@app/features/tools/catalog/frontend.catalog';

export { CATEGORIES } from '@app/features/tools/catalog/categories';

export const TOOLS: readonly ToolRegistration[] = [
	...JSON_TOOLS,
	...CONVERTERS_TOOLS,
	...GENERATORS_TOOLS,
	...SECURITY_TOOLS,
	...DEVELOPMENT_TOOLS,
	...UTILITIES_TOOLS,
	...TEXT_TOOLS,
	...BRAZILIAN_TOOLS,
	...MERCOSUR_TOOLS,
	...DATABASE_TOOLS,
	...INFRASTRUCTURE_TOOLS,
	...FRONTEND_TOOLS,
];

export function findTools(
	query: string,
	translate: (value: TranslationKey) => string,
): readonly ToolRegistration[] {
	const normalize = (value: string): string =>
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	const words = normalize(query).trim().split(/\s+/);
	return TOOLS.filter((tool) => {
		if (!tool.available) {
			return false;
		}
		const category = CATEGORIES.find((item) => item.id === tool.category);
		const searchable = normalize(
			`${tool.id} ${translate(tool.name)} ${translate(tool.description)} ${tool.keywords} ${category ? translate(category.name) : ''}`,
		);
		return words.every((word) => searchable.includes(word));
	});
}
