# toolbox.

Uma bancada de ferramentas gratuita e open source para desenvolvedores, QA e profissionais de TI. Sem conta, backend, SSR, analytics ou envio das entradas. O processamento acontece no navegador.

## Começar

Requer Node **24.22.0** (`.node-version`), pnpm **12.14.0** (`packageManager`) e Vite+ (`vp`). Com `vp` global já instalado:

```sh
vp install
vp run start
```

Sem o CLI global, use `pnpm install --frozen-lockfile` e `pnpm exec vp run start`. A aplicação abre em `http://localhost:4200`. O desenvolvimento e o build usam o Angular CLI; `vp dev` e `vp build` não substituem os scripts Angular deste projeto.

```sh
vp check                         # formato, lint e tipos
vp check --fix                    # corrigir formatação
vp test                          # 101 testes de processamento (Vitest via Vite+)
vp run test --watch=false         # 6 testes de integração Angular (Vitest)
vp run build                     # Angular CLI, produção
```

O build estático fica em `dist/cloudflare/browser`. A configuração mantém `strict` e `strictTemplates` habilitados. A integração contínua executa instalação congelada, checks, as duas suítes e build em pushes para `main` e Pull Requests.

A produção desabilita apenas a inserção de CSS crítico (`optimization.styles.inlineCritical: false`): o carregador inline gerado pelo Angular seria bloqueado por `script-src 'self'`. Scripts e CSS continuam minificados. Mantenha essa opção alinhada à CSP em `public/_headers`.

## MVP funcional

| Área                    | Ferramentas                                                 |
| ----------------------- | ----------------------------------------------------------- |
| JSON e dados            | Formatter/Validator, Minifier, Diff estrutural, JSON ↔ YAML |
| Codificação             | Base64 UTF-8, URL component encode/decode, Unix Timestamp   |
| Geradores               | UUID v4/v7, senhas, tokens com Web Crypto                   |
| Segurança               | JWT Decoder/claims, SHA-256/SHA-512                         |
| Desenvolvimento e texto | Regex Tester, Text Diff por linhas, Case Converter          |
| Brasil                  | CPF, CNPJ numérico/alfanumérico, pessoas sintéticas         |

As 18 ferramentas possuem rotas e módulos carregados sob demanda. O catálogo, a pesquisa por nomes/categorias/palavras-chave, os favoritos, os recentes, o tema e o idioma PT/EN compartilham um registro central. `Ctrl/Cmd + K` foca a pesquisa global. `Escape` fecha a navegação móvel. As páginas incluem exemplos quando úteis, limpar, copiar, exportar, erros e estados vazios.

Pessoas: selecione quantidade (1–1.000), campos, UF e intervalo de idade (18–100), com exportação JSON, CSV ou SQL INSERT. E-mails usam `example.com`. Os telefones são sintéticos com DDD 11; a UF é um parâmetro independente. Os registros incluem `synthetic: true`.

## Arquitetura

```text
src/app/
  core/models/        contratos de ferramentas e campos
  core/registry/      catálogo declarativo, categorias e pesquisa
  core/services/      Signals e preferências locais validadas
  shared/components/  SVGs, cards e bancada de entrada/resultado
  shared/utils/       algoritmos puros e testes
  features/home/      início, catálogo, categorias, favoritos e recentes
  features/tools/     um módulo por ferramenta, controles e regex Worker
  app.*               shell responsivo, configuração e rotas
```

Para adicionar uma ferramenta, crie um `*.tool.ts` exportando `definition: ToolDefinition`, registre seus metadados em `core/registry/tools.ts` e seu import dinâmico em `TOOL_LOADERS` (`app.routes.ts`). A definição descreve os controles e a função de processamento; a bancada compartilhada fornece formulário, estados e exportação. Adicione vetores e casos inválidos em `*.test.ts`; use `*.spec.ts` para integração Angular. Não adicione cards disponíveis sem uma implementação funcional.

Angular 22 standalone, OnPush, Signals, lazy loading, Tailwind CSS 4 e DaisyUI 5. Fontes Manrope/IBM Plex são hospedadas pelo próprio build. Apenas `yaml` e `diff` foram adicionados para formatos e comparação; criptografia usa as APIs nativas.

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
| Build              | `pnpm exec vp run build`  |
| Diretório de saída | `dist/cloudflare/browser` |
| `NODE_VERSION`     | `24.22.0`                 |
| `PNPM_VERSION`     | `12.14.0`                 |

O Pages instala as dependências antes do build. Não é necessário configurar SSR, Functions ou credenciais no frontend. `public/_redirects` fornece fallback para o Angular Router; `_headers` aplica CSP, proteção contra framing e permissões restritas. Após publicar, valide acesso direto e atualização em `/tools/json-formatter` e `/tools/regex`, além de copiar, exportar e executar regex sob CSP.

Associe `toolbox.alvaro.dev.br` em **Custom domains**, conclua o DNS indicado pelo Cloudflare e aguarde HTTPS ativo. Ative previews de Pull Requests no projeto Pages quando desejar. Um projeto Pages integrado ao Git atende os deploys automáticos da `main`; o workflow deste repositório faz a validação.

Referências: [Angular no Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/), [versões do ambiente de build](https://developers.cloudflare.com/pages/configuration/build-image/) e [rotas SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Validação desta entrega

- 101 testes de algoritmos/conversores/validadores e 6 integrações Angular.
- Smoke test no navegador das 18 ferramentas, incluindo geração e exemplos reais.
- Regex patológica interrompida por timeout sem bloquear a interface; execução seguinte recuperada.
- Revisão visual em desktop (1440 px), tablet (768 px) e mobile (390 px), temas claro/escuro e PT/EN.
- Build de produção e verificação de formatação/lint/tipos.
- Após cada publicação, conferir o status do deploy, HTTPS público e navegação direta no domínio próprio.

Fases 2 e 3 ficam fora deste MVP. O funcionamento offline completo/PWA não está implementado; o processamento local não significa que o primeiro carregamento dispensa internet.

## Licença

MIT. Consulte [LICENSE](LICENSE).
