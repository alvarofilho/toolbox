import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '@app/app.routes';
import { PreferencesService } from '@app/core/services/preferences';
import { provideToolboxTransloco } from '@app/core/services/transloco.providers';
import { vi } from 'vitest';

class PendingWorker extends EventTarget {
	static readonly instances: PendingWorker[] = [];
	terminated = false;
	lastMessage: unknown;

	constructor() {
		super();
		PendingWorker.instances.push(this);
	}

	postMessage(message: unknown): void {
		this.lastMessage = message;
	}

	terminate(): void {
		this.terminated = true;
	}
}

describe('tool workbench integration', () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.configureTestingModule({
			providers: [provideRouter(routes, withComponentInputBinding()), ...provideToolboxTransloco()],
		});
	});
	it.each([
		['temperature', 'value', '36.5', '97.7'],
		['percentage', 'first', '12.5', '25'],
		['rule-of-three', 'a', '2.5', '4.8'],
	])('accepts fractional input in %s', async (id, key, value, expected) => {
		const harness = await RouterTestingHarness.create(`/tools/${id}`);
		const root = harness.routeNativeElement;
		const input = root?.querySelector<HTMLInputElement>(`#field-${key}`);
		if (!root || !input) {
			throw new Error('Input missing');
		}
		input.value = value;
		input.dispatchEvent(new Event('input'));
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(root.querySelector('[role=alert]')).toBeNull();
		expect(root.querySelector('.result-code')?.textContent).toContain(expected);
	});
	it('keeps generators manual and associates an integer error with its field', async () => {
		const harness = await RouterTestingHarness.create('/tools/uuid');
		const root = harness.routeNativeElement;
		const count = root?.querySelector<HTMLInputElement>('#field-count');
		if (!root || !count) {
			throw new Error('Count missing');
		}
		count.value = '2.5';
		count.dispatchEvent(new Event('input'));
		await new Promise((resolve) => setTimeout(resolve, 500));
		await harness.fixture.whenStable();
		expect(root.querySelector('.result-code')).toBeNull();
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(count.getAttribute('aria-invalid')).toBe('true');
		expect(count.getAttribute('aria-describedby')).toBe('error-count');
		expect(root.querySelector('#error-count')?.textContent).toContain('inteiro');
		count.value = '2';
		count.dispatchEvent(new Event('input'));
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(root.querySelector('.result-code')?.textContent?.trim().split('\n')).toHaveLength(2);
	});
	it('terminates pending workers on cancel and when leaving the tool', async () => {
		PendingWorker.instances.length = 0;
		vi.stubGlobal('Worker', PendingWorker);
		try {
			const harness = await RouterTestingHarness.create('/tools/regex');
			const root = harness.routeNativeElement;
			if (!root) {
				throw new Error('Regex route missing');
			}
			root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
			await expect.poll(() => PendingWorker.instances.length).toBe(1);
			const firstWorker = PendingWorker.instances[0];
			if (!firstWorker) {
				throw new Error('Regex worker missing');
			}
			const cancel = Array.from(root.querySelectorAll('button')).find((button) =>
				button.textContent?.includes('Continuar editando'),
			);
			cancel?.click();
			expect(firstWorker.terminated).toBe(true);

			root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
			await expect.poll(() => PendingWorker.instances.length).toBe(2);
			const secondWorker = PendingWorker.instances[1];
			if (!secondWorker) {
				throw new Error('Second Regex worker missing');
			}
			await harness.navigateByUrl('/tools/jsonpath');
			expect(secondWorker.terminated).toBe(true);
		} finally {
			vi.unstubAllGlobals();
		}
	});
	it('shows only the selected PIX operation and preserves hidden configuration', async () => {
		const harness = await RouterTestingHarness.create('/tools/pix');
		const root = harness.routeNativeElement;
		const mode = root?.querySelector<HTMLSelectElement>('#field-mode');
		if (!root || !mode) {
			throw new Error('PIX mode missing');
		}
		expect(root.querySelector('#field-key')).toBeNull();
		mode.value = 'generate';
		mode.dispatchEvent(new Event('change'));
		await harness.fixture.whenStable();
		const key = root.querySelector<HTMLInputElement>('#field-key');
		if (!key) {
			throw new Error('PIX key missing');
		}
		expect(root.querySelector('#field-input')).toBeNull();
		key.value = 'custom@example.com';
		key.dispatchEvent(new Event('input'));
		mode.value = 'decode';
		mode.dispatchEvent(new Event('change'));
		await harness.fixture.whenStable();
		mode.value = 'generate';
		mode.dispatchEvent(new Event('change'));
		await harness.fixture.whenStable();
		expect(root.querySelector<HTMLInputElement>('#field-key')?.value).toBe('custom@example.com');
	});
	it('provides textual addition and removal markers in a diff', async () => {
		const harness = await RouterTestingHarness.create('/tools/text-diff');
		await harness.fixture.whenStable();
		const root = harness.routeNativeElement;
		if (!root) {
			throw new Error('Diff missing');
		}
		Array.from(root.querySelectorAll('button'))
			.find((button) => button.textContent?.includes('Usar exemplo'))
			?.click();
		await harness.fixture.whenStable();
		expect(root.querySelector('.diff-row-change')?.textContent).toContain('Removido:');
		expect(root.querySelector('.diff-row-change')?.textContent).toContain('Adicionado:');
		expect(Array.from(root.querySelectorAll('.diff-marker')).map((el) => el.textContent)).toContain(
			'+',
		);
	});
	it('updates conversions automatically as input controls change', async () => {
		const harness = await RouterTestingHarness.create('/tools/base-converter');
		const root = harness.routeNativeElement;
		if (!root) {
			throw new Error('Route missing');
		}
		const select = root.querySelector<HTMLSelectElement>('select');
		if (!select) {
			throw new Error('Select missing');
		}
		expect(select.value).toBe('10');
		const input = root.querySelector<HTMLInputElement>('#field-input');
		if (!input) {
			throw new Error('Input missing');
		}
		input.value = 'ff';
		input.dispatchEvent(new Event('input'));
		select.value = '16';
		select.dispatchEvent(new Event('change'));
		await expect.poll(() => root.querySelector('.result-code')?.textContent ?? '').toContain('255');
	});
	it('renders QR previews in a sandbox and exposes the generated file', async () => {
		const harness = await RouterTestingHarness.create('/tools/qr');
		await harness.fixture.whenStable();
		const root = harness.routeNativeElement;
		if (!root) {
			throw new Error('Route missing');
		}
		Array.from(root.querySelectorAll('button'))
			.find((b) => b.textContent?.includes('Usar exemplo'))
			?.click();
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		const iframe = root.querySelector('iframe');
		expect(iframe?.getAttribute('sandbox')).toBe('');
		expect(iframe?.srcdoc).toContain("default-src 'none'");
		expect(iframe?.srcdoc).toContain('<svg');
		expect(root.textContent).toContain('qrcode.svg');
		const prefs = TestBed.inject(PreferencesService);
		expect(prefs.recent()).toContain('qr');
		expect(localStorage.getItem('toolbox.preferences.v1')).not.toContain('https://example.com');
	});
	it('accepts local file selection, computes a hash and clears selection', async () => {
		const harness = await RouterTestingHarness.create('/tools/file-hash');
		const root = harness.routeNativeElement;
		if (!root) {
			throw new Error('Route missing');
		}
		const input = root.querySelector<HTMLInputElement>('input[type=file]');
		if (!input) {
			throw new Error('File input missing');
		}
		const file = new File(['abc'], 'test.txt', { type: 'text/plain' });
		Object.defineProperty(file, 'arrayBuffer', {
			value: async () => new TextEncoder().encode('abc').buffer,
		});
		Object.defineProperty(input, 'files', { configurable: true, value: [file] });
		input.dispatchEvent(new Event('change'));
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		await expect
			.poll(async () => {
				await harness.fixture.whenStable();
				return (
					root.querySelector('.result-code')?.textContent ??
					root.querySelector('[role=alert]')?.textContent ??
					''
				);
			})
			.toContain('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
		Array.from(root.querySelectorAll('button'))
			.find((b) => b.textContent?.includes('Limpar'))
			?.click();
		await harness.fixture.whenStable();
		expect(root.querySelector('.result-code')).toBeNull();
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(root.querySelector('[role=alert]')?.textContent).toContain('Selecione');
		expect(localStorage.getItem('toolbox.preferences.v1')).not.toContain('test.txt');
	});
	it('sanitizes SVG executable content and isolates raw markdown previews', async () => {
		const harness = await RouterTestingHarness.create('/tools/svg-optimizer');
		const root = harness.routeNativeElement;
		if (!root) {
			throw new Error('Route missing');
		}
		const input = root.querySelector<HTMLTextAreaElement>('textarea');
		if (!input) {
			throw new Error('Textarea missing');
		}
		input.value =
			'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><rect width="20" height="20" fill="red"/></svg>';
		input.dispatchEvent(new Event('input'));
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		const output = root.querySelector('.result-code')?.textContent ?? '';
		expect(output).toContain('<svg');
		expect(output).not.toContain('<script');
		expect(output).not.toContain('onload');
		expect(root.querySelector('.result-notice')?.textContent).toMatch(/\d+ → \d+ caracteres/);
		TestBed.inject(PreferencesService).setLocale('en');
		await harness.fixture.whenStable();
		expect(root.querySelector('.result-notice')?.textContent).toMatch(/\d+ → \d+ characters/);
		await harness.navigateByUrl('/tools/markdown');
		await harness.fixture.whenStable();
		const next = harness.routeNativeElement;
		if (!next) {
			throw new Error('Markdown missing');
		}
		const md = next.querySelector<HTMLTextAreaElement>('textarea');
		if (!md) {
			throw new Error('Textarea missing');
		}
		md.value = '# Test\n<script>window.top.alert(1)</script>';
		md.dispatchEvent(new Event('input'));
		next.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(next.querySelector('iframe')?.getAttribute('sandbox')).toBe('');
	});
	it('transfers CSV through JSON and JSONPath into TypeScript without running destinations automatically', async () => {
		const harness = await RouterTestingHarness.create('/tools/csv-json');
		const submit = async (root: HTMLElement): Promise<void> => {
			root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
			await expect.poll(() => root.querySelector('.result-code')?.textContent ?? '').not.toBe('');
		};
		const openFirstDestination = async (root: HTMLElement): Promise<void> => {
			const menu = root.querySelector<HTMLDetailsElement>('.transfer-menu');
			if (!menu) {
				throw new Error('Compatible result destination missing');
			}
			menu.open = true;
			menu.querySelector<HTMLButtonElement>('.transfer-options button')?.click();
			await harness.fixture.whenStable();
		};
		const acceptTransfer = async (root: HTMLElement): Promise<void> => {
			const accept = Array.from(root.querySelectorAll('button')).find((button) =>
				button.textContent?.includes('Usar resultado'),
			);
			if (accept) {
				accept.click();
				await harness.fixture.whenStable();
			}
		};

		let root = harness.routeNativeElement;
		if (!root) {
			throw new Error('CSV tool missing');
		}
		const csv = root.querySelector<HTMLTextAreaElement>('#field-input');
		if (!csv) {
			throw new Error('CSV input missing');
		}
		csv.value = 'id,name\n1,Ana';
		csv.dispatchEvent(new Event('input'));
		await submit(root);
		expect(root.querySelector('.transfer-menu')?.textContent).toContain('Abrir resultado em');
		await openFirstDestination(root);

		root = harness.routeNativeElement;
		if (!root || harness.routeNativeElement?.querySelector('.result-code')) {
			throw new Error('JSON destination ran automatically');
		}
		await acceptTransfer(root);
		expect(root.querySelector<HTMLTextAreaElement>('#field-input')?.value).toContain('"id": "1"');
		await submit(root);
		const jsonMenu = root.querySelector<HTMLDetailsElement>('.transfer-menu');
		if (!jsonMenu) {
			throw new Error('JSON destinations missing');
		}
		expect(jsonMenu.querySelectorAll('.transfer-options button')).toHaveLength(2);
		jsonMenu.open = true;
		jsonMenu.querySelector<HTMLButtonElement>('.transfer-options button')?.click();
		await harness.fixture.whenStable();

		root = harness.routeNativeElement;
		if (!root) {
			throw new Error('JSONPath tool missing');
		}
		await acceptTransfer(root);
		const path = root.querySelector<HTMLInputElement>('#field-path');
		if (!path) {
			throw new Error('JSONPath expression missing');
		}
		path.value = '$[*].name';
		path.dispatchEvent(new Event('input'));
		await submit(root);
		expect(root.querySelector('.transfer-menu')?.textContent).toContain('Abrir resultado em');
		await openFirstDestination(root);

		root = harness.routeNativeElement;
		if (!root) {
			throw new Error('TypeScript tool missing');
		}
		await acceptTransfer(root);
		expect(root.querySelector<HTMLTextAreaElement>('#field-input')?.value).toBe('[\n  "Ana"\n]');
		expect(root.querySelector('.result-code')).toBeNull();
		await submit(root);
		expect(root.querySelector('.result-code')?.textContent).toContain('string');
	});
	it('shows no transfer destination for invalid CSV output', async () => {
		const harness = await RouterTestingHarness.create('/tools/csv-json');
		const root = harness.routeNativeElement;
		const input = root?.querySelector<HTMLTextAreaElement>('#field-input');
		if (!root || !input) {
			throw new Error('CSV input missing');
		}
		input.value = 'a,b\n1';
		input.dispatchEvent(new Event('input'));
		root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
		await harness.fixture.whenStable();
		expect(root.querySelector('[role=alert]')).not.toBeNull();
		expect(root.querySelector('.transfer-menu')).toBeNull();
	});
	it('does not transfer or persist data during ordinary navigation', async () => {
		const harness = await RouterTestingHarness.create('/tools/csv-json');
		const root = harness.routeNativeElement;
		const input = root?.querySelector<HTMLTextAreaElement>('#field-input');
		if (!root || !input) {
			throw new Error('CSV input missing');
		}
		input.value = 'private navigation marker';
		input.dispatchEvent(new Event('input'));
		await harness.navigateByUrl('/tools/json-formatter');
		await harness.fixture.whenStable();
		const destination = harness.routeNativeElement;
		if (!destination) {
			throw new Error('JSON tool missing');
		}
		expect(destination.querySelector<HTMLTextAreaElement>('#field-input')?.value).not.toContain(
			'private navigation marker',
		);
		expect(destination.querySelector('.handoff-notice')).toBeNull();
		expect(localStorage.getItem('toolbox.preferences.v1')).not.toContain(
			'private navigation marker',
		);
	});
	it.each([
		['Manter conteúdo atual', '{"keep":"draft"}'],
		['Usar resultado', 'received CSV JSON'],
	] as const)(
		'requires an explicit choice before replacing destination work: %s',
		async (choice, expected) => {
			const formatter = await import('@app/features/tools/json/json-formatter.tool');
			const existingInput = '{"keep":"draft"}';
			const filledDefinition = {
				...formatter.definition,
				controls: formatter.definition.controls.map((control) =>
					control.key === 'input' ? { ...control, value: existingInput } : control,
				),
			};
			const customRoutes = routes.map((route) =>
				route.path === 'tools/json-formatter'
					? { ...route, resolve: { definition: () => filledDefinition } }
					: route,
			);
			TestBed.resetTestingModule();
			TestBed.configureTestingModule({
				providers: [
					provideRouter(customRoutes, withComponentInputBinding()),
					...provideToolboxTransloco(),
				],
			});
			const harness = await RouterTestingHarness.create('/tools/csv-json');
			const csvRoot = harness.routeNativeElement;
			const csv = csvRoot?.querySelector<HTMLTextAreaElement>('#field-input');
			if (!csvRoot || !csv) {
				throw new Error('CSV input missing');
			}
			csv.value = 'id,name\n1,Ana';
			csv.dispatchEvent(new Event('input'));
			csvRoot.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
			await expect
				.poll(() => csvRoot.querySelector('.result-code')?.textContent ?? '')
				.not.toBe('');
			const menu = csvRoot.querySelector<HTMLDetailsElement>('.transfer-menu');
			if (!menu) {
				throw new Error('Compatible result destination missing');
			}
			menu.open = true;
			menu.querySelector<HTMLButtonElement>('.transfer-options button')?.click();
			await harness.fixture.whenStable();

			const destination = harness.routeNativeElement;
			const destinationInput = destination?.querySelector<HTMLTextAreaElement>('#field-input');
			if (!destination || !destinationInput) {
				throw new Error('JSON destination input missing');
			}
			expect(destinationInput.value).toBe(existingInput);
			expect(destination.querySelector('.handoff-notice')).not.toBeNull();
			expect(destination.querySelector('.result-code')).toBeNull();
			Array.from(destination.querySelectorAll('button'))
				.find((button) => button.textContent?.includes(choice))
				?.click();
			await harness.fixture.whenStable();
			if (expected === 'received CSV JSON') {
				expect(destinationInput.value).toContain('"name": "Ana"');
			} else {
				expect(destinationInput.value).toBe(existingInput);
			}
			expect(destination.querySelector('.handoff-notice')).toBeNull();
			expect(destination.querySelector('.result-code')).toBeNull();
		},
	);
});
