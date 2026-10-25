import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist/cloudflare/browser', import.meta.url)));
const headerSource = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const securityHeaders = Object.fromEntries(
	headerSource
		.split(/\r?\n/)
		.map((line) => line.match(/^\s{2}([^:]+):\s*(.*)$/))
		.filter(Boolean)
		.map((match) => [match[1], match[2]]),
);

if (!existsSync(resolve(root, 'index.html'))) {
	throw new Error('Production build not found. Run `pnpm run build` first.');
}

const mimeTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.webp': 'image/webp',
	'.webmanifest': 'application/manifest+json; charset=utf-8',
	'.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
	const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
	const candidate = resolve(root, `.${decodeURIComponent(pathname)}`);
	const isInsideRoot = candidate === root || candidate.startsWith(`${root}${sep}`);
	const requestedFile =
		isInsideRoot && existsSync(candidate) && statSync(candidate).isFile()
			? candidate
			: resolve(root, 'index.html');

	response.writeHead(200, {
		...securityHeaders,
		'Cache-Control': securityHeaders['Cache-Control'] ?? 'no-store',
		'Content-Type': mimeTypes[extname(requestedFile)] ?? 'application/octet-stream',
	});
	createReadStream(requestedFile).pipe(response);
});

server.listen(4173, '127.0.0.1');
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
