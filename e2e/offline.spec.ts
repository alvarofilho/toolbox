import { expect, test } from '@playwright/test';

test('prepara as ferramentas essenciais e abre suas rotas diretas offline', async ({ page }) => {
	await page.unroute('**/*');
	await page.goto('/');
	const offlineMenu = page.locator('.offline-menu');
	await offlineMenu.locator('summary').click();
	await offlineMenu.getByRole('button', { name: 'Preparar para uso offline' }).click();
	await expect(offlineMenu.getByRole('status')).toContainText(
		'As quatro ferramentas essenciais estão prontas',
		{ timeout: 30_000 },
	);
	await expect(offlineMenu.getByText('Pronta offline')).toHaveCount(4);
	await page.context().setOffline(true);

	for (const route of ['/tools/json-formatter', '/tools/base64', '/tools/url', '/tools/uuid']) {
		await page.goto(route);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	await page.context().setOffline(false);
	await page.goto('/');
	await page.locator('.offline-menu summary').click();
	await page
		.locator('.offline-menu')
		.getByRole('button', { name: 'Limpar recursos offline' })
		.click();
	await expect(page.locator('.offline-menu [role="status"]')).toContainText(
		'ainda não foram baixadas',
	);
	await expect
		.poll(() =>
			page.evaluate(() =>
				caches.keys().then((names) => names.some((name) => name.startsWith('ngsw:'))),
			),
		)
		.toBe(false);
});

test('abre uma rota direta online e valida o manifest e os ícones instaláveis', async ({
	page,
	request,
}) => {
	const manifest = await request.get('/manifest.webmanifest');
	expect(manifest.headers()['content-type']).toContain('application/manifest+json');
	const manifestBody: unknown = await manifest.json();
	if (
		typeof manifestBody !== 'object' ||
		manifestBody === null ||
		!('icons' in manifestBody) ||
		!Array.isArray(manifestBody.icons)
	) {
		throw new Error('PWA manifest is missing its icon list.');
	}
	const icons = manifestBody.icons.filter(
		(icon): icon is { src: string; sizes: string } =>
			typeof icon === 'object' &&
			icon !== null &&
			'src' in icon &&
			typeof icon.src === 'string' &&
			'sizes' in icon &&
			typeof icon.sizes === 'string',
	);
	expect(icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
	for (const icon of icons) {
		const response = await request.get(icon.src);
		expect(response.headers()['content-type']).toContain('image/png');
	}

	await page.goto('/tools/base64');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const offlineMenu = page.locator('.offline-menu');
	await offlineMenu.locator('summary').click();
	await expect(offlineMenu.getByText('Ainda não baixada')).toHaveCount(4);
});

test('informa quando o armazenamento de cache não está disponível', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'caches', { configurable: true, value: undefined });
	});
	await page.goto('/');
	const offlineMenu = page.locator('.offline-menu');
	await offlineMenu.locator('summary').click();
	await expect(offlineMenu.getByRole('status')).toContainText('não oferece suporte');
	await expect(
		offlineMenu.getByRole('button', { name: 'Preparar para uso offline' }),
	).toBeDisabled();
});
