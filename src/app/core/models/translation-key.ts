const disambiguatedSlugs: Readonly<Record<string, string>> = {
	'Added:': 'added_colon',
	'Favorite:': 'favorite_colon',
	'JSON → YAML': 'json_to_yaml_arrow',
	Lowercase: 'lowercase_title',
	'NF-e Access Key': 'nfe_access_key_title',
	'NF-e access key': 'nfe_access_key',
	'Private by default. Inputs and results are never uploaded or saved automatically.':
		'privacy_notice_complete',
	'Private by default. Inputs and results are never uploaded or saved': 'privacy_notice_short',
	'Processing…': 'processing_ellipsis',
	'Removed:': 'removed_colon',
	Result: 'result_title',
	Run: 'run_title',
	'Search tools and actions…': 'search_tools_and_actions_ellipsis',
	'Synthetic test data. Valid check digits do not prove registration.':
		'synthetic_test_data_notice_short',
	'Synthetic test data. Valid check digits do not prove registration. Emails use example.com. State is an independent field; test phone area code is 11.':
		'synthetic_test_data_notice_complete',
	To: 'to_title',
	'Unix · seconds': 'unix_seconds_with_separator',
	Uppercase: 'uppercase_title',
};

export type TranslationNamespace = 'common' | 'categories' | `tools.${string}`;

export function translationKey(source: string, namespace: TranslationNamespace = 'common'): string {
	const slug = source
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '')
		.slice(0, 42);
	return `${namespace}.${(disambiguatedSlugs[source] ?? slug) || 'text'}`;
}
