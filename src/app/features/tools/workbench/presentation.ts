import {
	type ToolControl,
	type TranslationKey,
	type ToolDefinition,
	type ToolInfo,
	type ToolValues,
} from '@app/core/models/tool';

// Execution is opt-in: generators, crypto, file operations and expensive parsers stay manual.
const automatic = new Set([
	'base64',
	'url',
	'case',
	'timestamp',
	'json-formatter',
	'json-minifier',
	'json-validator',
	'html-entities',
	'unicode',
	'hex',
	'base-converter',
	'date',
	'timezone',
	'text-binary',
	'binary-text',
	'punycode',
	'word-count',
	'dedupe-lines',
	'sort-lines',
	'slug',
	'percentage',
	'rule-of-three',
	'temperature',
	'color',
	'gradient',
	'box-shadow',
	'clamp',
	'flexbox',
	'css-grid',
	'contrast',
	'guid-formatter',
	'pascal-camel',
	'csharp-escape',
]);

type InputPresentation = readonly [
	TranslationKey,
	ToolControl['type']?,
	TranslationKey?,
	ToolControl['inputMode']?,
];
const actions: Readonly<Record<string, TranslationKey>> = {
	qr: 'common.generate_qr_code',
	person: 'common.generate_people',
	company: 'common.generate_companies',
	address: 'common.generate_addresses',
	email: 'common.generate_emails',
	phone: 'common.generate_phone_numbers',
	ulid: 'common.generate_ulids',
	guid: 'common.generate_guids',
	'json-viewer': 'common.explore_json',
	jsonpath: 'common.extract_values',
	'json-typescript': 'common.generate_typescript_types',
	'json-csharp': 'common.generate_c_classes',
	'json-csharp-interface': 'common.generate_c_interfaces',
	'ddl-csharp': 'common.generate_c_classes',
	'sql-insert': 'common.generate_sql_insert',
	'json-sql': 'common.generate_sql_insert',
	hmac: 'common.calculate_hmac',
	'file-hash': 'common.hash_file',
	sri: 'common.generate_integrity_attribute',
	'p12-explorer': 'common.open_p12',
	'p7b-bundle': 'common.build_p7b_bundle',
	'webhook-signature': 'common.generate_signature',
	'timestamp-request': 'common.create_request',
	'http-status': 'common.look_up_http_status',
	'dns-lookup': 'tools.dns-lookup.dns_lookup',
	'http-headers': 'common.inspect_headers',
	'basic-auth': 'common.generate_basic_auth',
	'password-strength': 'common.analyze_password',
	'user-agent': 'common.inspect_user_agent',
	'mime-types': 'common.look_up_mime_type',
	percentage: 'common.calculate_percentage',
	'rule-of-three': 'common.calculate_proportion',
	'math-evaluator': 'common.evaluate_expression',
	'device-info': 'common.inspect_device',
	keycode: 'common.inspect_key',
	'connection-string': 'common.build_connection_string',
	'svg-optimizer': 'common.optimize_svg',
	'image-converter': 'common.convert_image',
	'image-compressor': 'common.compress_image',
	'image-exif': 'common.read_exif_metadata',
	'pdf-metadata': 'common.read_pdf_metadata',
	'file-signature': 'common.identify_format',
	favicon: 'common.generate_icons',
};
const inputs: Readonly<Record<string, InputPresentation>> = {
	'json-formatter': ['common.input_json'],
	'json-minifier': ['common.input_json'],
	'json-validator': ['common.json_to_validate'],
	'json-viewer': ['common.json_to_explore'],
	jsonpath: ['common.json_document'],
	'json-schema': ['common.json_document'],
	'schema-faker': ['common.json_schema'],
	'json-typescript': ['common.json_object_or_array'],
	'json-csharp': ['common.json_object'],
	'json-csharp-interface': ['common.json_object'],
	'json-csv': ['common.json_array_of_objects'],
	'csv-json': ['common.csv_with_headers'],
	'json-to-yaml': ['common.input_json'],
	'yaml-to-json': ['common.input_yaml'],
	'json-xml': ['common.json_object'],
	'json-sql': ['common.json_array_of_objects'],
	'sql-insert': ['common.json_array_of_objects'],
	jwt: ['common.jwt_token', 'textarea', 'common.eyj'],
	'jwt-claims': ['common.jwt_token', 'textarea', 'common.eyj'],
	pem: ['common.pem_content', 'textarea', 'common.begin_certificate'],
	'pem-jwk': ['common.pem_certificate_or_key'],
	asn1: ['common.base64_der'],
	x509: ['common.pem_certificate'],
	csr: ['common.pem_csr_request'],
	'certificate-chain': ['common.pem_certificate_chain'],
	'p7b-bundle': ['common.pem_certificates'],
	'p7b-explorer': ['common.p7b_bundle_as_base64_or_pem'],
	'crl-explorer': ['common.crl_as_base64_or_pem'],
	'timestamp-request': ['common.text_to_timestamp'],
	'tsr-decoder': ['common.base64_tsr_response'],
	cpf: ['common.cpf_to_validate', 'text', 'common.529_982_247_25', 'numeric'],
	cnpj: ['common.cnpj_to_validate', 'text', 'common.12_abc_345_01de_35'],
	pis: ['common.pis_pasep', 'text', undefined, 'numeric'],
	cnh: ['common.cnh', 'text', undefined, 'numeric'],
	voter: ['common.voter_registration', 'text', undefined, 'numeric'],
	ie: ['common.state_registration', 'text'],
	nfe: ['common.nfe_access_key', 'text', undefined, 'numeric'],
	renavam: ['common.renavam_to_validate', 'text', undefined, 'numeric'],
	plate: ['common.plate_to_validate', 'text', 'common.abc1d23'],
	'credit-card': ['common.test_card_number', 'text', undefined, 'numeric'],
	pix: ['common.pix_copy_and_paste_code'],
	boleto: ['common.payment_line_or_barcode', 'text', undefined, 'numeric'],
	'document-mask': ['common.number_to_format', 'text'],
	color: ['common.css_color', 'text', 'common.285d45'],
	'base-converter': ['common.number_in_the_input_base', 'text', 'common.255'],
	date: ['common.date_to_convert', 'text', 'common.2026_10_19'],
	chmod: ['common.octal_permissions', 'text', 'common.755', 'numeric'],
	ipv4: ['common.ipv4_cidr_address', 'text', 'common.192_168_1_10_24'],
	cidr: ['common.cidr_block', 'text', 'common.10_0_0_0_16'],
	ipv6: ['common.ipv6_cidr_address', 'text', 'common.2001_db8_1_64'],
	semver: ['common.original_version', 'text', 'common.1_2_3'],
	'password-strength': ['common.test_password', 'password'],
	'math-evaluator': ['common.math_expression', 'text', 'common.10_5_3'],
	'mime-types': ['common.extension_or_mime_type', 'text', 'common.application_json'],
	'url-parser': ['common.url_to_inspect', 'text', 'common.https_example_com_path_q_1', 'url'],
	'safe-link': ['common.protected_link', 'text', undefined, 'url'],
	'cron-parser': ['common.cron_expression', 'text', 'common.15'],
	'ddl-csharp': ['common.postgresql_create_table'],
	'sql-schema-diff': ['common.original_postgresql_schema'],
	'json-patch': ['common.original_json_document'],
	'env-diff': ['common.original_env_file'],
	'openapi-diff': ['common.original_openapi'],
	openapi: ['common.openapi_or_swagger_document'],
	markdown: ['common.markdown_content'],
	'html-editor': ['common.html_code'],
	qr: ['common.qr_code_text_or_url'],
};

type Conditions = Readonly<Record<string, ToolControl['when']>>;
const mode = (values: readonly string[]): ToolControl['when'] => ({ key: 'mode', values });
const conditions: Readonly<Record<string, Conditions>> = {
	cpf: { input: mode(['validate']), count: mode(['generate']), format: mode(['generate']) },
	cnpj: {
		input: mode(['validate']),
		count: mode(['generate']),
		format: mode(['generate']),
		alpha: mode(['generate']),
	},
	pix: {
		input: mode(['decode']),
		key: mode(['generate']),
		name: mode(['generate']),
		city: mode(['generate']),
		amount: mode(['generate']),
		txid: mode(['generate']),
	},
	renavam: { input: mode(['validate']) },
	plate: { input: mode(['validate']) },
	'credit-card': { input: mode(['validate']) },
	otp: { code: mode(['verify']) },
	bcrypt: { hash: mode(['verify']), cost: mode(['hash']) },
	bip39: {
		words: mode(['generate']),
		mnemonic: mode(['validate']),
		passphrase: mode(['generate']),
	},
	'pdf-pages': {
		pages: mode(['extract', 'split', 'reorder', 'delete', 'rotate']),
		rotation: mode(['rotate']),
	},
	'connection-string': Object.fromEntries(
		['host', 'port', 'user', 'password', 'tls'].map((key) => [
			key,
			{ key: 'provider', values: ['sqlserver', 'postgresql', 'mysql'] },
		]),
	),
	'webhook-signature': { timestamp: { key: 'provider', values: ['stripe'] } },
	'image-compressor': { quality: { key: 'format', values: ['image/webp', 'image/jpeg'] } },
	'image-converter': { quality: { key: 'format', values: ['image/webp', 'image/jpeg'] } },
};

export function visibleControl(control: ToolControl, values: ToolValues): boolean {
	return !control.when || control.when.values.includes(values[control.when.key] ?? '');
}

export function presentDefinition(definition: ToolDefinition, info: ToolInfo): ToolDefinition {
	const source = inputs[definition.id];
	const controls = definition.controls.map((control): ToolControl => {
		const description = control.key === 'input' ? source : undefined;
		const decimal =
			['temperature', 'percentage', 'rule-of-three', 'clamp'].includes(definition.id) &&
			control.type === 'number' &&
			!['minWidth', 'maxWidth'].includes(control.key);
		const second =
			control.key === 'second' && definition.id !== 'text-diff' && definition.id !== 'json-diff';
		return {
			...control,
			...(description
				? {
						label: control.label === 'common.input' ? description[0] : control.label,
						type: description[1] ?? control.type,
						placeholder: description[2],
						inputMode: description[3],
					}
				: {}),
			...(second
				? {
						label: 'common.modified_version',
						...(definition.id === 'semver' ? { type: 'text' } : {}),
					}
				: {}),
			...(decimal ? { step: 'any', inputMode: 'decimal' } : {}),
			...(control.key === 'port' ||
			control.key === 'ddd' ||
			(control.key === 'code' && definition.id === 'otp')
				? { inputMode: 'numeric' }
				: {}),
			when: control.when ?? conditions[definition.id]?.[control.key],
		};
	});
	// Mode belongs before its dependent fields; stable sort preserves the incumbent order otherwise.
	const ordered = [...controls].sort((a, b) => Number(b.key === 'mode') - Number(a.key === 'mode'));
	const originalAction = definition.action;
	const action = ['common.run_title', 'common.transform', 'common.generate_result'].includes(
		originalAction,
	)
		? info.category === 'generators' ||
			info.category === 'brazilian' ||
			info.category === 'mercosur'
			? 'common.generate_data'
			: /validator|schema$/.test(definition.id)
				? 'common.validate_input'
				: /formatter|graphql/.test(definition.id)
					? 'common.format_code'
					: info.category === 'frontend'
						? 'common.update_preview'
						: /diff|patch|semver/.test(definition.id)
							? 'common.compare_versions'
							: /generator|seed|keypair|^csp$|^meta-tags$|^curl$|^api-proxy$|^dotnet-appsettings$|^gitignore$/.test(
										definition.id,
								  )
								? 'common.generate_result'
								: info.category === 'security'
									? 'common.inspect_input'
									: 'common.convert_input'
		: originalAction;
	return {
		...definition,
		controls: ordered,
		execution: definition.execution ?? (automatic.has(definition.id) ? 'automatic' : 'manual'),
		action: actions[definition.id] ?? action,
	};
}
