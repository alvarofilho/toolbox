import { validatePisPasep, PIS_PASEP_GOLDEN_PRIMARY } from '@br-validators/core/pis-pasep';
import { validateCnh, CNH_GOLDEN_PRIMARY } from '@br-validators/core/cnh';
import {
	validateTituloEleitor,
	TITULO_ELEITOR_GOLDEN_PRIMARY,
} from '@br-validators/core/titulo-eleitor';
import {
	validateInscricaoEstadual,
	IE_SUPPORTED_UFS,
} from '@br-validators/core/inscricao-estadual';
import {
	validateNfeChave,
	computeNfeChaveCheckDigit,
	NFE_CHAVE_GOLDEN_PRIMARY,
} from '@br-validators/core/nfe-chave';
import {
	buildStaticPixBrCode,
	validateBrCode,
	BRCODE_GOLDEN_STATIC_EMAIL,
} from '@br-validators/core/brcode';
import {
	validateBoleto,
	convertLinhaToCodigoBarras,
	convertCodigoBarrasToLinhaDigitavel,
	BOLETO_GOLDEN_LINHA_STRIPPED,
} from '@br-validators/core/boleto';
import { generateDocument } from '@app/shared/utils/documents';
import { randomInt } from '@app/shared/utils/random';
import { synthetic } from '@app/features/tools/controls';
import {
	tool,
	source,
	input,
	select,
	mode,
	field,
	result,
	text,
	number,
	boundedNumber,
} from '@app/features/tools/extended/common';

const uf = select(
	'uf',
	'UF',
	'State',
	IE_SUPPORTED_UFS.map((s) => [s, s, s]),
	'SP',
);
function digits(size: number): string {
	return Array.from({ length: size }, () => String(randomInt(10))).join('');
}

function generateByValidation(size: number, validate: (value: string) => { ok: boolean }): string {
	for (let attempt = 0; attempt < 1000; attempt++) {
		const candidate = digits(size);
		if (validate(candidate).ok) {
			return candidate;
		}
	}
	throw new Error('Não foi possível gerar um número de teste / Could not generate a test number');
}

function validRenavam(value: string): boolean {
	const clean = value.replace(/\D/g, '');
	if (!/^\d{11}$/.test(clean) || /^(.)\1+$/.test(clean)) {
		return false;
	}
	let sum = 0;
	let weight = 2;
	for (let index = 9; index >= 0; index--) {
		sum += Number(clean[index]) * weight;
		weight = weight === 9 ? 2 : weight + 1;
	}
	const remainder = sum % 11;
	const checkDigit = remainder < 2 ? 0 : 11 - remainder;
	return checkDigit === Number(clean[10]);
}

function makeRenavam(): string {
	const base = digits(10);
	for (let check = 0; check < 10; check++) {
		const candidate = `${base}${check}`;
		if (validRenavam(candidate)) {
			return candidate;
		}
	}
	throw new Error('Falha ao calcular RENAVAM / RENAVAM calculation failed');
}

function luhnValid(value: string): boolean {
	const digitsOnly = value.replace(/\D/g, '');
	if (!/^\d{13,19}$/.test(digitsOnly)) {
		return false;
	}
	let sum = 0;
	let double = false;
	for (let index = digitsOnly.length - 1; index >= 0; index--) {
		let digit = Number(digitsOnly[index]);
		if (double) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}
		sum += digit;
		double = !double;
	}
	return sum % 10 === 0;
}

export const definitions = [
	tool(
		'pis-generator',
		[number('count', 'Quantidade', 'Count', 5, 1, 100)],
		(v) => {
			const count = boundedNumber(field(v, 'count'), 1, 100);
			return result(
				Array.from({ length: count }, () => generateByValidation(11, validatePisPasep)),
				'pis-test-data.txt',
			);
		},
		undefined,
		synthetic,
	),
	tool(
		'cnh-generator',
		[number('count', 'Quantidade', 'Count', 5, 1, 100)],
		(v) => {
			const count = boundedNumber(field(v, 'count'), 1, 100);
			return result(
				Array.from({ length: count }, () => generateByValidation(11, validateCnh)),
				'cnh-test-data.txt',
			);
		},
		undefined,
		synthetic,
	),
	tool(
		'voter-generator',
		[number('count', 'Quantidade', 'Count', 5, 1, 100)],
		(v) => {
			const count = boundedNumber(field(v, 'count'), 1, 100);
			return result(
				Array.from({ length: count }, () => generateByValidation(12, validateTituloEleitor)),
				'voter-test-data.txt',
			);
		},
		undefined,
		synthetic,
	),
	tool(
		'rg-generator',
		[number('count', 'Quantidade', 'Count', 5, 1, 100)],
		(v) => {
			const count = boundedNumber(field(v, 'count'), 1, 100);
			return result(
				Array.from({ length: count }, () => ({
					value: digits(9),
					validation: 'format-only; RG rules vary by state and issuer',
				})),
				'rg-test-data.json',
			);
		},
		undefined,
		text(
			'RG não possui um único algoritmo nacional de validação; os valores são fictícios e apenas formatados.',
			'RG does not have one nationwide validation algorithm; values are fictional and format-only.',
		),
	),
	tool(
		'ie-generator',
		[uf, number('count', 'Quantidade', 'Count', 1, 1, 10)],
		(v) => {
			const state = IE_SUPPORTED_UFS.find((s) => s === field(v, 'uf'));
			if (!state) {
				throw new Error('UF inválida / Invalid state');
			}
			const count = boundedNumber(field(v, 'count'), 1, 10);
			const values = Array.from({ length: count }, () => {
				for (let attempt = 0; attempt < 2000; attempt++) {
					const candidate = digits(8 + randomInt(7));
					if (validateInscricaoEstadual(candidate, { uf: state }).ok) {
						return candidate;
					}
				}
				throw new Error(
					`Não foi possível gerar IE para ${state} / Could not generate state registration`,
				);
			});
			return result(values, 'inscricoes-estaduais-test.txt');
		},
		undefined,
		synthetic,
	),
	tool(
		'renavam',
		[mode(['generate', 'validate']), source],
		(v) => {
			if (field(v, 'mode') === 'generate') {
				return result({ value: makeRenavam(), validation: 'check-digit' });
			}
			return result({
				value: field(v, 'input'),
				valid: validRenavam(field(v, 'input')),
				scope: 'mathematical check only; no vehicle registry lookup',
			});
		},
		undefined,
		synthetic,
	),
	tool(
		'plate',
		[mode(['generate', 'validate']), source],
		(v) => {
			if (field(v, 'mode') === 'generate') {
				const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				const legacy = `${Array.from({ length: 3 }, () => letters[randomInt(letters.length)]).join('')}${digits(4)}`;
				const mercosul = `${legacy.slice(0, 3)}${digits(1)}${letters[randomInt(letters.length)]}${digits(2)}`;
				return result({ legacy, mercosul, validation: 'format-only' });
			}
			const value = field(v, 'input')
				.toUpperCase()
				.replace(/[^A-Z0-9]/g, '');
			return result({
				value,
				validFormat: /^[A-Z]{3}\d{4}$/.test(value) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(value),
				validation: 'format-only',
			});
		},
		undefined,
		synthetic,
	),
	tool(
		'credit-card',
		[mode(['generate', 'validate']), source],
		(v) => {
			if (field(v, 'mode') === 'validate') {
				const value = field(v, 'input');
				return result({
					value,
					validLuhn: luhnValid(value),
					scope: 'checksum only; not an issued card or payment credential',
				});
			}
			const stem = `${['4', '5'][randomInt(2)]}${digits(14)}`;
			const value = Array.from({ length: 10 }, (_, digit) => `${stem}${digit}`).find(luhnValid);
			if (!value) {
				throw new Error('Falha ao gerar cartão de teste / Could not generate test card');
			}
			return result({ value, validLuhn: true, synthetic: true });
		},
		undefined,
		synthetic,
	),
	tool(
		'bank-account',
		[
			select('bank', 'Banco', 'Bank', [
				['001', 'Banco do Brasil', 'Banco do Brasil'],
				['033', 'Santander', 'Santander'],
				['104', 'Caixa', 'Caixa'],
				['237', 'Bradesco', 'Bradesco'],
				['341', 'Itaú', 'Itaú'],
			]),
			number('count', 'Quantidade', 'Count', 5, 1, 100),
		],
		(v) => {
			const count = boundedNumber(field(v, 'count'), 1, 100);
			return result(
				Array.from({ length: count }, () => ({
					bankCode: field(v, 'bank'),
					branch: digits(4),
					account: `${digits(8)}-${randomInt(10)}`,
					validation: 'synthetic format; bank-specific check digit not validated',
				})),
				'bank-accounts-test.json',
			);
		},
		undefined,
		synthetic,
	),
	tool(
		'certificate-number',
		[number('count', 'Quantidade', 'Count', 5, 1, 100)],
		(v) =>
			result(
				Array.from({ length: boundedNumber(field(v, 'count'), 1, 100) }, () => ({
					recordNumber: `${digits(6)}.${digits(2)}.${digits(4)}.${digits(2)}.${digits(2)}.${digits(4)}.${digits(2)}.${digits(6)}`,
					validation: 'format-only; not registered in a civil registry',
				})),
				'certificate-test-data.json',
			),
		undefined,
		synthetic,
	),
	tool(
		'pis',
		[source],
		(v) => result(validatePisPasep(field(v, 'input'))),
		{ input: PIS_PASEP_GOLDEN_PRIMARY },
		synthetic,
	),
	tool(
		'cnh',
		[source],
		(v) => result(validateCnh(field(v, 'input'))),
		{ input: CNH_GOLDEN_PRIMARY },
		synthetic,
	),
	tool(
		'voter',
		[source],
		(v) => result(validateTituloEleitor(field(v, 'input'))),
		{ input: TITULO_ELEITOR_GOLDEN_PRIMARY },
		synthetic,
	),
	tool(
		'ie',
		[source, uf],
		(v) => {
			const state = IE_SUPPORTED_UFS.find((s) => s === field(v, 'uf'));
			if (!state) {
				throw new Error('UF inválida / Invalid state');
			}
			return result(validateInscricaoEstadual(field(v, 'input'), { uf: state }));
		},
		{ input: '110.042.490.114', uf: 'SP' },
		synthetic,
	),
	tool(
		'nfe',
		[source, mode(['validate', 'generate'])],
		(v) => {
			if (field(v, 'mode') === 'validate') {
				return result(validateNfeChave(field(v, 'input')));
			}
			const base =
				field(v, 'input').replace(/\s/g, '') ||
				`352601${generateDocument('cnpj').replace(/\D/g, '')}55001${String(randomInt(999999999) + 1).padStart(9, '0')}1${String(randomInt(100000000)).padStart(8, '0')}`;
			if (!/^\d{43}$/.test(base)) {
				throw new Error(
					'Para gerar, deixe vazio ou informe os 43 dígitos sem DV / For generation leave empty or enter 43 digits without check digit',
				);
			}
			const key = base + String(computeNfeChaveCheckDigit(base));
			const validation = validateNfeChave(key);
			if (!validation.ok) {
				throw new Error(JSON.stringify(validation));
			}
			return result({ synthetic: true, key, validation });
		},
		{ input: NFE_CHAVE_GOLDEN_PRIMARY, mode: 'validate' },
		synthetic,
	),
	tool(
		'pix',
		[
			source,
			mode(['decode', 'generate']),
			input('key', 'Chave PIX', 'PIX key', 'teste@example.com', 'text'),
			input('name', 'Nome do recebedor', 'Merchant name', 'DADOS DE TESTE', 'text'),
			input('city', 'Cidade', 'City', 'SAO PAULO', 'text'),
			input(
				'amount',
				'Valor (opcional; ponto decimal)',
				'Amount (optional; decimal point)',
				'',
				'text',
			),
			input('txid', 'Identificador (TXID)', 'Transaction ID', '***', 'text'),
		],
		(v) => {
			if (field(v, 'mode') === 'decode') {
				return result(validateBrCode(field(v, 'input')));
			}
			const payload = buildStaticPixBrCode({
				pixKey: field(v, 'key'),
				merchantName: field(v, 'name'),
				merchantCity: field(v, 'city'),
				amount: field(v, 'amount') || undefined,
				txid: field(v, 'txid'),
			});
			const validation = validateBrCode(payload);
			if (!validation.ok) {
				throw new Error(JSON.stringify(validation));
			}
			return result({ payload, validation });
		},
		{ input: BRCODE_GOLDEN_STATIC_EMAIL },
		text(
			'Gera ou inspeciona um payload PIX estático e seu CRC. Não consulta a chave nem confirma titularidade ou pagamento.',
			'Generates or inspects a static PIX payload and CRC. Does not look up keys or confirm ownership or payment.',
		),
	),
	tool(
		'boleto',
		[source, mode(['validate', 'barcode', 'line'])],
		(v) =>
			result(
				field(v, 'mode') === 'barcode'
					? convertLinhaToCodigoBarras(field(v, 'input'))
					: field(v, 'mode') === 'line'
						? convertCodigoBarrasToLinhaDigitavel(field(v, 'input'))
						: validateBoleto(field(v, 'input')),
			),
		{ input: BOLETO_GOLDEN_LINHA_STRIPPED },
		text(
			'Validação estrutural e conversão local. Não confirma beneficiário, cobrança ou pagamento.',
			'Local structural validation and conversion. Does not confirm beneficiary, debt or payment.',
		),
	),
	tool(
		'document-mask',
		[
			source,
			select(
				'document',
				'Documento',
				'Document',
				['CPF', 'CNPJ', 'CEP', 'Telefone', 'PIS', 'CNH', 'Título de Eleitor', 'NF-e'].map((s) => [
					s,
					s,
					s,
				]),
			),
			mode(['format', 'strip']),
		],
		(v) => {
			const kind = field(v, 'document');
			const s = field(v, 'input')
				.replace(kind === 'CNPJ' ? /[^\dA-Za-z]/g : /\D/g, '')
				.toUpperCase();
			const masks: Record<string, string> = {
				CPF: '###.###.###-##',
				CNPJ: '##.###.###/####-##',
				CEP: '#####-###',
				Telefone: s.length === 10 ? '(##) ####-####' : '(##) #####-####',
				PIS: '###.#####.##-#',
				CNH: '###########',
				'Título de Eleitor': '#### #### ####',
				'NF-e': '#### #### #### #### #### #### #### #### #### #### ####',
			};
			const mask = masks[kind];
			if (!mask || (mask.match(/#/g)?.length ?? 0) !== s.length) {
				throw new Error('Quantidade de caracteres inválida / Invalid character count');
			}
			let i = 0;
			return result(
				field(v, 'mode') === 'strip' ? s : mask.replace(/#/g, () => s[i++]),
				'document.txt',
			);
		},
		{ input: '52998224725', document: 'CPF' },
		synthetic,
	),
];
