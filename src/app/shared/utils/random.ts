import { boundedNumber } from '../../core/models/tool';

export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1 || max > 0x100000000) throw new Error('Invalid range');
  const limit = Math.floor(0x100000000 / max) * max;
  let value: number;
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (value >= limit);
  return value % max;
}
export function randomString(length: number, alphabet: string): string {
  boundedNumber(String(length), 1, 4096);
  if (!alphabet.length)
    throw new Error('Select at least one character set / Selecione caracteres.');
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
}
export const hex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
export function uuid(version: string): string {
  if (version === '4') return crypto.randomUUID();
  if (version !== '7') throw new Error('UUID version: 4 / 7');
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let time = BigInt(Date.now());
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(time & 255n);
    time >>= 8n;
  }
  bytes[6] = (bytes[6] & 15) | 112;
  bytes[8] = (bytes[8] & 63) | 128;
  const value = hex(bytes);
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
export function password(length: number, sets: readonly string[]): string {
  boundedNumber(String(length), 8, 256);
  if (!sets.length) throw new Error('Selecione caracteres / Select character sets.');
  const chars = [
    ...sets.map((set) => randomString(1, set)),
    ...Array.from(randomString(length - sets.length, sets.join(''))),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
