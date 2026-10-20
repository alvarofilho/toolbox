# Toolbox

[English](README.md)

Uma bancada de ferramentas gratuita e open source para desenvolvedores, QA e profissionais de TI. Sem conta, backend, SSR, analytics ou envio das entradas. O processamento acontece no navegador.

## Começar

Requer Node **24.22.0** (`.node-version`) e pnpm **12.14.0** (`packageManager`). Instale as dependências e inicie o servidor Angular:

```sh
pnpm install
pnpm start
```

O servidor abre em `http://localhost:4200`. O desenvolvimento, os testes e o build usam o Angular CLI.

```sh
pnpm start                         # ng serve
pnpm run lint                      # ng lint, TypeScript e templates Angular
pnpm run lint:fix                  # aplica correções disponíveis pelo ESLint
pnpm run format                    # formata com Prettier
pnpm run format:check              # verifica formatação
pnpm run test --watch=false        # ng test, testes unitários e de integração
pnpm run build                     # ng build, produção
```

O build estático fica em `dist/cloudflare/browser`. A configuração mantém `strict` e `strictTemplates` habilitados. A integração contínua verifica formatação, lint, testes e build em pushes para `main` e Pull Requests.

A inicialização do tema fica em `public/theme-init.js`, carregado antes do conteúdo para evitar mudança visual e permitir a CSP `script-src 'self'`. A produção também desabilita a inserção de CSS crítico (`optimization.styles.inlineCritical: false`), pois o carregador inline gerado pelo Angular seria bloqueado pela mesma política. Mantenha essas opções alinhadas à CSP em `public/_headers`.

O Tailwind procura classes explicitamente em `src/**/*.html`, pois todos os componentes usam templates externos. Varrer definições de ferramentas, schemas e traduções também gera estilos para palavras dos dados que coincidem com classes do Tailwind ou DaisyUI. Mantenha as classes nos templates e registre em `src/tailwind.css` eventuais arquivos com templates inline.

`allowedCommonJsDependencies` em `angular.json` registra as exceções CommonJS existentes, incluindo dependências transitivas de certificados, Temporal, PDF e formatação SQL. A lista desativa avisos apenas para esses módulos; não os converte para ESM nem reduz seu tamanho. Mantenha as implementações carregadas sob demanda e revise as exceções ao atualizar dependências. Novas dependências CommonJS continuam gerando avisos. O [README em inglês](README.md) detalha os módulos e seus usos.

Os headers usam `Cache-Control: public, max-age=0, must-revalidate, no-transform` para preservar os arquivos publicados e impedir injeção automática de scripts pelo proxy Cloudflare, incluindo Rocket Loader e Web Analytics. O navegador revalida os recursos com o servidor; não habilite otimizações que reescrevam o HTML desta aplicação.

`deployUrl: "/"` mantém os caminhos de scripts, estilos e preloads ancorados na raiz. Isso evita que os Early Hints do Cloudflare resolvam um chunk relativo dentro de `/tools/` ao abrir uma ferramenta diretamente.

## Catálogo de ferramentas

O catálogo foi ampliado para todas as categorias da especificação. Consulte [o catálogo implementado e os limites de cada ferramenta](docs/CATALOG.md) para geradores, JSON/dados, conversores, segurança, desenvolvimento/APIs, banco de dados/.NET, documentos brasileiros, redes, texto/arquivos e CSS/frontend. As funções que antes eram oferecidas apenas dentro de outras ferramentas também têm páginas independentes.

As ferramentas originais continuam disponíveis:

| Área                    | Ferramentas                                                 |
| ----------------------- | ----------------------------------------------------------- |
| JSON e dados            | Formatter/Validator, Minifier, Diff estrutural, JSON ↔ YAML |
| Codificação             | Base64 UTF-8, URL component encode/decode, Unix Timestamp   |
| Geradores               | UUID v4/v7, senhas, tokens com Web Crypto                   |
| Segurança               | JWT Decoder/claims, SHA-256/SHA-512                         |
| Desenvolvimento e texto | Regex Tester, Text Diff por linhas, Case Converter          |
| Brasil                  | CPF, CNPJ numérico/alfanumérico, pessoas sintéticas         |

As ferramentas possuem rotas próprias e módulos carregados sob demanda. O catálogo, a pesquisa por nomes/categorias/palavras-chave, os favoritos, os recentes, o tema e o idioma PT/EN compartilham um registro central. `Ctrl/Cmd + K` foca a pesquisa global. `Escape` fecha a navegação móvel. As páginas incluem exemplos quando úteis, limpar, copiar, exportar, erros e estados vazios. A bancada também aceita arquivos locais, download de resultados binários e prévias isoladas em sandbox.

Pessoas: selecione quantidade (1–1.000), campos, UF e intervalo de idade (18–100), com exportação JSON, CSV ou SQL INSERT. E-mails usam `example.com`. Os telefones são sintéticos com DDD 11; a UF é um parâmetro independente. Os registros incluem `synthetic: true`.

## Arquitetura

```text
src/app/
  core/models/                contratos de ferramentas e campos
  core/services/              Signals e preferências locais validadas
  shared/components/          ícone SVG genérico
  features/home/              início, catálogo, categorias, favoritos e recentes
  features/tools/
    catalog/                  metadados, carregamento, categorias e pesquisa
      tool-card/              cards de ferramentas
      command-palette/        pesquisa global e navegação
    workbench/                execução, entradas, resultados e exportação
    json/, security/, .../    definições e auxiliares agrupados por área
    infrastructure/schemas/   schemas Kubernetes locais
    _shared/                  controles e algoritmos usados entre áreas
  app.*                       shell responsivo, configuração e rotas
```

Para adicionar uma ferramenta, crie `features/tools/<categoria>/<id>.tool.ts` exportando `definition: ToolDefinition`. Adicione um registro no catálogo da categoria em `features/tools/catalog/`, incluindo os metadados e a função `loadDefinition`. As rotas são derivadas desses registros, portanto a nova ferramenta não exige um mapa de carregamento ou uma rota cadastrados separadamente. A definição descreve os controles e a função de processamento; a bancada fornece formulário, estados e exportação. Adicione vetores e casos inválidos em `*.test.ts`; use `*.spec.ts` para integração Angular. Não adicione cards disponíveis sem uma implementação funcional.

Cada registro importa sua implementação dinamicamente. O catálogo permanece leve: parsers e processadores pesados ficam nas implementações. Mantenha auxiliares e seus testes junto da área responsável; use `_shared` para comportamentos utilizados entre áreas. Schemas Kubernetes e workers continuam locais e carregados sob demanda.

Angular 22 standalone, OnPush, Signals, lazy loading, Tailwind CSS 4 e DaisyUI 5. Fontes Manrope/IBM Plex são hospedadas pelo próprio build. Parsers, formatos, imagens e PDFs usam bibliotecas específicas; as operações criptográficas usam Web Crypto.

## Privacidade e limites

`localStorage` guarda somente `toolbox.preferences.v1`: tema, idioma, IDs favoritos e até oito ferramentas recentes. Os valores são validados na leitura. Se o armazenamento estiver bloqueado, o app continua na sessão e informa que não poderá persistir as preferências. Entradas, resultados, senhas, tokens e documentos não são persistidos. Exportar ou copiar exige uma ação explícita.

Limites: 100.000 caracteres por campo, 200.000 no total, resultado de até 1 MB de caracteres e geradores limitados a 1.000 registros. Regex roda em Web Worker encerrado após 500 ms, limitado a 1.000 resultados e padrões de 1.000 caracteres. Diffs têm limite de tempo/complexidade. YAML limita expansão de aliases e rejeita chaves duplicadas e estruturas recursivas. Não há `eval` ou renderização do HTML informado.

JWT é **decodificado**, sem verificar assinatura ou autenticidade. Datas dos claims são informativas. Hash não é criptografia reversível. CPF/CNPJ validam a estrutura e os dígitos; não consultam cadastros nem comprovam existência. Toda geração brasileira destina-se a testes. O vetor alfanumérico `12.ABC.345/01DE-35` segue o [manual da Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf).

## Cloudflare Pages

O ambiente de produção usa o projeto Pages `toolbox` e o domínio **[toolbox.alvaro.dev.br](https://toolbox.alvaro.dev.br)**. O projeto está integrado ao GitHub, com publicação automática da branch `main` e previews habilitados. DNS e certificado do domínio são gerenciados pelo Cloudflare. Credenciais do Wrangler ficam fora do repositório.

Configuração do projeto `toolbox`, conectado a `alvarofilho/toolbox` no Cloudflare Pages:

| Configuração       | Valor                     |
| ------------------ | ------------------------- |
| Branch de produção | `main`                    |
| Diretório raiz     | `/`                       |
| Build              | `pnpm run build`          |
| Diretório de saída | `dist/cloudflare/browser` |
| `NODE_VERSION`     | `24.22.0`                 |
| `PNPM_VERSION`     | `12.14.0`                 |

O Pages instala as dependências antes do build. Não é necessário configurar SSR, Functions ou credenciais no frontend. `public/_redirects` fornece fallback para o Angular Router; `_headers` aplica CSP, proteção contra framing e permissões restritas. Após publicar, valide acesso direto e atualização em `/tools/json-formatter` e `/tools/regex`, além de copiar, exportar e executar regex sob CSP.

Associe `toolbox.alvaro.dev.br` em **Custom domains**, conclua o DNS indicado pelo Cloudflare e aguarde HTTPS ativo. Ative previews de Pull Requests no projeto Pages quando desejar. Um projeto Pages integrado ao Git atende os deploys automáticos da `main`; o workflow deste repositório faz a validação.

Referências: [Angular no Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/), [versões do ambiente de build](https://developers.cloudflare.com/pages/configuration/build-image/) e [rotas SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Licença

MIT. Consulte [LICENSE](LICENSE).
