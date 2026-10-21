import { compare, hash } from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolExecutionError } from '@app/core/models/tool';
import { definition } from '@app/features/tools/utilities/bcrypt.tool';

class BcryptWorker extends EventTarget {
	static readonly instances: BcryptWorker[] = [];
	static hold = false;
	terminated = false;

	constructor() {
		super();
		BcryptWorker.instances.push(this);
	}

	postMessage(message: { mode: string; password: string; cost?: number; hash?: string }): void {
		if (BcryptWorker.hold) {
			return;
		}
		void (async () => {
			let result: { readonly hash: string; readonly cost: number } | { readonly matches: boolean };
			if (message.mode === 'hash') {
				if (message.cost === undefined) {
					return;
				}
				result = { hash: await hash(message.password, message.cost), cost: message.cost };
			} else {
				result = { matches: await compare(message.password, message.hash ?? '') };
			}
			if (!this.terminated) {
				this.dispatchEvent(new MessageEvent('message', { data: result }));
			}
		})();
	}

	terminate(): void {
		this.terminated = true;
	}
}

describe('bcrypt tool', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		BcryptWorker.instances.length = 0;
	});

	it('runs hash and verification in workers and returns bcrypt compatible values', async () => {
		vi.stubGlobal('Worker', BcryptWorker);
		const values = { mode: 'hash', password: 'local secret', cost: '10', hash: '' };

		const hashed = await definition.run(values, {}, undefined);
		const hashValue = JSON.parse(hashed.output) as { hash: string; cost: number };
		expect(hashValue.cost).toBe(10);
		await expect(compare(values.password, hashValue.hash)).resolves.toBe(true);

		const verified = await definition.run(
			{ ...values, mode: 'verify', hash: hashValue.hash },
			{},
			undefined,
		);
		expect(JSON.parse(verified.output)).toEqual({ matches: true });
		expect(BcryptWorker.instances).toHaveLength(2);
		expect(BcryptWorker.instances.every((worker) => worker.terminated)).toBe(true);
	});

	it('rejects unsupported costs, malformed hashes, and passwords over 72 UTF-8 bytes before starting a worker', async () => {
		vi.stubGlobal('Worker', BcryptWorker);
		const base = { password: 'password', mode: 'hash', cost: '8', hash: '' };

		await expect(definition.run(base, {}, undefined)).rejects.toMatchObject({ kind: 'input' });
		await expect(
			definition.run({ ...base, mode: 'verify', hash: '$2b$31$invalid' }, {}, undefined),
		).rejects.toMatchObject({ kind: 'input' });
		await expect(
			definition.run({ ...base, password: 'é'.repeat(37), cost: '10' }, {}, undefined),
		).rejects.toMatchObject({ kind: 'input' });
		expect(BcryptWorker.instances).toHaveLength(0);
	});

	it('terminates cancelled work and permits a fresh execution', async () => {
		vi.stubGlobal('Worker', BcryptWorker);
		BcryptWorker.hold = true;
		const controller = new AbortController();
		const run = definition.run(
			{ mode: 'hash', password: 'secret', cost: '10', hash: '' },
			{},
			controller.signal,
		);
		controller.abort();

		await expect(run).rejects.toBeInstanceOf(ToolExecutionError);
		await expect(run).rejects.toMatchObject({ kind: 'cancelled' });
		expect(BcryptWorker.instances[0]?.terminated).toBe(true);

		BcryptWorker.hold = false;
		const next = await definition.run(
			{ mode: 'hash', password: 'secret', cost: '10', hash: '' },
			{},
			undefined,
		);
		expect(JSON.parse(next.output)).toHaveProperty('hash');
	});
});
