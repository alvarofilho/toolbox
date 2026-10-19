import 'reflect-metadata';

import * as asn1js from 'asn1js';

import { AlgorithmIdentifier, MessageImprint, TimeStampReq } from 'pkijs';

import { tool, result } from '@app/features/tools/_shared/definition';

import { source } from '@app/features/tools/_shared/controls';

import { field, text } from '@app/core/models/tool';

import { utf8, bytesHex, bytesBase64 } from '@app/features/tools/_shared/bytes';

export const definition = tool(
	'timestamp-request',
	[source],
	async (v) => {
		const value = field(v, 'input');
		if (!value) {
			throw new Error('Informe o conteúdo a resumir / Enter content to hash');
		}
		const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(value)));
		const messageImprint = new MessageImprint({
			hashAlgorithm: new AlgorithmIdentifier({
				algorithmId: '2.16.840.1.101.3.4.2.1',
				algorithmParams: new asn1js.Null(),
			}),
			hashedMessage: new asn1js.OctetString({ valueHex: digest.buffer }),
		});
		const randomNonce = crypto.getRandomValues(new Uint8Array(8));
		const nonceBytes =
			randomNonce[0] !== undefined && randomNonce[0] >= 0x80
				? new Uint8Array([0, ...randomNonce])
				: randomNonce;
		const request = new TimeStampReq({
			version: 1,
			messageImprint,
			nonce: new asn1js.Integer({ valueHex: nonceBytes.buffer }),
			certReq: true,
		});
		const der = new Uint8Array(request.toSchema().toBER(false));
		return result(
			{
				algorithm: 'SHA-256',
				digest: bytesHex(digest),
				requestBase64: bytesBase64(der),
				requestPem: `-----BEGIN TSQ-----\n${
					bytesBase64(der)
						.match(/.{1,64}/g)
						?.join('\n') ?? ''
				}\n-----END TSQ-----`,
			},
			'timestamp-request.json',
		);
	},
	undefined,
	text(
		'Gera uma solicitação RFC 3161 local. Envie-a ao serviço TSA da sua organização para obter a resposta assinada.',
		'Generates a local RFC 3161 request. Send it to your organization’s TSA to obtain a signed response.',
		undefined,
		'tools.timestamp-request',
	),
);
