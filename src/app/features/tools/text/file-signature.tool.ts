import { tool, result } from '@app/features/tools/_shared/definition';

import { firstFile, file } from '@app/features/tools/_shared/files';

export const definition = tool('file-signature', [file()], async (_, files) => {
	const f = firstFile(files),
		bytes = new Uint8Array(await f.slice(0, 512).arrayBuffer()),
		hex = Array.from(bytes.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
	const signatures: [string, string][] = [
		['89504e470d0a1a0a', 'PNG'],
		['ffd8ff', 'JPEG'],
		['474946383761', 'GIF87a'],
		['474946383961', 'GIF89a'],
		['255044462d', 'PDF'],
		['504b0304', 'ZIP (also DOCX/XLSX/JAR/APK)'],
		['504b0506', 'ZIP empty'],
		['1f8b08', 'GZIP'],
		['4d5a', 'DOS/Windows executable'],
		['7f454c46', 'ELF executable'],
		['377abcaf271c', '7-Zip'],
		['526172211a07', 'RAR'],
		['424d', 'BMP'],
		['49492a00', 'TIFF (LE)'],
		['4d4d002a', 'TIFF (BE)'],
		['00000100', 'ICO'],
	];
	let detected = signatures.find(([prefix]) => hex.startsWith(prefix))?.[1] ?? 'Unknown';
	if (hex.startsWith('52494646') && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') {
		detected = 'WebP';
	}
	return result({
		filename: f.name,
		bytes: f.size,
		declaredMime: f.type,
		detected,
		first16Bytes: hex,
		classification: 'Magic bytes only; not a malware or full-format validation',
	});
});
