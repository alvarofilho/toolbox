export const escapeHtml = (s: string): string =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
	);

export function preview(body: string, css = ''): string {
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>:root{color-scheme:light;--preview-ink:#22382c;--preview-paper:#f7f8f4;--ink:#22382c;--muted:#647064;--paper:#f7f8f4}:root[data-theme=dark]{color-scheme:dark;--preview-ink:#e1e9de;--preview-paper:#1b2822;--ink:#e6ece7;--muted:#adbbb1;--paper:#141917}body{font:16px/1.6 system-ui;padding:20px;color:var(--preview-ink);background:var(--preview-paper);overflow-wrap:anywhere}img{max-width:100%}pre{white-space:pre-wrap}${css}</style></head><body>${body}</body></html>`;
}
