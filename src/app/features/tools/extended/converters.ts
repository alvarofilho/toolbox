import * as he from 'he';
import { toASCII, toUnicode } from 'punycode';
import { marked } from 'marked';
import { Temporal } from '@js-temporal/polyfill';
import {
  tool,
  source,
  input,
  select,
  mode,
  field,
  result,
  utf8,
  hexBytes,
  bytesHex,
  preview,
} from './common';

const direction = mode(['encode', 'decode']);
export const definitions = [
  tool(
    'html-entities',
    [source, direction],
    (v) =>
      result(
        field(v, 'mode') === 'decode'
          ? he.decode(field(v, 'input'))
          : he.encode(field(v, 'input'), { useNamedReferences: true }),
        'entities.txt',
      ),
    { input: '<p>Olá & bem-vindo</p>' },
  ),
  tool(
    'unicode',
    [source, direction],
    (v) =>
      result(
        field(v, 'mode') === 'encode'
          ? Array.from(field(v, 'input'))
              .map((c) => `\\u{${c.codePointAt(0)?.toString(16)}}`)
              .join('')
          : field(v, 'input').replace(
              /\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})/gi,
              (_, a: string | undefined, b: string | undefined) =>
                String.fromCodePoint(parseInt(a ?? b ?? '', 16)),
            ),
        'unicode.txt',
      ),
    { input: 'Olá 👋' },
  ),
  tool(
    'hex',
    [source, direction],
    (v) =>
      result(
        field(v, 'mode') === 'decode'
          ? new TextDecoder('utf-8', { fatal: true }).decode(
              hexBytes(field(v, 'input').replace(/\s/g, '')),
            )
          : bytesHex(utf8(field(v, 'input'))),
        'hex.txt',
      ),
    { input: 'Olá' },
  ),
  tool(
    'base-converter',
    [
      source,
      select(
        'from',
        'Base de origem',
        'Input base',
        [
          ['2', '2', '2'],
          ['10', '10', '10'],
          ['16', '16', '16'],
        ],
        '10',
      ),
    ],
    (v) => {
      const s = field(v, 'input').trim(),
        base = field(v, 'from');
      if (
        !s ||
        s.length > 10000 ||
        !(base === '2' ? /^-?[01]+$/ : base === '16' ? /^-?[0-9a-f]+$/i : /^-?\d+$/).test(s)
      )
        throw new Error('Número inválido / Invalid number');
      const n =
        (s.startsWith('-') ? -1n : 1n) *
        BigInt((base === '2' ? '0b' : base === '16' ? '0x' : '') + s.replace(/^-/, ''));
      return result({
        binary: n.toString(2),
        decimal: n.toString(10),
        hexadecimal: n.toString(16),
      });
    },
    { input: '255' },
  ),
  tool(
    'date',
    [
      source,
      select('from', 'Formato de entrada', 'Input format', [
        ['iso', 'ISO 8601', 'ISO 8601'],
        ['br', 'DD/MM/YYYY', 'DD/MM/YYYY'],
        ['us', 'MM/DD/YYYY', 'MM/DD/YYYY'],
        ['unix', 'Unix seconds', 'Unix seconds'],
      ]),
    ],
    (v) => {
      let date: Temporal.PlainDate;
      const raw = field(v, 'input').trim(),
        from = field(v, 'from');
      if (from === 'br' || from === 'us') {
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
        if (!m) throw new Error('Use DD/MM/YYYY ou MM/DD/YYYY');
        date = Temporal.PlainDate.from(
          {
            year: Number(m[3]),
            month: Number(m[from === 'br' ? 2 : 1]),
            day: Number(m[from === 'br' ? 1 : 2]),
          },
          { overflow: 'reject' },
        );
      } else if (from === 'unix') {
        if (!/^-?\d+$/.test(raw)) throw new Error('Unix seconds expected');
        date = Temporal.Instant.fromEpochNanoseconds(BigInt(raw) * 1000000000n)
          .toZonedDateTimeISO('UTC')
          .toPlainDate();
      } else
        date =
          raw.length === 10
            ? Temporal.PlainDate.from(raw)
            : Temporal.Instant.from(raw).toZonedDateTimeISO('UTC').toPlainDate();
      const mm = String(date.month).padStart(2, '0'),
        dd = String(date.day).padStart(2, '0');
      return result({
        iso: date.toString(),
        br: `${dd}/${mm}/${date.year}`,
        us: `${mm}/${dd}/${date.year}`,
        weekday: date.dayOfWeek,
        unixUtcMidnight: date.toZonedDateTime('UTC').epochMilliseconds / 1000,
      });
    },
    { input: '2026-01-01' },
  ),
  tool(
    'timezone',
    [
      input(
        'input',
        'Data/hora local (ISO, sem offset)',
        'Local date/time (ISO, without offset)',
        '2026-01-01T12:00:00',
        'text',
      ),
      input('from', 'Fuso de origem (IANA)', 'Source timezone (IANA)', 'America/Sao_Paulo', 'text'),
      input('to', 'Fuso de destino (IANA)', 'Target timezone (IANA)', 'Europe/Lisbon', 'text'),
    ],
    (v) => {
      const local = Temporal.PlainDateTime.from(field(v, 'input'));
      const source = local.toZonedDateTime(field(v, 'from'), {
        disambiguation: 'reject',
      });
      return result({
        source: source.toString(),
        target: source.withTimeZone(field(v, 'to')).toString(),
        utc: source.toInstant().toString(),
      });
    },
  ),
  tool(
    'text-binary',
    [source],
    (v) =>
      result(
        Array.from(utf8(field(v, 'input')), (b) => b.toString(2).padStart(8, '0')).join(' '),
        'binary.txt',
      ),
    { input: 'Olá' },
  ),
  tool(
    'binary-text',
    [source],
    (v) => {
      const s = field(v, 'input').replace(/\s/g, '');
      if (!/^(?:[01]{8})+$/.test(s)) throw new Error('Use bytes de 8 bits / Use 8-bit bytes');
      return result(
        new TextDecoder('utf-8', { fatal: true }).decode(
          Uint8Array.from(s.match(/.{8}/g) ?? [], (b) => parseInt(b, 2)),
        ),
        'text.txt',
      );
    },
    { input: '01001000 01101001' },
  ),
  tool(
    'markdown',
    [source],
    async (v) => {
      const html = await marked.parse(field(v, 'input'));
      return { ...result(html, 'preview.html'), preview: preview(html) };
    },
    { input: '# Olá\n\n**Markdown** com listas:\n\n- Um\n- Dois' },
  ),
  tool(
    'punycode',
    [source, direction],
    (v) => {
      const domain = field(v, 'input').trim();
      if (!domain || /[\s/:@]/.test(domain))
        throw new Error('Informe somente o domínio / Enter only a domain');
      return result(
        field(v, 'mode') === 'decode' ? toUnicode(domain) : toASCII(domain),
        'domain.txt',
      );
    },
    { input: 'ação.com.br' },
  ),
];
