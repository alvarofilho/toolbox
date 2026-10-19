import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const catalogPath = join(root, 'src/app/features/tools/catalog');
const outputPath = join(root, 'dist/cloudflare/browser');
const origin = 'https://toolbox.alvaro.dev.br';
const sharedDescription =
	'Ferramentas online gratuitas para desenvolvedores, QA e profissionais de TI. Formate JSON, converta dados e gere documentos com processamento local no navegador.';
const htmlEscape = (value) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
const xmlEscape = (value) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

function parseSource(source, fileName) {
	return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function property(object, name) {
	return object.properties.find(
		(item) =>
			ts.isPropertyAssignment(item) && ts.isIdentifier(item.name) && item.name.text === name,
	);
}

function stringValue(initializer) {
	return initializer &&
		(ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer))
		? initializer.text
		: undefined;
}

function localizedValue(initializer) {
	if (!initializer || !ts.isCallExpression(initializer)) return undefined;
	return stringValue(initializer.arguments[0]);
}

async function readTools() {
	const files = (await readdir(catalogPath)).filter((file) => file.endsWith('.catalog.ts'));
	const tools = [];
	for (const file of files) {
		const source = parseSource(await readFile(join(catalogPath, file), 'utf8'), file);
		function visit(node) {
			if (ts.isObjectLiteralExpression(node)) {
				const id = stringValue(property(node, 'id')?.initializer);
				const available = property(node, 'available')?.initializer;
				const name = localizedValue(property(node, 'name')?.initializer);
				const description = localizedValue(property(node, 'description')?.initializer);
				if (
					id &&
					/^[a-z0-9-]+$/.test(id) &&
					available?.kind === ts.SyntaxKind.TrueKeyword &&
					name &&
					description
				) {
					tools.push({ id, name, description });
				}
			}
			ts.forEachChild(node, visit);
		}
		visit(source);
	}
	return tools.sort((a, b) => a.id.localeCompare(b.id));
}

async function readCategories() {
	const path = join(catalogPath, 'categories.ts');
	const source = parseSource(await readFile(path, 'utf8'), path);
	const categories = [];
	function visit(node) {
		if (ts.isObjectLiteralExpression(node)) {
			const id = stringValue(property(node, 'id')?.initializer);
			const name = localizedValue(property(node, 'name')?.initializer);
			if (id && /^[a-z0-9-]+$/.test(id) && name) categories.push({ id, name });
		}
		ts.forEachChild(node, visit);
	}
	visit(source);
	return categories;
}

function setMeta(html, key, value, attribute = 'name') {
	const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const tag = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`, 'i');
	const replacement = `<meta ${attribute}="${key}" content="${htmlEscape(value)}" />`;
	return tag.test(html)
		? html.replace(tag, replacement)
		: html.replace('</head>', `\t\t${replacement}\n\t</head>`);
}

function setLink(html, rel, href) {
	const tag = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, 'i');
	const replacement = `<link rel="${rel}" href="${htmlEscape(href)}" />`;
	return tag.test(html)
		? html.replace(tag, replacement)
		: html.replace('</head>', `\t\t${replacement}\n\t</head>`);
}

function createPage(template, { path, title, description, type = 'website' }) {
	const canonical = `${origin}${path}`;
	let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${htmlEscape(title)}</title>`);
	html = setMeta(html, 'description', description);
	html = setMeta(html, 'robots', 'index, follow, max-image-preview:large');
	html = setMeta(html, 'og:type', type, 'property');
	html = setMeta(html, 'og:title', title, 'property');
	html = setMeta(html, 'og:description', description, 'property');
	html = setMeta(html, 'og:url', canonical, 'property');
	html = setMeta(html, 'twitter:title', title);
	html = setMeta(html, 'twitter:description', description);
	html = setLink(html, 'canonical', canonical);
	return html;
}

const template = await readFile(join(outputPath, 'index.html'), 'utf8');
const tools = await readTools();
const categories = await readCategories();
const pages = [
	{
		path: '/',
		title: 'Ferramentas online para desenvolvedores | Toolbox',
		description: sharedDescription,
	},
	...categories.map(({ id, name }) => ({
		path: `/category/${id}`,
		title: `${name} online | Toolbox`,
		description: `Explore ferramentas online de ${name.toLowerCase()} para desenvolvedores. Gratuitas, rápidas e processadas localmente no navegador.`,
	})),
	...tools.map(({ id, name, description }) => ({
		path: `/tools/${id}`,
		title: `${name} online | Toolbox`,
		description: `${description} Ferramenta gratuita, com processamento local no navegador.`,
		type: 'website',
	})),
];

const sitemap = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];
for (const page of pages) {
	const html = createPage(template, page);
	if (page.path !== '/') {
		const filePath = join(outputPath, `${page.path.slice(1)}.html`);
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
	}
	sitemap.push(`\t<url><loc>${xmlEscape(`${origin}${page.path}`)}</loc></url>`);
}
sitemap.push('</urlset>', '');
await writeFile(join(outputPath, 'sitemap.xml'), sitemap.join('\n'));
console.log(`Generated SEO pages for ${pages.length} public routes.`);
