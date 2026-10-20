import type { ToolRegistration } from '@app/features/tools/catalog/tool-registration';

export const SECURITY_TOOLS: readonly ToolRegistration[] = [
	{
		id: 'jwt',
		name: 'tools.jwt.jwt_decoder',
		description: 'tools.jwt.inspect_token_headers_and_claims',
		category: 'security',
		icon: 'scan',
		keywords: 'jwt token json web header claims auth',
		available: true,
		popular: true,
		loadDefinition: () => import('../security/jwt.tool').then((module) => module.definition),
	},
	{
		id: 'sha',
		name: 'tools.sha.sha_hash_generator',
		description: 'tools.sha.calculate_sha_256_and_sha_512_hashes_local',
		category: 'security',
		icon: 'shield',
		keywords: 'hash digest checksum sha256 sha512',
		available: true,
		loadDefinition: () => import('../security/sha.tool').then((module) => module.definition),
	},
	{
		id: 'hmac',
		category: 'security',
		name: 'tools.hmac.hmac_generator',
		description: 'tools.hmac.compute_hmac_sha_256_or_sha_512_with_a_sec',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/hmac.tool').then((module) => module.definition),
	},
	{
		id: 'aes',
		category: 'security',
		name: 'tools.aes.aes_encrypt_decrypt',
		description: 'tools.aes.encrypt_or_decrypt_text_with_aes_256_gcm_a',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/aes.tool').then((module) => module.definition),
	},
	{
		id: 'jwt-claims',
		category: 'security',
		name: 'tools.jwt-claims.jwt_claims_analyzer',
		description: 'tools.jwt-claims.inspect_jwt_claims_expiry_issuer_and_audie',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/jwt-claims.tool').then((module) => module.definition),
	},
	{
		id: 'pem',
		category: 'security',
		name: 'tools.pem.pem_decoder',
		description: 'tools.pem.inspect_pem_blocks_and_their_encoded_data',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/pem.tool').then((module) => module.definition),
	},
	{
		id: 'pem-jwk',
		category: 'security',
		name: 'tools.pem-jwk.pem_to_jwk',
		description: 'tools.pem-jwk.convert_a_pem_certificate_or_key_to_jwk',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/pem-jwk.tool').then((module) => module.definition),
	},
	{
		id: 'asn1',
		category: 'security',
		name: 'tools.asn1.asn_1_decoder',
		description: 'tools.asn1.explore_the_asn_1_structure_of_base64_der_',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/asn1.tool').then((module) => module.definition),
	},
	{
		id: 'x509',
		category: 'security',
		name: 'tools.x509.x_509_certificate_viewer',
		description: 'tools.x509.read_an_x_509_certificate_s_issuer_validit',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/x509.tool').then((module) => module.definition),
	},
	{
		id: 'csr',
		category: 'security',
		name: 'tools.csr.csr_decoder',
		description: 'tools.csr.inspect_a_csr_request_and_check_its_signat',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/csr.tool').then((module) => module.definition),
	},
	{
		id: 'certificate-chain',
		category: 'security',
		name: 'tools.certificate-chain.certificate_chain_inspector',
		description: 'tools.certificate-chain.check_signatures_between_certificates_in_a',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/certificate-chain.tool').then((module) => module.definition),
	},
	{
		id: 'file-hash',
		category: 'security',
		name: 'tools.file-hash.file_hash_calculator',
		description: 'tools.file-hash.compute_a_file_hash_without_uploading_the_',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/file-hash.tool').then((module) => module.definition),
	},
	{
		id: 'csp',
		category: 'security',
		name: 'tools.csp.csp_generator',
		description: 'tools.csp.build_a_csp_policy_from_allowed_resource_o',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/csp.tool').then((module) => module.definition),
	},
	{
		id: 'sri',
		category: 'security',
		name: 'tools.sri.sri_hash_generator',
		description: 'tools.sri.generate_an_integrity_attribute_from_a_fil',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/sri.tool').then((module) => module.definition),
	},
	{
		id: 'webhook-signature',
		category: 'security',
		name: 'tools.webhook-signature.webhook_signature_generator',
		description: 'tools.webhook-signature.generate_webhook_hmac_signatures_for_githu',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/webhook-signature.tool').then((module) => module.definition),
	},
	{
		id: 'p12-explorer',
		category: 'security',
		name: 'tools.p12-explorer.pkcs_12_p12_explorer',
		description: 'tools.p12-explorer.open_a_password_protected_p12_file_and_ins',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/p12-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'p7b-bundle',
		category: 'security',
		name: 'tools.p7b-bundle.p7b_certificate_bundle_builder',
		description: 'tools.p7b-bundle.bundle_pem_certificates_into_an_unsigned_p',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () => import('../security/p7b-bundle.tool').then((module) => module.definition),
	},
	{
		id: 'p7b-explorer',
		category: 'security',
		name: 'tools.p7b-explorer.p7b_certificate_bundle_explorer',
		description: 'tools.p7b-explorer.list_the_certificates_contained_in_a_p7b_b',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/p7b-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'crl-explorer',
		category: 'security',
		name: 'tools.crl-explorer.crl_explorer',
		description: 'tools.crl-explorer.read_a_certificate_revocation_list_s_struc',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/crl-explorer.tool').then((module) => module.definition),
	},
	{
		id: 'timestamp-request',
		category: 'security',
		name: 'tools.timestamp-request.timestamp_request_generator',
		description: 'tools.timestamp-request.create_an_rfc_3161_request_to_send_to_a_ts',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/timestamp-request.tool').then((module) => module.definition),
	},
	{
		id: 'tsr-decoder',
		category: 'security',
		name: 'tools.tsr-decoder.tsr_response_decoder',
		description: 'tools.tsr-decoder.inspect_the_status_and_structure_of_a_tsr_',
		icon: 'shield',
		keywords: '',
		available: true,

		loadDefinition: () =>
			import('../security/tsr-decoder.tool').then((module) => module.definition),
	},
];
