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

export {
	CATEGORIES,
	PDF_TOOL_GROUPS,
	REGIONAL_TOOL_GROUPS,
} from '@app/features/tools/catalog/categories';

const toolIcons: Readonly<Record<string, string>> = {
	'json-formatter': 'braces',
	'json-minifier': 'compress',
	'json-diff': 'diff',
	'json-yaml': 'arrows',
	'json-validator': 'check',
	'json-viewer': 'eye',
	jsonpath: 'scan',
	'json-schema': 'document',
	'json-typescript': 'file-code',
	'json-csharp-interface': 'braces',
	'json-csv': 'table',
	'csv-json': 'table',
	'json-to-yaml': 'arrows',
	'yaml-to-json': 'arrows',
	'json-xml': 'document',
	'json-sql': 'database',
	'schema-faker': 'spark',
	html: 'code',
	'html-entities': 'code',
	unicode: 'type',
	hex: 'hash',
	'base-converter': 'hash',
	date: 'calendar',
	timezone: 'globe',
	'text-binary': 'file-code',
	'binary-text': 'file-code',
	markdown: 'document',
	punycode: 'globe',
	'sql-formatter': 'database',
	'xml-formatter': 'document',
	'xml-validator': 'check',
	'yaml-formatter': 'document',
	'cron-builder': 'calendar',
	'cron-parser': 'clock',
	'http-status': 'shield',
	'http-headers': 'document',
	'url-parser': 'link',
	curl: 'terminal',
	'json-patch': 'diff',
	openapi: 'network',
	'openapi-diff': 'diff',
	graphql: 'braces',
	semver: 'hash',
	'json-csharp': 'file-code',
	'dotnet-ticks': 'clock',
	'guid-formatter': 'fingerprint',
	'csharp-escape': 'code',
	'pascal-camel': 'type',
	'dns-lookup': 'globe',
	ipv4: 'network',
	cidr: 'network',
	ipv6: 'network',
	chmod: 'lock',
	'docker-compose': 'box',
	'compose-viewer': 'eye',
	'env-diff': 'diff',
	'env-validator': 'check',
	gitignore: 'document',
	kubernetes: 'network',
	'log-parser': 'list',
	'basic-auth': 'lock',
	'password-strength': 'shield',
	otp: 'key',
	'user-agent': 'terminal',
	'meta-tags': 'document',
	'mime-types': 'file-code',
	nato: 'users',
	percentage: 'hash',
	'random-number': 'spark',
	'rsa-keypair': 'key',
	'math-evaluator': 'hash',
	'rule-of-three': 'hash',
	temperature: 'sun',
	'dotnet-appsettings': 'braces',
	'api-proxy': 'network',
	bcrypt: 'lock',
	bip39: 'key',
	'toml-converter': 'arrows',
	'html-editor': 'code',
	'device-info': 'box',
	keycode: 'key',
	'safe-link': 'shield',
	color: 'palette',
	gradient: 'palette',
	'box-shadow': 'grid',
	clamp: 'arrows',
	flexbox: 'grid',
	'css-grid': 'grid',
	contrast: 'eye',
	favicon: 'image',
};

const iconForCategory: Readonly<Record<string, string>> = {
	json: 'braces',
	converters: 'arrows',
	development: 'terminal',
	database: 'database',
	infrastructure: 'network',
	frontend: 'palette',
	utilities: 'spark',
	text: 'type',
	security: 'shield',
	'country-data': 'document',
	pdf: 'document',
};

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
].map((tool) => {
	const icon = toolIcons[tool.id] ?? tool.icon;
	return {
		...tool,
		icon: icon === 'code' ? (iconForCategory[tool.category] ?? 'document') : icon,
	};
});

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
