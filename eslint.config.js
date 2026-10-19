// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs as _configs } from 'typescript-eslint';
import { configs as __configs, processInlineTemplates } from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
	eslintConfigPrettier,
	{
		files: ['**/*.ts'],
		extends: [
			eslint.configs.recommended,
			_configs.recommended,
			_configs.stylistic,
			__configs.tsRecommended,
		],
		processor: processInlineTemplates,
		rules: {
			curly: ['error', 'all'],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^\\.{1,2}/',
							message: 'Use the @app/* alias for local imports.',
						},
					],
				},
			],
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		extends: [__configs.templateRecommended, __configs.templateAccessibility],
		rules: {},
	},
]);
