# Catálogo implementado

O catálogo solicitado foi integrado à bancada existente. Cada item tem rota própria, formulário, processamento local, copiar/exportar e identificação no registro central. O registro também mantém o conversor combinado JSON ↔ YAML e ferramentas adicionadas em outras frentes do projeto.

## Geradores de dados

CPF; CNPJ numérico e alfanumérico; pessoas; empresas; endereços; e-mails; telefones; UUID v4/v7; ULID; senhas; tokens; GUID; datas aleatórias; Lorem Ipsum; QR Code; massa de dados.

Pessoas mantêm seleção de campos, quantidade, UF e idades, com JSON/CSV/SQL INSERT. Os novos geradores de registros também exportam JSON/CSV/SQL. E-mails usam `example.com`. Endereços e documentos não consultam cadastros; registros recebem `synthetic: true`. O gerador genérico aceita um objeto de campos com tipos `uuid`, `name`, `email`, `integer`, `boolean`, `date`, `cpf`, `cnpj` ou `string`.

## JSON e dados

Formatter; Minifier; Validator; Diff; Viewer com árvore expansível; JSONPath; JSON Schema Validator; TypeScript; interfaces C#; CSV nos dois sentidos; YAML nos dois sentidos; XML; SQL INSERT; JSON Schema Faker.

Validação JSON Schema usa Draft 7. JSONPath usa interpretador seguro para filtros. JSONPath, validação e geração por schema executam em Worker com limite de dois segundos no navegador. Referências externas não são buscadas automaticamente. Geração por schema produz um envelope identificado como sintético e verifica o dado gerado contra o schema. CSV exportado neutraliza fórmulas de planilha.

## Codificação e conversores

Base64 UTF-8; URL component; HTML entities; escapes Unicode; texto/hexadecimal; bases binária/decimal/hexadecimal com BigInt; Unix Timestamp; datas ISO/BR/US/Unix; fusos IANA com tratamento de horário de verão; texto/binário nos dois sentidos; Markdown; Punycode.

Markdown é exibido em iframe com sandbox sem scripts ou acesso à origem principal, com CSP própria que bloqueia conexões e recursos externos.

## Criptografia e segurança

SHA-256/SHA-512; HMAC; AES; JWT Decoder; JWT Claims Analyzer; PEM; PEM → JWK; ASN.1; X.509; CSR; inspeção de cadeia; hash de arquivo; CSP; SRI.

AES usa AES-256-GCM, salt e IV aleatórios e PBKDF2-SHA256 com 310.000 iterações. O envelope inclui os parâmetros necessários para descriptografar e rejeita senha incorreta ou conteúdo adulterado. JWT apenas decodifica e analisa claims, sem verificar assinatura. CSR verifica a assinatura da requisição. A inspeção de cadeia verifica assinaturas entre certificados fornecidos e mostra validade temporal; não estabelece confiança de CA nem verifica revogação, hostname ou todas as políticas de certificação. PEM → JWK aceita certificado, chave pública SPKI e chave privada PKCS#8.

## Desenvolvimento e APIs

Regex; formatadores SQL/XML/YAML/GraphQL; XML Validator; Cron Builder/Parser; HTTP Status; HTTP Headers; URL Parser; cURL; JSON Patch; OpenAPI Viewer/Diff; assinatura de webhook; Semver; Text Diff.

XML Validator verifica boa formação, sem XSD. DOCTYPE/ENTITY são rejeitados. OpenAPI aceita Swagger 2.0/3.x, mostra operações e compara estruturas; não busca referências externas nem certifica compatibilidade retroativa. Webhooks oferecem HMAC SHA-256 genérico e formatos GitHub/Stripe. Cron informa as próximas dez ocorrências com fuso IANA. cURL gera comandos POSIX e não executa requisições.

## Banco de dados e .NET

SQL DDL → C#; JSON → classes C#; SQL INSERT; Database Seed; Connection Strings; .NET Ticks; GUID Formatter; C# String Escape; PascalCase/camelCase; SQL Schema Diff.

DDL e schema diff aceitam CREATE TABLE PostgreSQL; tipos sem mapeamento geram erro explícito. SQL usa identificadores entre aspas duplas e literais escapados. Connection strings suportam SQL Server, PostgreSQL/Npgsql, MySQL/MySqlConnector e SQLite. Ticks preservam precisão de 100 ns com BigInt. GUID Formatter aceita os formatos D/N/B/P/X.

## Ferramentas brasileiras

PIS/PASEP; CNH; Inscrição Estadual nas 27 UFs; Título de Eleitor; gerar/validar chave NF-e; gerar/decodificar PIX estático com CRC; validar/converter boleto; máscaras de documentos.

Validação de estrutura e dígitos não confirma existência cadastral, titularidade, dívida ou pagamento. A implementação usa submódulos locais de `@br-validators/core`, sem consulta externa. NF-e permite gerar a partir de 43 dígitos sem DV ou usar parâmetros sintéticos padrão.

## Redes e infraestrutura

IPv4; CIDR; IPv6; Chmod; Docker Run → Compose; Compose Visualizer; `.env` Diff/Validator; Gitignore; Kubernetes YAML Validator; Log Parser.

Docker Run aceita comandos POSIX com nome, portas, volumes, variáveis, rede, restart, usuário, diretório, hostname, entrypoint e env-file; opções não suportadas são rejeitadas. Logs suportam JSON Lines e Apache/Nginx combined. Gitignore oferece templates locais Node, Angular, .NET, Python, Rust, Windows, macOS e VS Code.

Kubernetes inclui schemas estritos locais da versão 1.35.0 para Pod, Service, ConfigMap, Secret, Namespace, PersistentVolumeClaim, ServiceAccount, Deployment, StatefulSet, DaemonSet, Job, CronJob, Ingress, NetworkPolicy, Role e RoleBinding. Outras versões e CRDs aceitam schema fornecido pelo usuário. A validação de schema não substitui admission, políticas e validação no servidor. A [origem e a licença dos schemas](../src/app/features/tools/extended/schemas/SOURCE.md) ficam junto dos arquivos; o script `scripts/update-kubernetes-schemas.mjs` permite atualizar de forma revisável.

## Texto e arquivos

Case Converter; contagem de palavras/caracteres; remover duplicadas; ordenar linhas; Text Diff; Slug; CSV Cleaner; SVG Optimizer; conversão/compressão de imagem; EXIF; metadados de PDF; PDF Merge/Split; inspeção de assinatura de arquivo.

Imagens raster usam os codecs do navegador, com saída PNG/JPEG/WebP; animação e metadados não são preservados. A compressão pode produzir arquivo maior e informa os tamanhos. SVG é sanitizado antes da otimização e da prévia. PDFs podem ser unidos, ter páginas extraídas ou ser divididos em ZIP; limite de 300 páginas, sem suporte a documentos criptografados ou preservação de assinaturas digitais. File Signature Inspector identifica magic bytes, sem análise de malware.

## CSS e frontend

Color Converter; gradientes; box shadow; clamp fluido; Flexbox; Grid; contraste WCAG; favicons.

Playgrounds geram CSS e prévia isolada. Contraste aceita cores opacas e calcula WCAG AA/AAA para texto normal/grande e elementos não textuais. Favicon gera ZIP com PNGs 16/32/48/180/192/512, ICO, manifest e tags HTML.

## Utilitários gerais e cobertura regional

Basic Auth; análise heurística de força de senha; TOTP; parser de User-Agent; meta tags; consulta MIME; alfabeto fonético NATO; porcentagem; regra de três; expressões matemáticas; números aleatórios; conversão de temperatura; RSA; bcrypt; BIP39 em inglês/espanhol; JSON/YAML/TOML; prévia HTML sanitizada; informações do dispositivo; identificador de tecla; decodificação de Safe Links; gerador de appsettings .NET; gerador de configuração de proxy.

O gerador regional cria registros de pessoa e empresa em JSON/CSV/SQL para Argentina, Bolívia, Brasil, Paraguai, Uruguai e Venezuela. Inclui telefone, moeda, cidade/região e identificadores sintéticos. Check digits são calculados apenas para CPF/CNPJ, CUIT argentino e RUC paraguaio; os demais ficam marcados como formato sintético. A Venezuela aparece identificada como Estado Parte suspenso. Os dados não representam pessoas, empresas ou endereços reais.

## Certificados e carimbo de tempo

PKCS#12/P12 Explorer abre o arquivo localmente, confere sua estrutura e integridade e não exibe nem envia chaves privadas. O P7B Builder cria um pacote SignedData sem assinatura; P7B Explorer lista seus certificados; CRL Explorer inspeciona a lista local sem consultar o estado atual de revogação. Timestamp Request gera uma solicitação RFC 3161 que precisa ser enviada a uma TSA; TSR Decoder mostra o status e tipo de token sem validar a assinatura ou a confiança da TSA. O API Proxy Generator produz configuração para hospedar em Nginx ou Vite; o browser não atua como proxy de rede.

## Geradores e validadores brasileiros adicionais

Geração de PIS/PASEP, CNH e título eleitoral é confirmada pelos validadores matemáticos locais. RENAVAM gera e verifica dígitos; cartões de teste geram e verificam Luhn, sem representar cartões emitidos. Inscrição estadual é gerada por UF e validada pelo algoritmo estadual disponível. RG e matrícula de certidão são apenas formatos sintéticos: as regras dependem do estado ou do cartório e não existe validação nacional única. Contas bancárias são formatos fictícios sem dígito bancário específico.

## Limites e validação

Entradas e resultados não são persistidos nem enviados. Uploads: até 20 arquivos, 20 MB cada e 50 MB somados. Saídas binárias somadas: até 50 MB. Imagens: até 40 megapixels. Permanecem os limites de texto da bancada e os limites de Regex Worker existentes.

Validação executada nesta ampliação: exemplos publicados, entradas inválidas, conversões reversíveis, vetores HMAC/SHA/SRI, AES adulterado, geração/validação de certificados e CSR, schemas Kubernetes, limites de sub-redes, PIX/NF-e/boleto, PDFs reais, rotas, seleção de arquivos, selects, sanitização SVG e isolamento de prévias. No navegador foram conferidos QR Code, JSON Schema em Worker e contraste com prévia.
