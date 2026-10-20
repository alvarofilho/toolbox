import { field } from '@app/core/models/tool';

import { input } from '@app/features/tools/_shared/controls';

import { result, tool } from '@app/features/tools/_shared/definition';

const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"']/g,
		(char) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
	);

export const definition = tool(
	'meta-tags',
	[
		input('title', 'tools.meta-tags.title', 'Minha página', 'text'),
		input('description', 'tools.meta-tags.description', '', 'text'),
		input('url', 'tools.meta-tags.canonical_url', '', 'text'),
		input('image', 'tools.meta-tags.share_image', '', 'text'),
	],
	(v) => {
		const title = escapeHtml(field(v, 'title'));
		const description = escapeHtml(field(v, 'description'));
		const url = escapeHtml(field(v, 'url'));
		const image = escapeHtml(field(v, 'image'));
		return result(
			`<title>${title}</title>\n<meta name="description" content="${description}">\n<link rel="canonical" href="${url}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${image}">\n<meta name="twitter:card" content="summary_large_image">`,
			'meta-tags.html',
		);
	},
);
