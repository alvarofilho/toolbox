import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '@app/app.routes';
import { PreferencesService } from '@app/core/services/preferences';
import { provideToolboxTransloco } from '@app/core/services/transloco.providers';

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
});
