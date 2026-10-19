# Cobertura da auditoria UI/UX — 19/10/2026

167 ferramentas: definições e controles lidos; rotas percorridas em desktop de 1440 px e celular de 390 e 320 px. A passagem por rota verifica renderização, limites da viewport e controles; não certifica todos os algoritmos, arquivos, operações ou traduções.

Também foram inspecionados home, catálogo, todas as 12 categorias, favoritos vazio, recentes preenchido, categoria inválida, página 404, menu móvel e paleta de comandos. Exemplos de JSON Minifier e Text Diff e entrada decimal de temperatura foram exercitados separadamente.

## json — 17

| Ferramenta              | Rota                           |
| ----------------------- | ------------------------------ |
| JSON Formatter          | `/tools/json-formatter`        |
| JSON Minifier           | `/tools/json-minifier`         |
| JSON Diff               | `/tools/json-diff`             |
| JSON ↔ YAML             | `/tools/json-yaml`             |
| JSON Validator          | `/tools/json-validator`        |
| JSON Viewer             | `/tools/json-viewer`           |
| JSONPath Tester         | `/tools/jsonpath`              |
| JSON Schema Validator   | `/tools/json-schema`           |
| JSON para TypeScript    | `/tools/json-typescript`       |
| JSON para interfaces C# | `/tools/json-csharp-interface` |
| JSON para CSV           | `/tools/json-csv`              |
| CSV para JSON           | `/tools/csv-json`              |
| JSON para YAML          | `/tools/json-to-yaml`          |
| YAML para JSON          | `/tools/yaml-to-json`          |
| JSON para XML           | `/tools/json-xml`              |
| JSON para SQL INSERT    | `/tools/json-sql`              |
| JSON Schema Faker       | `/tools/schema-faker`          |

## converters — 13

| Ferramenta                      | Rota                    |
| ------------------------------- | ----------------------- |
| Base64 Encoder / Decoder        | `/tools/base64`         |
| URL Encoder / Decoder           | `/tools/url`            |
| Unix Timestamp                  | `/tools/timestamp`      |
| HTML Entities Encode/Decode     | `/tools/html-entities`  |
| Unicode Converter               | `/tools/unicode`        |
| Hexadecimal Converter           | `/tools/hex`            |
| Binário / Decimal / Hexadecimal | `/tools/base-converter` |
| Date Converter                  | `/tools/date`           |
| Timezone Converter              | `/tools/timezone`       |
| Text to Binary                  | `/tools/text-binary`    |
| Binary to Text                  | `/tools/binary-text`    |
| Markdown Preview                | `/tools/markdown`       |
| Punycode Converter              | `/tools/punycode`       |

## generators — 13

| Ferramenta                  | Rota                    |
| --------------------------- | ----------------------- |
| Gerador de UUID             | `/tools/uuid`           |
| Gerador de senhas           | `/tools/password`       |
| Gerador de tokens e chaves  | `/tools/token`          |
| Gerador de empresas         | `/tools/company`        |
| Gerador de endereços        | `/tools/address`        |
| Gerador de e-mails          | `/tools/email`          |
| Gerador de telefones        | `/tools/phone`          |
| Gerador de ULID             | `/tools/ulid`           |
| Gerador de GUID             | `/tools/guid`           |
| Gerador de datas aleatórias | `/tools/random-date`    |
| Gerador de Lorem Ipsum      | `/tools/lorem`          |
| Gerador de QR Code          | `/tools/qr`             |
| Gerador de massa de dados   | `/tools/data-generator` |

## security — 21

| Ferramenta                                 | Rota                       |
| ------------------------------------------ | -------------------------- |
| JWT Decoder                                | `/tools/jwt`               |
| Gerador de hash SHA                        | `/tools/sha`               |
| HMAC Generator                             | `/tools/hmac`              |
| AES Encrypt/Decrypt                        | `/tools/aes`               |
| JWT Claims Analyzer                        | `/tools/jwt-claims`        |
| PEM Decoder                                | `/tools/pem`               |
| PEM para JWK                               | `/tools/pem-jwk`           |
| ASN.1 Decoder                              | `/tools/asn1`              |
| X.509 Certificate Viewer                   | `/tools/x509`              |
| CSR Decoder                                | `/tools/csr`               |
| Certificate Chain Inspector                | `/tools/certificate-chain` |
| File Hash Calculator                       | `/tools/file-hash`         |
| CSP Generator                              | `/tools/csp`               |
| SRI Hash Generator                         | `/tools/sri`               |
| Webhook Signature Generator                | `/tools/webhook-signature` |
| Explorador de PKCS#12/P12                  | `/tools/p12-explorer`      |
| Criador de pacote P7B                      | `/tools/p7b-bundle`        |
| Explorador de pacote P7B                   | `/tools/p7b-explorer`      |
| Explorador de CRL                          | `/tools/crl-explorer`      |
| Gerador de solicitação de carimbo de tempo | `/tools/timestamp-request` |
| Decodificador de resposta TSR              | `/tools/tsr-decoder`       |

## development — 16

| Ferramenta                  | Rota                    |
| --------------------------- | ----------------------- |
| Regex Tester                | `/tools/regex`          |
| SQL Formatter               | `/tools/sql-formatter`  |
| XML Formatter               | `/tools/xml-formatter`  |
| XML Validator               | `/tools/xml-validator`  |
| YAML Formatter              | `/tools/yaml-formatter` |
| Cron Expression Builder     | `/tools/cron-builder`   |
| Cron Expression Parser      | `/tools/cron-parser`    |
| HTTP Status Explorer        | `/tools/http-status`    |
| HTTP Header Analyzer        | `/tools/http-headers`   |
| URL Parser                  | `/tools/url-parser`     |
| cURL Generator              | `/tools/curl`           |
| JSON Patch Builder          | `/tools/json-patch`     |
| OpenAPI Viewer              | `/tools/openapi`        |
| OpenAPI Diff                | `/tools/openapi-diff`   |
| GraphQL Formatter           | `/tools/graphql`        |
| Semantic Version Comparator | `/tools/semver`         |

## utilities — 22

| Ferramenta                       | Rota                        |
| -------------------------------- | --------------------------- |
| Gerador de Basic Auth            | `/tools/basic-auth`         |
| Analisador de força de senha     | `/tools/password-strength`  |
| Gerador e validador de OTP       | `/tools/otp`                |
| Analisador de User-Agent         | `/tools/user-agent`         |
| Gerador de meta tags             | `/tools/meta-tags`          |
| Consulta de MIME types           | `/tools/mime-types`         |
| Conversor para alfabeto fonético | `/tools/nato`               |
| Calculadora de porcentagem       | `/tools/percentage`         |
| Gerador de números aleatórios    | `/tools/random-number`      |
| Gerador de chaves RSA            | `/tools/rsa-keypair`        |
| Calculadora de expressões        | `/tools/math-evaluator`     |
| Calculadora de regra de três     | `/tools/rule-of-three`      |
| Conversor de temperatura         | `/tools/temperature`        |
| Gerador de appsettings .NET      | `/tools/dotnet-appsettings` |
| Gerador de configuração de proxy | `/tools/api-proxy`          |
| Gerador e verificador bcrypt     | `/tools/bcrypt`             |
| Gerador e validador BIP39        | `/tools/bip39`              |
| Conversor JSON, YAML e TOML      | `/tools/toml-converter`     |
| Visualizador de HTML seguro      | `/tools/html-editor`        |
| Informações do dispositivo       | `/tools/device-info`        |
| Identificador de tecla           | `/tools/keycode`            |
| Decodificador de links seguros   | `/tools/safe-link`          |

## text — 14

| Ferramenta                        | Rota                      |
| --------------------------------- | ------------------------- |
| Text Diff                         | `/tools/text-diff`        |
| Conversor de texto                | `/tools/case`             |
| Contador de palavras e caracteres | `/tools/word-count`       |
| Remover linhas duplicadas         | `/tools/dedupe-lines`     |
| Ordenar linhas                    | `/tools/sort-lines`       |
| Slug Generator                    | `/tools/slug`             |
| CSV Cleaner                       | `/tools/csv-cleaner`      |
| SVG Optimizer                     | `/tools/svg-optimizer`    |
| Image Converter                   | `/tools/image-converter`  |
| Image Compressor                  | `/tools/image-compressor` |
| Image EXIF Viewer                 | `/tools/image-exif`       |
| PDF Metadata Viewer               | `/tools/pdf-metadata`     |
| PDF Merge/Split                   | `/tools/pdf-pages`        |
| File Signature Inspector          | `/tools/file-signature`   |

## brazilian — 21

| Ferramenta                             | Rota                        |
| -------------------------------------- | --------------------------- |
| Gerador e validador de CPF             | `/tools/cpf`                |
| Gerador e validador de CNPJ            | `/tools/cnpj`               |
| Gerador de pessoas                     | `/tools/person`             |
| Validador de PIS/PASEP                 | `/tools/pis`                |
| Validador de CNH                       | `/tools/cnh`                |
| Gerador de PIS/PASEP                   | `/tools/pis-generator`      |
| Gerador de CNH                         | `/tools/cnh-generator`      |
| Gerador de título de eleitor           | `/tools/voter-generator`    |
| Gerador de RG sintético                | `/tools/rg-generator`       |
| Gerador de inscrição estadual          | `/tools/ie-generator`       |
| Gerador e validador de RENAVAM         | `/tools/renavam`            |
| Gerador e validador de placas          | `/tools/plate`              |
| Gerador e validador de cartão de teste | `/tools/credit-card`        |
| Gerador de conta bancária de teste     | `/tools/bank-account`       |
| Gerador de matrícula de certidão       | `/tools/certificate-number` |
| Inscrição Estadual por UF              | `/tools/ie`                 |
| Validador de Título de Eleitor         | `/tools/voter`              |
| Chave de acesso NF-e                   | `/tools/nfe`                |
| PIX Copia e Cola Generator/Decoder     | `/tools/pix`                |
| Conversor de linha digitável de boleto | `/tools/boleto`             |
| Máscaras de documentos brasileiros     | `/tools/document-mask`      |

## mercosur — 1

| Ferramenta                   | Rota                   |
| ---------------------------- | ---------------------- |
| Gerador de dados do Mercosul | `/tools/mercosur-data` |

## database — 10

| Ferramenta                       | Rota                       |
| -------------------------------- | -------------------------- |
| SQL DDL para classes C#          | `/tools/ddl-csharp`        |
| JSON para classes C#             | `/tools/json-csharp`       |
| SQL INSERT Generator             | `/tools/sql-insert`        |
| Database Seed Generator          | `/tools/database-seed`     |
| Connection String Builder        | `/tools/connection-string` |
| .NET Ticks Converter             | `/tools/dotnet-ticks`      |
| GUID Formatter                   | `/tools/guid-formatter`    |
| C# String Escape                 | `/tools/csharp-escape`     |
| PascalCase / camelCase Converter | `/tools/pascal-camel`      |
| SQL Schema Diff                  | `/tools/sql-schema-diff`   |

## infrastructure — 11

| Ferramenta                     | Rota                    |
| ------------------------------ | ----------------------- |
| IPv4 Subnet Calculator         | `/tools/ipv4`           |
| CIDR Calculator                | `/tools/cidr`           |
| IPv6 Calculator                | `/tools/ipv6`           |
| Chmod Calculator               | `/tools/chmod`          |
| Docker Run para Docker Compose | `/tools/docker-compose` |
| Docker Compose Visualizer      | `/tools/compose-viewer` |
| .env Diff                      | `/tools/env-diff`       |
| .env Validator                 | `/tools/env-validator`  |
| Gitignore Generator            | `/tools/gitignore`      |
| Kubernetes YAML Validator      | `/tools/kubernetes`     |
| Log Parser                     | `/tools/log-parser`     |

## frontend — 8

| Ferramenta               | Rota                |
| ------------------------ | ------------------- |
| Color Converter          | `/tools/color`      |
| CSS Gradient Generator   | `/tools/gradient`   |
| CSS Box Shadow Generator | `/tools/box-shadow` |
| CSS Clamp Calculator     | `/tools/clamp`      |
| Flexbox Playground       | `/tools/flexbox`    |
| CSS Grid Playground      | `/tools/css-grid`   |
| WCAG Contrast Checker    | `/tools/contrast`   |
| Favicon Generator        | `/tools/favicon`    |
