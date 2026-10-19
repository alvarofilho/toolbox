import ipaddr from 'ipaddr.js';

export function subnet(value: string): Record<string, unknown> {
	const [address, prefix] = ipaddr.parseCIDR(value.trim());
	const bytes = address.toByteArray(),
		bits = bytes.length * 8;
	let integer = 0n;
	for (const byte of bytes) {
		integer = (integer << 8n) | BigInt(byte);
	}
	const size = 1n << BigInt(bits - prefix),
		network = (integer / size) * size,
		last = network + size - 1n;
	const format = (n: bigint): string => {
		const b = Array.from({ length: bytes.length }, (_, i) =>
			Number((n >> BigInt((bytes.length - 1 - i) * 8)) & 255n),
		);
		return ipaddr.fromByteArray(b).toString();
	};
	const mask = ((1n << BigInt(bits)) - 1n) ^ ((1n << BigInt(bits - prefix)) - 1n);
	return {
		family: address.kind(),
		address: address.toString(),
		prefix,
		network: format(network),
		last: format(last),
		netmask: format(mask),
		cidr: `${format(network)}/${prefix}`,
		totalAddresses: size.toString(),
		...(bits === 32
			? {
					broadcast: format(last),
					firstHost: format(prefix >= 31 ? network : network + 1n),
					lastHost: format(prefix >= 31 ? last : last - 1n),
					usableHosts: (prefix >= 31 ? size : size - 2n).toString(),
				}
			: {}),
		range: address.range(),
	};
}
