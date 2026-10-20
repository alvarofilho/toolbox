# Toolbox

[Português (Brasil)](README.pt-BR.md)

A free, open-source collection of browser-based tools for developers, QA, and IT professionals. No account, backend, SSR, analytics, or input uploads: processing happens in your browser.

## Getting started

Requires Node.js **24.22.0** (`.node-version`) and pnpm **12.14.0** (`packageManager`). Install dependencies and start the Angular development server:

```sh
pnpm install
pnpm start
```

The app opens at `http://localhost:4200`. Development, tests, and production builds use the Angular CLI.

```sh
pnpm start                         # ng serve
pnpm run lint                      # ng lint, TypeScript, and Angular templates
pnpm run lint:fix                  # apply available ESLint fixes
pnpm run format                    # format with Prettier
pnpm run format:check              # check formatting
pnpm run test --watch=false        # ng test, unit and integration tests
pnpm run build                     # ng build, production
```

The static build is written to `dist/cloudflare/browser`. Both TypeScript `strict` mode and Angular `strictTemplates` are enabled. CI checks formatting, lint, tests, and the production build on pushes to `main` and pull requests.

Theme initialization lives in `public/theme-init.js` and uses `defer` so its request does not block the first render. Production inlines critical CSS and defers the remaining styles. The CSP in `public/_headers` allows the fixed Beasties stylesheet loader by SHA-256 hash; update that hash if the loader script changes.

Tailwind scans `src/**/*.html` explicitly because all components use external templates. Scanning tool definitions, schemas, and translations also generates styles for data tokens that happen to match utility or DaisyUI class names. Keep UI classes in templates; register any future inline-template sources in `src/tailwind.css`.

`allowedCommonJsDependencies` in `angular.json` records the existing CommonJS exceptions: CSV (`papaparse`), certificates (`reflect-metadata`, `pvtsutils`), QR codes (`qrcode`), ZIP files (`jszip`), versions (`semver`), JSON Schema (`jsonschema`), IP addresses (`ipaddr.js`), shell arguments (`shell-quote`), date arithmetic (`jsbi` via Temporal), PostgreSQL parsing (`node-sql-parser/build/postgresql`), cron (`cron-parser`, `cronstrue`), PDFs (`pako` via pdf-lib), and SQL formatting (`nearley`). This suppresses warnings for those specific modules; it does not convert them to ESM or reduce their size. Keep implementations lazy-loaded and review the exceptions when upgrading dependencies. New CommonJS dependencies still produce warnings.

The response headers set `Cache-Control: public, max-age=0, must-revalidate, no-transform` to preserve published assets and prevent Cloudflare proxy features such as Rocket Loader and Web Analytics from injecting scripts. Browsers revalidate assets with the server. Do not enable HTML rewriting optimizations for this app.

`deployUrl: "/"` keeps scripts, styles, and preload paths rooted at the site origin. This prevents Cloudflare Early Hints from resolving a relative chunk inside `/tools/` when a user opens a tool directly.

## Tool catalog

The catalog includes independent tools across data generation, JSON and data, converters, security, development and APIs, databases and .NET, Brazilian documents, networking, text and files, and CSS/frontend. See the [implemented catalog and each tool's limitations](docs/CATALOG.md) for details. Features that used to be available only inside other tools also have their own pages.

The original tools remain available:

| Area                 | Tools                                                       |
| -------------------- | ----------------------------------------------------------- |
| JSON and data        | Formatter/Validator, Minifier, structural Diff, JSON ↔ YAML |
| Encoding             | UTF-8 Base64, URL component encode/decode, Unix Timestamp   |
| Generators           | UUID v4/v7, passwords, tokens using Web Crypto              |
| Security             | JWT Decoder/claims, SHA-256/SHA-512                         |
| Development and text | Regex Tester, line-based Text Diff, Case Converter          |
| Brazil               | Numeric/alphanumeric CPF and CNPJ, synthetic people         |

Each tool has its own route and is lazy-loaded. The catalog, search by name/category/keyword, favorites, recent tools, theme, and PT/EN language share a central registry. `Ctrl/Cmd + K` focuses global search. `Escape` closes mobile navigation. Tool pages include examples where useful, clear, copy, export, error, and empty states. The workbench also accepts local files, downloads binary results, and shows isolated previews in a sandbox.

For generated people, choose 1–1,000 records, fields, state, and an age range of 18–100; export as JSON, CSV, or SQL INSERT. Emails use `example.com`. Phone numbers are synthetic and use area code 11; the selected state is an independent parameter. Records include `synthetic: true`.

## Architecture

```text
src/app/
  core/models/                tool and field contracts
  core/services/              Signals and validated local preferences
  shared/components/          generic SVG icon
  features/home/              home, catalog, categories, favorites, and recents
  features/tools/
    catalog/                  metadata, lazy loaders, categories, and search
      tool-card/              tool cards
      command-palette/        global tool search and navigation
    workbench/                tool execution, inputs, results, and exports
    json/, security/, .../    definitions and helpers grouped by area
    infrastructure/schemas/   local Kubernetes schemas
    _shared/                  controls and algorithms used across tool areas
  app.*                       responsive shell, configuration, and routes
```

To add a tool, create `features/tools/<category>/<id>.tool.ts` exporting `definition: ToolDefinition`. Add one registration to the corresponding category catalog in `features/tools/catalog/`, including its metadata and `loadDefinition` callback. Routes derive from these registrations, so adding a tool requires no separate loader map or route entry. A definition describes its controls and processing function; the workbench provides the form, states, and export behavior. Add vectors and invalid cases in `*.test.ts`; use `*.spec.ts` for Angular integration tests. Do not add available cards without a working implementation.

Each registration dynamically imports its tool implementation. The catalog remains lightweight: heavy parsers and processors belong in the implementations. Keep helpers and their tests in the area that owns them; use `_shared` for behavior needed by multiple areas. Kubernetes schemas and workers remain local and load on demand.

The app uses Angular 22 standalone components, OnPush, Signals, lazy loading, Tailwind CSS 4, and DaisyUI 5. Manrope and IBM Plex fonts are bundled locally. Parsers, data formats, images, and PDFs use dedicated libraries; cryptographic operations use Web Crypto.

## Privacy and limits

`localStorage` stores only `toolbox.preferences.v1`: theme, language, favorite IDs, and up to eight recent tool IDs. Values are validated when read. If storage is blocked, the app continues for the current session and explains that preferences cannot be saved. Inputs, results, passwords, tokens, and documents are not stored. Exporting or copying requires an explicit user action.

Limits: 100,000 characters per field, 200,000 characters total, output up to 1 MB of text, and generators capped at 1,000 records. Regex runs in a Web Worker terminated after 500 ms, with up to 1,000 results and patterns up to 1,000 characters. Diffs have time and complexity limits. YAML limits alias expansion and rejects duplicate keys and recursive structures. User-provided HTML is never evaluated or rendered directly.

JWTs are **decoded**, not signature-verified or authenticated; claim dates are informational. Hashing is not reversible encryption. CPF/CNPJ checks validate structure and check digits; they do not query registries or prove that a record exists. Brazilian data generation is intended for testing. The alphanumeric CNPJ vector `12.ABC.345/01DE-35` follows the [Federal Revenue Service manual](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf).

## Cloudflare Pages

Production uses the Cloudflare Pages project `toolbox` and the domain **[toolbox.alvaro.dev.br](https://toolbox.alvaro.dev.br)**. The project is connected to GitHub and automatically publishes `main`; preview deployments are enabled. Cloudflare manages DNS and the domain certificate. Wrangler credentials stay outside this repository.

Cloudflare Pages project configuration for `toolbox`, connected to `alvarofilho/toolbox`:

| Setting           | Value                     |
| ----------------- | ------------------------- |
| Production branch | `main`                    |
| Root directory    | `/`                       |
| Build command     | `pnpm run build`          |
| Output directory  | `dist/cloudflare/browser` |
| `NODE_VERSION`    | `24.22.0`                 |
| `PNPM_VERSION`    | `12.14.0`                 |

Pages installs dependencies before building. The frontend does not require SSR, Functions, or credentials. `public/_redirects` provides Angular Router fallback; `_headers` applies CSP, framing protection, and restricted permissions. After publishing, check direct access and reload at `/tools/json-formatter` and `/tools/regex`, along with copy, export, and regex execution under the CSP.

Add `toolbox.alvaro.dev.br` under **Custom domains**, complete the DNS setup Cloudflare provides, and wait for HTTPS to become active. Enable pull request previews in the Pages project as needed. A Git-connected Pages project handles automatic deploys from `main`; this repository's workflow runs validation.

References: [Angular on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/), [build environment versions](https://developers.cloudflare.com/pages/configuration/build-image/), and [SPA routes](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## License

MIT. See [LICENSE](LICENSE).
