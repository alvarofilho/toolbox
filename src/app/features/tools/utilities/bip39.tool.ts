import { field, text } from '@app/core/models/tool';

import { input, select } from '@app/features/tools/_shared/controls';

import { mode } from '@app/features/tools/_shared/execution-controls';

import { result, tool } from '@app/features/tools/_shared/definition';

import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39';

import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';

import { wordlist as spanishWordlist } from '@scure/bip39/wordlists/spanish.js';

export const definition = tool(
	'bip39',
	[
		mode(['generate', 'validate']),
		select(
			'language',
			'Idioma',
			'Language',
			[
				['en', 'Inglês', 'English'],
				['es', 'Espanhol', 'Spanish'],
			],
			undefined,
			'tools.bip39',
		),
		select(
			'words',
			'Tamanho da frase',
			'Phrase length',
			[
				['12', '12 palavras', '12 words'],
				['15', '15 palavras', '15 words'],
				['18', '18 palavras', '18 words'],
				['21', '21 palavras', '21 words'],
				['24', '24 palavras', '24 words'],
			],
			undefined,
			'tools.bip39',
		),
		input('mnemonic', 'Frase de recuperação', 'Recovery phrase', '', 'textarea', 'tools.bip39'),
		input('passphrase', 'Passphrase opcional', 'Optional passphrase', '', 'text', 'tools.bip39'),
	],
	async (v) => {
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
		const seed = await mnemonicToSeed(mnemonic, field(v, 'passphrase'));
		const seedHex = Array.from(seed, (byte) => byte.toString(16).padStart(2, '0')).join('');
		return result({ mnemonic, seedHex }, 'bip39-mnemonic.json');
	},
	undefined,
	text(
		'Uma frase BIP39 controla fundos de carteira. Use apenas para testes; nunca reutilize frases reais.',
		'A BIP39 phrase can control wallet funds. Use for testing only; never reuse real phrases.',
		undefined,
		'tools.bip39',
	),
);
