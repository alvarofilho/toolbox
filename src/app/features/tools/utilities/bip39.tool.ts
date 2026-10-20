import { field } from '@app/core/models/tool';

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
			'tools.bip39.language',
			[
				['en', 'tools.bip39.english'],
				['es', 'tools.bip39.spanish'],
			],
			undefined,
		),
		select(
			'words',
			'tools.bip39.phrase_length',
			[
				['12', 'tools.bip39.12_words'],
				['15', 'tools.bip39.15_words'],
				['18', 'tools.bip39.18_words'],
				['21', 'tools.bip39.21_words'],
				['24', 'tools.bip39.24_words'],
			],
			undefined,
		),
		input('mnemonic', 'tools.bip39.recovery_phrase', '', 'textarea'),
		input('passphrase', 'tools.bip39.optional_passphrase', '', 'text'),
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
	'tools.bip39.a_bip39_phrase_can_control_wallet_funds_us',
);
