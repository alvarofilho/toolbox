# Task 12 — Acessibilidade e compatibilidade em fluxos essenciais

Data: 20/10/2026. Escopo: fluxos essenciais em Chromium e Firefox. Esta passagem não certifica conformidade WCAG.

## Ambiente e método

- O worktree foi servido em `http://127.0.0.1:4201`. A porta 4200 já atendia outro checkout e seus resultados foram excluídos.
- Chromium 150 foi conduzido com Playwright em contexto isolado. Foram exercitados os fluxos abaixo em 1280 × 900 e o menu móvel em 390 × 844 CSS px.
- Firefox 155 foi conduzido com geckodriver 0.37.1, perfil temporário e modo headless. O menu foi exercitado com `innerWidth` de 500 CSS px, abaixo do breakpoint móvel de 720 px.
- Resultado dos smoke tests: Chromium 15/15; Firefox 4/4 nos cenários exercitados.
- Os testes usaram dados sintéticos e um arquivo de texto de 21 bytes criado em memória. Favoritos, idioma e tema foram testados em perfis isolados ou restaurados ao estado inicial. Entradas não foram gravadas pelo aplicativo.
- O teste observou árvore acessível, semântica e regiões vivas no DOM e operou teclado real via automação WebDriver. Não substitui a leitura com NVDA, JAWS ou VoiceOver.

## Matriz de cenários

| Cenário                           | Chromium 150   | Firefox 155             | Evidência / limite                                                                                                                                                                                              |
| --------------------------------- | -------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                              | Verificado     | Renderização verificada | Título e conteúdo principal renderizam.                                                                                                                                                                         |
| Busca global                      | Verificado     | Não exercitado          | `Ctrl+K`, busca por JSON Validator, opção encontrada e Escape. Ao abrir pelo atalho, o foco retorna ao elemento previamente ativo; ao abrir pelo botão, retorna ao botão.                                       |
| Favoritos                         | Verificado     | Não exercitado          | Favoritar JSON Validator e encontrá-lo na rota de favoritos, em perfil isolado.                                                                                                                                 |
| Menu móvel                        | Verificado     | Verificado              | Ciclo `Tab` / `Shift+Tab`, fechamento por Escape, retorno ao acionador e remoção de `inert` no Chromium. No Firefox, ciclo de foco, Escape e retorno ao acionador.                                              |
| Formulário com erro               | Verificado     | Verificado              | JSON inválido expõe `role="alert"`; o campo referencia `error-input` em `aria-describedby`.                                                                                                                     |
| Processamento e resultado         | Verificado     | Verificado              | Resultado de validação anunciado pela região `role="status"`.                                                                                                                                                   |
| Upload local                      | Verificado     | Não exercitado          | Arquivo sintético de 21 bytes produz nome, tamanho, algoritmo SHA-256 e hash.                                                                                                                                   |
| Copiar resultado                  | Verificado     | Não exercitado          | Feedback “Resultado copiado.” após copiar.                                                                                                                                                                      |
| Baixar resultado                  | Verificado     | Não exercitado          | Download `result.json`, 19 bytes, conteúdo JSON válido. Arquivo de teste removido ao final.                                                                                                                     |
| Diferenças sem depender só de cor | Verificado     | Não exercitado          | Resumo textual de linhas removidas/adicionadas, sinais `−` e `+`, tabela com “old” e “new”.                                                                                                                     |
| PT / EN / ES                      | Verificado     | Não exercitado          | Rótulos e título mudam para os três idiomas.                                                                                                                                                                    |
| Tema claro / escuro               | Verificado     | Não exercitado          | Alternância em ambas as direções; estado restaurado no contexto descartável.                                                                                                                                    |
| Movimento reduzido                | Verificado     | Não exercitado          | `prefers-reduced-motion: reduce` aplicado; transição do controle medida como `0s`.                                                                                                                              |
| Zoom de texto a 200%              | Não verificado | Não verificado          | Atalhos de zoom não alteraram a escala nos navegadores headless. Como verificação substituta, o Chromium foi reduzido de 1280 para 640 CSS px sem overflow horizontal; isso não equivale a confirmar zoom real. |
| Leitor de tela                    | Não verificado | Não verificado          | Papéis e anúncios foram inspecionados no DOM/árvore acessível; não houve NVDA, JAWS ou VoiceOver.                                                                                                               |
| Safari / iPhone físico            | Não verificado | Não verificado          | Ambiente de validação em Windows sem iPhone físico. Nenhuma emulação foi apresentada como teste físico.                                                                                                         |

## Resultado

Nenhuma falha reproduzível foi encontrada nos fluxos exercitados. Não foi necessária correção de interface nesta passagem. Os testes automatizados existentes cobrem navegação por teclado, paleta, menu móvel, anúncios de erro, upload local e limites de persistência em `src/app/app.spec.ts` e `src/app/features/tools/workbench/tool-workbench.integration.spec.ts`.

## Checks do repositório

- `pnpm run lint`: passou.
- `pnpm run test --watch=false --include=src/app/app.spec.ts --include=src/app/features/tools/workbench/tool-workbench.integration.spec.ts`: passou, 30 testes.
- `pnpm run test --watch=false`: 357 de 358 testes passaram. A falha isolada é o teste de merge/extract de páginas PDF em `src/app/features/tools/catalog/tool-definitions.test.ts`, que chama `Worker` ausente no ambiente JSDOM (`ReferenceError: Worker is not defined`).
- `pnpm run build`: passou; gerou o build de produção e páginas SEO para 196 rotas.
- `pnpm run format:check`: falhou porque 349 arquivos preexistentes estão fora do padrão do Prettier. O relatório desta task passa em `pnpm exec prettier --check docs/audits/2026-10-20/task12-accessibility-compatibility.md`.

Os resultados de browser foram smoke tests headless com dados de teste, não uma certificação de acessibilidade nem uma validação de todos os algoritmos ou combinações de ferramenta.
