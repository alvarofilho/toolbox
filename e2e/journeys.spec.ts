import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import QRCode from 'qrcode';

test.beforeEach(async ({ page, baseURL }) => {
	await page.route('**/*', (route) =>
		new URL(route.request().url()).origin === baseURL ? route.continue() : route.abort(),
	);
});

test('abre e atualiza uma ferramenta diretamente, executa e permite copiar com permissão', async ({
	page,
	context,
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/tools/sha');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await page.reload();

	await page.locator('#field-input').fill('abc');
	await page.locator('#field-algorithm').selectOption('SHA-256');
	await page.locator('.input-panel button[type="submit"]').click();
	await expect(page.locator('.result-code')).toContainText(
		'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
	);
	await page.getByRole('button', { name: 'Copiar' }).click();
	await expect
		.poll(() => page.evaluate(() => navigator.clipboard.readText()))
		.toContain('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('calcula o hash do arquivo selecionado sem enviá-lo', async ({ page, baseURL }) => {
	const externalRequests: string[] = [];
	page.on('request', (request) => {
		if (new URL(request.url()).origin !== baseURL) {
			externalRequests.push(new URL(request.url()).origin);
		}
	});
	await page.goto('/tools/file-hash');
	const data = Buffer.from('conteudo local deterministico');
	await page.locator('#field-files').setInputFiles({
		name: 'amostra.txt',
		mimeType: 'text/plain',
		buffer: data,
	});
	await page.locator('.input-panel button[type="submit"]').click();
	await expect(page.locator('.result-code')).toContainText('amostra.txt');
	await expect(page.locator('.result-code')).toContainText(
		createHash('sha256').update(data).digest('hex'),
	);
	expect(externalRequests).toEqual([]);
	expect(await page.evaluate(() => Object.values(localStorage).join('\n'))).not.toContain(
		'conteudo local deterministico',
	);
});

test('valida JSON Schema e executa Regex em Workers reais', async ({ page }) => {
	const workerUrls: string[] = [];
	page.on('worker', (worker) => workerUrls.push(worker.url()));

	await page.goto('/tools/json-schema');
	await page.locator('#field-input').fill('{"name":"Ana"}');
	await page
		.locator('#field-schema')
		.fill('{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}');
	await page.locator('.input-panel button[type="submit"]').click();
	await expect(page.locator('.result-code')).toContainText('"valid": true');
	await expect.poll(() => workerUrls.length).toBeGreaterThan(0);

	await page.goto('/tools/regex');
	await page.locator('#field-pattern').fill('[A-Z][a-z]+');
	await page.locator('#field-flags').fill('g');
	await page.locator('#field-input').fill('Ana e Bruno');
	await page.locator('.input-panel button[type="submit"]').click();
	await expect(page.locator('.result-code')).toContainText('Ana');
	await expect(page.locator('.result-code')).toContainText('Bruno');
	await expect.poll(() => workerUrls.length).toBeGreaterThan(1);
});

test('baixa o QR como SVG com nome, MIME e conteúdo esperados', async ({ page }) => {
	const payload = 'https://example.test/jornada';
	await page.goto('/tools/qr');
	await page.locator('#field-input').fill(payload);
	await page.locator('.input-panel button[type="submit"]').click();
	await expect(page.locator('.artifact-list')).toContainText('image/svg+xml');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'qrcode.svg' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('qrcode.svg');
	const path = await download.path();
	if (path === null) {
		throw new Error('QR Code download was not saved.');
	}
	const contents = await readFile(path, 'utf8');
	expect(contents).toBe(
		await QRCode.toString(payload, { type: 'svg', width: 256, errorCorrectionLevel: 'M' }),
	);
});

test('mantém a CSP de produção e prévias isoladas', async ({ page }) => {
	const response = await page.goto('/tools/qr');
	expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
	expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
	await page.locator('#field-input').fill('https://example.test/jornada');
	await page.locator('.input-panel button[type="submit"]').click();
	const preview = page.locator('iframe.tool-preview');
	await expect(preview).toHaveAttribute('sandbox', '');
	expect(await preview.getAttribute('srcdoc')).toContain("default-src 'none'");
	const scriptResult = await page.evaluate(() => {
		const script = document.createElement('script');
		script.textContent = 'window.__cspInlineScriptRan = true';
		document.body.append(script);
		return Reflect.get(window, '__cspInlineScriptRan') ?? false;
	});
	expect(scriptResult).toBe(false);
});

test('favorita por teclado e conserva layout móvel sem rolagem horizontal', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/tools/regex');
	const favorite = page.locator('button.tool-favorite');
	let favoriteReachedByTab = false;
	for (let tabCount = 0; tabCount < 30 && !favoriteReachedByTab; tabCount += 1) {
		await page.keyboard.press('Tab');
		favoriteReachedByTab = await favorite.evaluate((button) => document.activeElement === button);
	}
	expect(favoriteReachedByTab).toBe(true);
	await page.keyboard.press('Enter');
	await expect(favorite).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('#field-pattern')).toBeVisible();
	await expect(page.locator('.input-panel button[type="submit"]')).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	await page.goto('/favorites');
	await expect(page.locator('a[href="/tools/regex"]')).toBeVisible();
});
