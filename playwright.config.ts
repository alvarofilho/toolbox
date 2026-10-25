import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	reporter: 'list',
	outputDir: 'test-results/e2e',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'off',
		screenshot: 'only-on-failure',
		video: 'off',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'node scripts/serve-production.mjs',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env['CI'],
		timeout: 15_000,
	},
});
