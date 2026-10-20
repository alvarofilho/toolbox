# Tool error localization inventory

Issue: [#10](https://github.com/alvarofilho/toolbox/issues/10)

This is a coverage ledger for incremental migration. Adding a translation key alone does not count as coverage: the algorithm must throw a typed error, the workbench must show it in the active locale and associate it with the relevant control, and tests must exercise the result.

## Migrated in this increment

| Area                                   | Input and outcome                                                                                                                                                                                                                       | Coverage                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| JSON formatter, validator and JSONPath | JSON syntax failures carry line and column; object-only operations identify the shape requirement; invalid JSONPath is actionable and marked on the path field.                                                                         | `common.json_syntax_error`, `common.json_object_required`, `tools.jsonpath.invalid_expression`; tested in `catalog.test.ts`. |
| JWT decoder                            | Base64 and compact-token format errors are localized; decoded segments must be JSON objects. Signature verification remains explicitly out of scope for the decoder.                                                                    | `common.invalid_base64`, `tools.jwt.invalid_token_format`, `tools.jwt.invalid_json_segment`.                                 |
| CPF/CNPJ                               | Validation result is language-neutral structured JSON (`valid` and document `type`) instead of a PT/EN compound sentence. Existing examples exercise valid documents.                                                                   | `catalog.test.ts`.                                                                                                           |
| PDF page operations                    | Operation, file count/type, malformed PDF, page limit/range, deletion and rotation failures are localized and attached to the appropriate file or option field. Guidance includes a concrete extraction input and resulting page count. | `tools.pdf-pages.*`; file and workbench errors use typed keys.                                                               |
| PDF conversion                         | File selection, invalid PDF, page limit, canvas/export/compression and operation failures are localized. Guidance includes image-to-PDF and text-extraction examples, plus the OCR limitation for scanned pages.                        | `tools.pdf-convert.*`.                                                                                                       |
| Shared file controls                   | Missing files, single-file selection, and file count/size limits use localized errors associated with the file control.                                                                                                                 | `common.select_files_to_continue`, `common.select_one_file_to_continue`, `common.file_size_or_count_limit`.                  |

All new message keys above exist in PT/EN/ES. The generic workbench no longer marks every tool failure as an error in the `input` field; only typed errors with an explicit control key mark a field.

## Remaining inventory

The codebase scan below finds files with product or library errors still thrown as plain `Error`. They remain pending classification into product validation, parse failure, size limit, unsupported input, cancellation, or library diagnostic. Library details must be reviewed before exposure because they can contain user input.

```sh
rg -n 'throw new Error' src/app/features/tools --glob '!**/schemas/**' --glob '!**/*.test.ts'
```

Known pending groups from this scan:

- Brazilian tools: `src/app/features/tools/brazilian/` (document generation/formatting, state registration, NF-e, PIX, RENAVAM, synthetic people and test numbers).
- Converters: `src/app/features/tools/converters/` (date, binary/text, base conversion, punycode).
- Database: `src/app/features/tools/database/` (connection strings, DDL, .NET ticks, GUIDs).
- Development: `src/app/features/tools/development/` (curl, cron, HTTP, OpenAPI, regex, SQL formatting, semver, XML).
- Frontend: `src/app/features/tools/frontend/` (color, contrast, layout, favicon and sizing).
- Generators: `src/app/features/tools/generators/` (dates, QR, data and phone).
- Infrastructure: `src/app/features/tools/infrastructure/` (environment files, logs, Kubernetes, Docker Compose, DNS, IP, permissions and Git ignore).
- Security: `src/app/features/tools/security/` (AES, ASN.1, certificates, CRL, CSP, HMAC, PEM/JWK, P12/P7B and timestamp requests).
- Text/PDF/image: `src/app/features/tools/text/` (forms, inspection, overlays, CSV, image processing and SVG, including third-party parse failures).
- Utilities: `src/app/features/tools/utilities/` (bcrypt, auth, API proxy, keycode, math, MIME, OTP, percentage, random numbers, RSA, rule of three, temperature and TOML).
- Shared algorithms and remaining data tools: `src/app/features/tools/_shared/`, `src/app/features/tools/json/`, `src/app/features/tools/mercosur/`.

The umbrella issue is not fully covered by this increment. Continue migration by category, updating this ledger with each completed set and its tests.
