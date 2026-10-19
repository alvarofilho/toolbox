import {
	boundedNumber,
	field,
	input,
	mode,
	number,
	result,
	select,
	source,
	text,
	tool,
	preview,
} from '@app/features/tools/extended/common';
import { randomInt, randomString } from '@app/shared/utils/random';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';
import { wordlist as spanishWordlist } from '@scure/bip39/wordlists/spanish.js';
import {
	parse as parseToml,
	stringify as stringifyToml,
	type TomlTableWithoutBigInt,
	type TomlValueWithoutBigInt,
} from 'smol-toml';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import DOMPurify from 'dompurify';

const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function evaluateExpression(expression: string): number {
	if (expression.length > 256) {
		throw new Error('Expressão longa demais / Expression is too long');
	}
	const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) ?? [];
	if (tokens.join('') !== expression.replace(/\s/g, '') || tokens.length > 128) {
		throw new Error(
			'Use números e operadores +, -, *, /, ^ e parênteses / Use numbers and basic operators',
		);
	}
	let position = 0;
	let depth = 0;
	const take = () => tokens[position++];
	const expressionValue = (): number => {
		let value = term();
		while (tokens[position] === '+' || tokens[position] === '-') {
			const operator = take();
			const right = term();
			value = operator === '+' ? value + right : value - right;
		}
		return value;
	};
	const term = (): number => {
		let value = power();
		while (tokens[position] === '*' || tokens[position] === '/') {
			const operator = take();
			const right = power();
			if (operator === '/' && right === 0) {
				throw new Error('Divisão por zero / Division by zero');
			}
			value = operator === '*' ? value * right : value / right;
		}
		return value;
	};
	const power = (): number => {
		const value = primary();
		if (tokens[position] === '^') {
			take();
			return value ** unary();
		}
		return value;
	};
	const unary = (): number => {
		if (tokens[position] === '+') {
			take();
			return unary();
		}
		if (tokens[position] === '-') {
			take();
			return -unary();
		}
		return power();
	};
	const primary = (): number => {
		if (tokens[position] === '(') {
			take();
			if (++depth > 32) {
				throw new Error('Parênteses aninhados demais / Too many nested parentheses');
			}
			const value = expressionValue();
			depth--;
			if (take() !== ')') {
				throw new Error('Parênteses não fechados / Unclosed parentheses');
			}
			return value;
		}
		const token = take();
		if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
			throw new Error('Número esperado / Expected a number');
		}
		return Number(token);
	};
	if (!tokens.length) {
		throw new Error('Informe uma expressão / Enter an expression');
	}
	const value = expressionValue();
	if (position !== tokens.length || !Number.isFinite(value)) {
		throw new Error(
			'Expressão inválida ou resultado não finito / Invalid expression or non-finite result',
		);
	}
	return value;
}

function tomlValue(value: unknown): TomlValueWithoutBigInt {
	if (typeof value === 'string' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map(tomlValue);
	}
	if (typeof value === 'object' && value !== null) {
		const table: TomlTableWithoutBigInt = {};
		for (const [key, entry] of Object.entries(value)) {
			table[key] = tomlValue(entry);
		}
		return table;
	}
	throw new Error(
		'TOML não aceita null, valores não finitos ou este tipo / TOML does not support null, non-finite numbers, or this value type',
	);
}

function tomlTable(value: unknown): TomlTableWithoutBigInt {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('A raiz do TOML deve ser um objeto / TOML root must be an object');
	}
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) {
		throw new Error('A raiz do TOML deve ser um objeto simples / TOML root must be a plain object');
	}
	const table: TomlTableWithoutBigInt = {};
	for (const [key, entry] of Object.entries(value)) {
		table[key] = tomlValue(entry);
	}
	return table;
}

function base64(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function decodeBase32(value: string): Uint8Array<ArrayBuffer> {
	const clean = value.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
	if (!/^[A-Z2-7]+$/.test(clean)) {
		throw new Error('Segredo Base32 inválido / Invalid Base32 secret');
	}
	let buffer = 0;
	let bits = 0;
	const bytes: number[] = [];
	for (const char of clean) {
		buffer = (buffer << 5) | base32Chars.indexOf(char);
		bits += 5;
		if (bits >= 8) {
			bytes.push((buffer >>> (bits - 8)) & 255);
			bits -= 8;
		}
	}
	return Uint8Array.from(bytes);
}

async function totp(secret: string, timeSeconds: number): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		decodeBase32(secret),
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign'],
	);
	const counter = BigInt(Math.floor(timeSeconds / 30));
	const message = new Uint8Array(8);
	new DataView(message.buffer).setBigUint64(0, counter, false);
	const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
	const offset = digest[digest.length - 1] & 15;
	const binary =
		((digest[offset] & 127) << 24) |
		((digest[offset + 1] & 255) << 16) |
		((digest[offset + 2] & 255) << 8) |
		(digest[offset + 3] & 255);
	return String(binary % 1_000_000).padStart(6, '0');
}

const mimeByExtension: Readonly<Record<string, string>> = {
	avif: 'image/avif',
	css: 'text/css',
	csv: 'text/csv',
	gz: 'application/gzip',
	html: 'text/html',
	ico: 'image/vnd.microsoft.icon',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	js: 'text/javascript',
	json: 'application/json',
	md: 'text/markdown',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4',
	pdf: 'application/pdf',
	png: 'image/png',
	svg: 'image/svg+xml',
	tar: 'application/x-tar',
	txt: 'text/plain',
	wasm: 'application/wasm',
	webp: 'image/webp',
	xml: 'application/xml',
	yaml: 'application/yaml',
	yml: 'application/yaml',
	zip: 'application/zip',
};
const nato: Readonly<Record<string, string>> = {
	A: 'Alfa',
	B: 'Bravo',
	C: 'Charlie',
	D: 'Delta',
	E: 'Echo',
	F: 'Foxtrot',
	G: 'Golf',
	H: 'Hotel',
	I: 'India',
	J: 'Juliett',
	K: 'Kilo',
	L: 'Lima',
	M: 'Mike',
	N: 'November',
	O: 'Oscar',
	P: 'Papa',
	Q: 'Quebec',
	R: 'Romeo',
	S: 'Sierra',
	T: 'Tango',
	U: 'Uniform',
	V: 'Victor',
	W: 'Whiskey',
	X: 'X-ray',
	Y: 'Yankee',
	Z: 'Zulu',
};
const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"']/g,
		(char) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
	);

export const definitions = [
	tool(
		'basic-auth',
		[
			input('username', 'Usuário', 'Username', '', 'text'),
			input('password', 'Senha', 'Password', '', 'password'),
		],
		(v) => {
			const value = `${field(v, 'username')}:${field(v, 'password')}`;
			if (value === ':') {
				throw new Error('Informe usuário e senha / Enter a username and password');
			}
			return result({ header: `Authorization: Basic ${base64(value)}`, encoded: base64(value) });
		},
	),
	tool(
		'password-strength',
		[source],
		(v) => {
			const password = field(v, 'input');
			const classes = [
				/[a-z]/.test(password),
				/[A-Z]/.test(password),
				/\d/.test(password),
				/[^A-Za-z0-9]/.test(password),
			].filter(Boolean).length;
			const alphabetSize =
				(/[a-z]/.test(password) ? 26 : 0) +
				(/[A-Z]/.test(password) ? 26 : 0) +
				(/\d/.test(password) ? 10 : 0) +
				(/[^A-Za-z0-9]/.test(password) ? 32 : 0);
			const entropyBits = alphabetSize ? Math.round(password.length * Math.log2(alphabetSize)) : 0;
			const score = password.length < 8 ? 0 : Math.min(4, Math.floor(entropyBits / 25));
			return result({
				length: password.length,
				characterGroups: classes,
				estimatedEntropyBits: entropyBits,
				score,
				rating: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][score],
				checks: {
					longEnough: password.length >= 12,
					mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
					hasNumber: /\d/.test(password),
					hasSymbol: /[^A-Za-z0-9]/.test(password),
				},
			});
		},
		undefined,
		text(
			'Estimativa heurística local; não substitui um verificador com lista de senhas vazadas.',
			'Local heuristic estimate; it does not replace a breached-password check.',
		),
	),
	tool(
		'otp',
		[
			mode(['generate', 'verify']),
			input(
				'secret',
				'Segredo Base32 (vazio gera um)',
				'Base32 secret (blank generates one)',
				'',
				'text',
			),
			input('code', 'Código de 6 dígitos (para validar)', '6-digit code (to verify)', '', 'text'),
		],
		async (v) => {
			let secret = field(v, 'secret').trim().toUpperCase();
			if (!secret) {
				secret = randomString(32, base32Chars);
			}
			const now = Math.floor(Date.now() / 1000);
			if (field(v, 'mode') === 'verify') {
				const code = field(v, 'code');
				if (!/^\d{6}$/.test(code)) {
					throw new Error('Informe 6 dígitos / Enter 6 digits');
				}
				const matches = await Promise.all([-30, 0, 30].map((delta) => totp(secret, now + delta)));
				return result({
					valid: matches.includes(code),
					algorithm: 'TOTP / HMAC-SHA1',
					periodSeconds: 30,
					digits: 6,
				});
			}
			const code = await totp(secret, now);
			return result({
				secret,
				code,
				algorithm: 'TOTP / HMAC-SHA1',
				periodSeconds: 30,
				validForSeconds: 30 - (now % 30),
			});
		},
		undefined,
		text(
			'Guarde o segredo com segurança. O código depende do relógio do dispositivo.',
			'Keep the secret secure. The code depends on the device clock.',
		),
	),
	tool('user-agent', [source], (v) => {
		const ua = field(v, 'input');
		const browser = /Edg\//.test(ua)
			? 'Microsoft Edge'
			: /Firefox\//.test(ua)
				? 'Firefox'
				: /Chrome\//.test(ua)
					? 'Chrome'
					: /Safari\//.test(ua)
						? 'Safari'
						: 'Desconhecido';
		const os = /Windows NT/.test(ua)
			? 'Windows'
			: /Android/.test(ua)
				? 'Android'
				: /iPhone|iPad|iOS/.test(ua)
					? 'iOS'
					: /Mac OS X/.test(ua)
						? 'macOS'
						: /Linux/.test(ua)
							? 'Linux'
							: 'Desconhecido';
		const version =
			browser === 'Microsoft Edge'
				? ua.match(/Edg\/([\d.]+)/)?.[1]
				: browser === 'Firefox'
					? ua.match(/Firefox\/([\d.]+)/)?.[1]
					: browser === 'Chrome'
						? ua.match(/Chrome\/([\d.]+)/)?.[1]
						: ua.match(/Version\/([\d.]+)/)?.[1];
		return result({ browser, version: version ?? null, operatingSystem: os, raw: ua });
	}),
	tool(
		'meta-tags',
		[
			input('title', 'Título', 'Title', 'Minha página', 'text'),
			input('description', 'Descrição', 'Description', '', 'text'),
			input('url', 'URL canônica', 'Canonical URL', '', 'text'),
			input('image', 'Imagem de compartilhamento', 'Share image', '', 'text'),
		],
		(v) => {
			const title = escapeHtml(field(v, 'title'));
			const description = escapeHtml(field(v, 'description'));
			const url = escapeHtml(field(v, 'url'));
			const image = escapeHtml(field(v, 'image'));
			return result(
				`<title>${title}</title>\n<meta name="description" content="${description}">\n<link rel="canonical" href="${url}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${image}">\n<meta name="twitter:card" content="summary_large_image">`,
				'meta-tags.html',
			);
		},
	),
	tool('mime-types', [source], (v) => {
		const raw = field(v, 'input').trim().toLowerCase();
		const extension = raw.includes('.') ? (raw.split('.').pop() ?? '') : raw.replace(/^\./, '');
		const mimeType = mimeByExtension[extension];
		if (!mimeType) {
			throw new Error(
				'Extensão não encontrada no catálogo local / Extension not found in local catalog',
			);
		}
		return result({ extension, mimeType });
	}),
	tool('nato', [source], (v) =>
		result(
			Array.from(field(v, 'input').toUpperCase())
				.map((char) => nato[char] ?? (char === ' ' ? '(espaço)' : char))
				.join(' '),
		),
	),
	tool(
		'percentage',
		[
			select('operation', 'Cálculo', 'Calculation', [
				['of', 'Quanto é X% de Y?', 'What is X% of Y?'],
				['change', 'Variação percentual de X para Y', 'Percentage change from X to Y'],
				['ratio', 'X representa quantos % de Y?', 'What percent of Y is X?'],
			]),
			number('first', 'X / percentual', 'X / percentage', 10, -1_000_000_000, 1_000_000_000),
			number('second', 'Y / valor base', 'Y / base value', 200, -1_000_000_000, 1_000_000_000),
		],
		(v) => {
			const first = Number(field(v, 'first'));
			const second = Number(field(v, 'second'));
			const operation = field(v, 'operation');
			if (operation === 'of') {
				return result({ value: (first / 100) * second });
			}
			if (operation === 'change' && first === 0) {
				throw new Error('O valor inicial não pode ser zero / The initial value cannot be zero');
			}
			if (second === 0) {
				throw new Error('Y não pode ser zero / Y cannot be zero');
			}
			return result({
				value:
					operation === 'change'
						? ((second - first) / Math.abs(first)) * 100
						: (first / second) * 100,
				unit: '%',
			});
		},
	),
	tool(
		'random-number',
		[
			number('min', 'Mínimo', 'Minimum', 1, -1_000_000_000, 1_000_000_000),
			number('max', 'Máximo', 'Maximum', 100, -1_000_000_000, 1_000_000_000),
			number('count', 'Quantidade', 'Count', 1, 1, 1000),
		],
		(v) => {
			const min = Number(field(v, 'min'));
			const max = Number(field(v, 'max'));
			if (
				!Number.isSafeInteger(min) ||
				!Number.isSafeInteger(max) ||
				max < min ||
				max - min >= 0x100000000
			) {
				throw new Error('Intervalo inteiro inválido / Invalid integer range');
			}
			const length = boundedNumber(field(v, 'count'), 1, 1000);
			return result(Array.from({ length }, () => min + randomInt(max - min + 1)));
		},
	),
	tool('math-evaluator', [source], (v) => result({ value: evaluateExpression(field(v, 'input')) })),
	tool(
		'rule-of-three',
		[
			number('a', 'A', 'A', 2, -1_000_000_000, 1_000_000_000),
			number('b', 'B', 'B', 4, -1_000_000_000, 1_000_000_000),
			number('c', 'C', 'C', 3, -1_000_000_000, 1_000_000_000),
		],
		(v) => {
			const a = Number(field(v, 'a'));
			if (a === 0) {
				throw new Error('A não pode ser zero / A cannot be zero');
			}
			return result({
				x: (Number(field(v, 'b')) * Number(field(v, 'c'))) / a,
				equation: 'A/B = C/X',
			});
		},
	),
	tool(
		'temperature',
		[
			number('value', 'Temperatura', 'Temperature', 0, -1_000_000, 1_000_000),
			select('from', 'De', 'From', [
				['C', 'Celsius', 'Celsius'],
				['F', 'Fahrenheit', 'Fahrenheit'],
				['K', 'Kelvin', 'Kelvin'],
			]),
			select('to', 'Para', 'To', [
				['F', 'Fahrenheit', 'Fahrenheit'],
				['C', 'Celsius', 'Celsius'],
				['K', 'Kelvin', 'Kelvin'],
			]),
		],
		(v) => {
			const value = Number(field(v, 'value'));
			const from = field(v, 'from');
			const to = field(v, 'to');
			if (from === 'K' && value < 0) {
				throw new Error('Temperatura abaixo do zero absoluto / Temperature below absolute zero');
			}
			const celsius = from === 'C' ? value : from === 'F' ? ((value - 32) * 5) / 9 : value - 273.15;
			const converted =
				to === 'C' ? celsius : to === 'F' ? (celsius * 9) / 5 + 32 : celsius + 273.15;
			if (to === 'K' && converted < 0) {
				throw new Error('Temperatura abaixo do zero absoluto / Temperature below absolute zero');
			}
			return result({ value: converted, unit: to });
		},
	),
	tool(
		'dotnet-appsettings',
		[
			input('server', 'Servidor', 'Server', 'localhost', 'text'),
			number('port', 'Porta', 'Port', 1433, 1, 65535),
			input('database', 'Banco de dados', 'Database', 'AppDb', 'text'),
			input('username', 'Usuário', 'Username', 'app_user', 'text'),
			input('password', 'Senha', 'Password', '', 'password'),
			input('environment', 'Nome da conexão', 'Connection name', 'DefaultConnection', 'text'),
		],
		(v) => {
			const connectionName = field(v, 'environment').trim();
			if (!connectionName) {
				throw new Error('Informe o nome da conexão / Enter a connection name');
			}
			const quoteConnectionValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
			const server = quoteConnectionValue(`${field(v, 'server')},${field(v, 'port')}`);
			const database = quoteConnectionValue(field(v, 'database'));
			const username = quoteConnectionValue(field(v, 'username'));
			const password = quoteConnectionValue(field(v, 'password'));
			const settings = {
				ConnectionStrings: {
					[connectionName]: `Server=${server};Database=${database};User Id=${username};Password=${password};Encrypt=True;TrustServerCertificate=False;`,
				},
			};
			return result(settings, 'appsettings.json');
		},
		undefined,
		text(
			'Não compartilhe o arquivo se incluir uma senha real. Prefira secrets do ambiente em produção.',
			'Do not share the file if it contains a real password. Prefer environment secrets in production.',
		),
	),
	tool(
		'api-proxy',
		[
			input('target', 'URL da API', 'API URL', 'https://api.example.com', 'text'),
			input('path', 'Prefixo local', 'Local prefix', '/api', 'text'),
			select('format', 'Formato', 'Format', [
				['vite', 'Vite config', 'Vite config'],
				['nginx', 'Nginx', 'Nginx'],
			]),
		],
		(v) => {
			let target: URL;
			try {
				target = new URL(field(v, 'target'));
			} catch {
				throw new Error('URL da API inválida / Invalid API URL');
			}
			if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) {
				throw new Error(
					'Use uma URL HTTP(S) sem credenciais / Use an HTTP(S) URL without credentials',
				);
			}
			const prefix = field(v, 'path').trim();
			if (!/^\/[A-Za-z0-9/_-]*$/.test(prefix) || prefix.includes('..')) {
				throw new Error('Prefixo local inválido / Invalid local prefix');
			}
			const body =
				field(v, 'format') === 'nginx'
					? `location ${prefix}/ {\n    proxy_pass ${target.origin}/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n}`
					: `export default {\n  server: {\n    proxy: {\n      '${prefix}': {\n        target: '${target.origin}',\n        changeOrigin: true,\n        rewrite: (path) => path.replace(/^${prefix.replaceAll('/', '\\/')}/, ''),\n      },\n    },\n  },\n}`;
			return result(body, field(v, 'format') === 'nginx' ? 'api-proxy.conf' : 'vite.proxy.ts');
		},
		undefined,
		text(
			'Gera configuração para você hospedar. O navegador não consegue agir como proxy de rede sem um servidor.',
			'Generates configuration for you to host. A browser cannot act as a network proxy without a server.',
		),
	),
	tool(
		'rsa-keypair',
		[
			select('bits', 'Tamanho da chave', 'Key size', [
				['2048', '2048 bits', '2048 bits'],
				['3072', '3072 bits', '3072 bits'],
			]),
		],
		async (v) => {
			const bits = Number(field(v, 'bits'));
			if (bits !== 2048 && bits !== 3072) {
				throw new Error('Tamanho de chave não permitido / Unsupported key size');
			}
			const pair = await crypto.subtle.generateKey(
				{
					name: 'RSA-OAEP',
					modulusLength: bits,
					publicExponent: new Uint8Array([1, 0, 1]),
					hash: 'SHA-256',
				},
				true,
				['encrypt', 'decrypt'],
			);
			return result(
				{
					algorithm: 'RSA-OAEP-SHA256',
					publicKey: await crypto.subtle.exportKey('jwk', pair.publicKey),
					privateKey: await crypto.subtle.exportKey('jwk', pair.privateKey),
				},
				'rsa-keypair.json',
			);
		},
		undefined,
		text(
			'A chave privada é secreta. O processamento ocorre no navegador; guarde o arquivo com segurança.',
			'The private key is secret. Processing stays in the browser; store the file securely.',
		),
	),
	tool(
		'bcrypt',
		[
			mode(['hash', 'verify']),
			input('password', 'Senha', 'Password', '', 'password'),
			input('hash', 'Hash bcrypt (para verificar)', 'Bcrypt hash (to verify)', '', 'text'),
			select('cost', 'Custo', 'Cost', [
				['10', '10 (padrão)', '10 (default)'],
				['12', '12', '12'],
				['14', '14', '14'],
			]),
		],
		async (v) => {
			const password = field(v, 'password');
			if (!password) {
				throw new Error('Informe uma senha / Enter a password');
			}
			if (field(v, 'mode') === 'verify') {
				const hash = field(v, 'hash');
				if (!/^\$2[aby]\$\d{2}\$/.test(hash)) {
					throw new Error('Hash bcrypt inválido / Invalid bcrypt hash');
				}
				return result({ matches: await bcryptCompare(password, hash) });
			}
			const cost = Number(field(v, 'cost'));
			if (![10, 12, 14].includes(cost)) {
				throw new Error('Custo não permitido / Unsupported cost');
			}
			return result({ hash: await bcryptHash(password, cost), cost }, 'bcrypt-hash.json');
		},
		undefined,
		text(
			'A senha e o hash são processados no navegador. O custo maior demora mais.',
			'The password and hash are processed in your browser. Higher cost takes longer.',
		),
	),
	tool(
		'bip39',
		[
			mode(['generate', 'validate']),
			select('language', 'Idioma', 'Language', [
				['en', 'Inglês', 'English'],
				['es', 'Espanhol', 'Spanish'],
			]),
			select('words', 'Tamanho da frase', 'Phrase length', [
				['12', '12 palavras', '12 words'],
				['15', '15 palavras', '15 words'],
				['18', '18 palavras', '18 words'],
				['21', '21 palavras', '21 words'],
				['24', '24 palavras', '24 words'],
			]),
			input('mnemonic', 'Frase de recuperação', 'Recovery phrase', '', 'textarea'),
			input('passphrase', 'Passphrase opcional', 'Optional passphrase', '', 'text'),
		],
		(v) => {
			const wordlist = field(v, 'language') === 'es' ? spanishWordlist : englishWordlist;
			if (field(v, 'mode') === 'validate') {
				const phrase = field(v, 'mnemonic').trim().toLowerCase().replace(/\s+/g, ' ');
				return result({
					valid: validateMnemonic(phrase, wordlist),
					words: phrase ? phrase.split(' ').length : 0,
				});
			}
			const strength = (Number(field(v, 'words')) / 3) * 32;
			const mnemonic = generateMnemonic(wordlist, strength);
			const seed = mnemonicToSeedSync(mnemonic, field(v, 'passphrase'));
			const seedHex = Array.from(seed, (byte) => byte.toString(16).padStart(2, '0')).join('');
			return result({ mnemonic, seedHex }, 'bip39-mnemonic.json');
		},
		undefined,
		text(
			'Uma frase BIP39 controla fundos de carteira. Use apenas para testes; nunca reutilize frases reais.',
			'A BIP39 phrase can control wallet funds. Use for testing only; never reuse real phrases.',
		),
	),
	tool(
		'toml-converter',
		[
			source,
			select('from', 'Converter de', 'Convert from', [
				['json', 'JSON', 'JSON'],
				['yaml', 'YAML', 'YAML'],
				['toml', 'TOML', 'TOML'],
			]),
			select('to', 'Converter para', 'Convert to', [
				['toml', 'TOML', 'TOML'],
				['json', 'JSON', 'JSON'],
				['yaml', 'YAML', 'YAML'],
			]),
		],
		(v) => {
			const inputText = field(v, 'input');
			if (inputText.length > 1_000_000) {
				throw new Error('Limite de entrada: 1 MB / Input limit: 1 MB');
			}
			const from = field(v, 'from');
			const to = field(v, 'to');
			const parsed: unknown =
				from === 'json'
					? JSON.parse(inputText)
					: from === 'yaml'
						? parseYaml(inputText)
						: parseToml(inputText);
			const output =
				to === 'json'
					? JSON.stringify(parsed, null, 2)
					: to === 'yaml'
						? stringifyYaml(parsed)
						: stringifyToml(tomlTable(parsed));
			return result(output, `converted.${to}`);
		},
		{ input: '{"name":"demo","enabled":true}', from: 'json', to: 'toml' },
	),
	tool(
		'html-editor',
		[source],
		(v) => {
			const sanitized = DOMPurify.sanitize(field(v, 'input'), { USE_PROFILES: { html: true } });
			return {
				...result({ sanitized, characters: sanitized.length }),
				preview: preview(sanitized),
			};
		},
		{ input: '<h1>Olá</h1><p>HTML exibido com segurança.</p>' },
		text(
			'Scripts e atributos perigosos são removidos antes da prévia.',
			'Scripts and dangerous attributes are removed before preview.',
		),
	),
	tool('device-info', [], () =>
		result({
			browserUserAgent: navigator.userAgent,
			platform: navigator.platform,
			language: navigator.language,
			languages: navigator.languages,
			screen: { width: screen.width, height: screen.height, pixelRatio: devicePixelRatio },
			viewport: { width: innerWidth, height: innerHeight },
			hardwareConcurrency: navigator.hardwareConcurrency,
			touchPoints: navigator.maxTouchPoints,
		}),
	),
	tool(
		'keycode',
		[
			input('key', 'Tecla (event.key)', 'Key (event.key)', 'Enter', 'text'),
			input('code', 'Código físico (event.code)', 'Physical code (event.code)', 'Enter', 'text'),
		],
		(v) => {
			const key = field(v, 'key');
			const code = field(v, 'code');
			if (!key || !code) {
				throw new Error('Informe key e code / Enter key and code');
			}
			return result({
				key,
				code,
				isModifier: ['Alt', 'AltGraph', 'Control', 'Meta', 'Shift'].includes(key),
				isPrintable:
					Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(key))
						.length === 1,
			});
		},
	),
	tool('safe-link', [source], (v) => {
		let current = field(v, 'input').trim();
		const chain: string[] = [];
		for (let depth = 0; depth < 5; depth++) {
			let parsed: URL;
			try {
				parsed = new URL(current);
			} catch {
				break;
			}
			const next =
				parsed.searchParams.get('url') ??
				parsed.searchParams.get('q') ??
				parsed.searchParams.get('target');
			if (!next || next === current) {
				break;
			}
			chain.push(parsed.hostname);
			current = next;
		}
		return result({
			decodedUrl: current,
			wrappers: chain,
			protocol: (() => {
				try {
					return new URL(current).protocol;
				} catch {
					return null;
				}
			})(),
		});
	}),
];
