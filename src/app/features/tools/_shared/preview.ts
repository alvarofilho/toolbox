export const escapeHtml = (s: string): string =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
	);

export function preview(body: string, css = ''): string {
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>body{font:16px system-ui;padding:20px;color:#152b24;background:#fafaf7;overflow-wrap:anywhere}img{max-width:100%}pre{white-space:pre-wrap}${css}</style></head><body>${body}</body></html>`;
}
