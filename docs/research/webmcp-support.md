# Validação de suporte a WebMCP

Data: 19/10/2026. Escopo: fontes primárias, código local e descoberta/execução no navegador disponível nesta sessão. Não houve implementação na Toolbox.

## Conclusão

A Toolbox ainda não expõe ferramentas via WebMCP. O navegador desta sessão consegue descobrir e executar ferramentas na demonstração oficial, mas não encontra ferramentas na Toolbox. Há um caminho de integração compatível com a arquitetura atual, tratado como melhoria progressiva porque WebMCP permanece uma proposta experimental. [Documentação do Chrome](https://developer.chrome.com/docs/ai/webmcp)

## Suporte da plataforma

| Ambiente               | Evidência consultada                                                                                         | Interpretação                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Chrome                 | A documentação oferece origin trial desde Chrome 149 e a flag local `chrome://flags/#enable-webmcp-testing`. | Disponibilidade experimental; não equivale a suporte universal habilitado por padrão.                   |
| Edge                   | O portal oficial oferece origin trial com expiração em 30/03/2027.                                           | Experimentação mediante registro da origem; não comprova paridade entre todas as versões Chromium.      |
| Safari e Firefox       | O registro do grupo aponta discussões e posições de implementadores.                                         | Esta investigação não confirmou execução nesses navegadores; não afirma suporte ou ausência definitiva. |
| Navegador desta sessão | A demonstração oficial registrou ferramentas e uma chamada de leitura funcionou.                             | Suporte empírico nesta sessão, sem identificar produto, canal ou versão exatos.                         |

Fontes: [Chrome](https://developer.chrome.com/docs/ai/webmcp#get_started), [trial do Edge](https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/0b76fe60-b266-458e-a285-04e375c0c31a), [status mantido pelo grupo WebMCP](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md).

**Prazo do Chrome:** o [ChromeStatus](https://chromestatus.com/feature/5117755740913664), consultado também pela [API oficial](https://chromestatus.com/api/v0/features/5117755740913664), contém etapa original 149–156 para desktop, Android e WebView e uma extensão cadastrada em 28/09/2026 com `desktop_last: 162`. O resumo ainda informa `Proposed`, sem marco de lançamento geral. O portal do trial depende de JavaScript e não forneceu seus detalhes pela extração textual utilizada. Portanto, não se confirmou a aprovação/prazo final da extensão nem uma data absoluta de expiração do Chrome; não adotar automaticamente o antigo limite 156 como prazo vigente. [Registro do trial](https://developer.chrome.com/origintrials/#/view_trial/4163014905550602241)

## Contrato atual e restrições

A especificação atual coloca `modelContext` em `Document`, exige contexto seguro e define `registerTool`, `getTools` e `executeTool`. A migração do antigo `navigator.modelContext` foi discutida pelo próprio implementador; integração nova deve preferir `document.modelContext` e detectar capacidades. Não confundir presença de um polyfill com implementação nativa. [Especificação](https://webmachinelearning.github.io/webmcp/), [migração no repositório oficial](https://github.com/webmachinelearning/webmcp/issues/173)

Na API documentada do Chrome:

- `registerTool(definition, {signal})` registra uma ferramenta; abortar esse sinal remove seu registro.
- `getTools()` descobre ferramentas acessíveis; `executeTool(tool, inputObject, {signal})` executa uma ferramenta descoberta.
- O callback recebe `execute(input, {signal})`; o aplicativo precisa propagar o cancelamento para interromper trabalho real.
- Desde Chrome 153, remover o registro não deve interromper chamadas em andamento. Argumentos previamente serializados em JSON estão depreciados desde Chrome 155; a API atual recebe objeto.
- `tools` é uma Permissions Policy com padrão `self`. Iframes de outra origem precisam de delegação; exposição e descoberta entre origens exigem ainda `exposedTo` e `fromOrigins` explícitos.

Fontes: [API imperativa do Chrome](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [política `tools` no Chrome](https://developer.chrome.com/docs/ai/webmcp#permissions_policy). Os contratos são mutáveis; validar no build alvo antes de publicar.

## Angular e código existente

Angular documenta suporte experimental com `provideExperimentalWebMcpTools` e `declareExperimentalWebMcpTool`, registro vinculado ao ciclo de DI e integração opcional com Signal Forms. Há cuidados com nomes duplicados, validação de argumentos e limpeza de providers de rota. A documentação alerta que as APIs podem mudar fora de versões major. [Angular WebMCP](https://angular.dev/ai/webmcp)

Na dependência instalada (`@angular/core` 22.2.3), os dois exports existem em `@angular/core/types/core.d.ts`. A implementação em `@angular/core/fesm2022/core.mjs` resolve `document.modelContext ?? navigator.modelContext`, ignora registro quando a capacidade falta e utiliza `AbortController` para limpeza. Isso confirma disponibilidade da biblioteca instalada, não integração da aplicação.

A busca em `src`, `public`, `docs` e `package.json` não encontrou registro WebMCP anterior a esta nota. `app.config.ts` não fornece os providers experimentais; os formulários observados não têm `toolname`/`tooldescription`. `public/.well-known/ai-catalog.json` contém `specVersion: "1.0"` e `entries: []`; esse arquivo não registra ferramentas no navegador.

## Integração proposta: inferência de arquitetura

Esta seção é uma proposta baseada nos contratos locais, não uma funcionalidade já entregue:

1. Reaproveitar `ToolRegistration` (`src/app/features/tools/catalog/tool-registration.ts`) para identidade e `loadDefinition()`, preservando carregamento sob demanda.
2. Construir um adaptador a partir de `ToolDefinition` (`src/app/core/models/tool.ts`), seus controles e `run(values, files?)`. Criar JSON Schema explícito, validar dados externos e normalizar tipos antes da execução.
3. Compartilhar com a bancada suas validações, limites e tratamento de erros; chamar `run` diretamente sem essas proteções criaria um caminho inconsistente.
4. Começar por poucas transformações textuais com entradas sintéticas. Definir contrato próprio para arquivos e artefatos: `File`/`Blob` não são argumentos JSON intercambiáveis.
5. Separar cancelamento do registro e da execução. O contrato `run` atual não recebe sinal; interrupção efetiva exige evolução do executor/Workers, além de abortar uma Promise na interface.
6. Manter estado e resultado visíveis na bancada e controlar a duração dos registros. A ausência da API deve preservar o funcionamento normal.

O processamento local da Toolbox não garante que o agente consumidor mantenha os dados locais: a documentação exemplifica extensões que enviam prompts a provedores. A seleção das ferramentas expostas e os avisos sobre dados devem considerar esse limite. [Clientes de teste descritos pelo Chrome](https://developer.chrome.com/docs/ai/webmcp#imitate_an_agent_to_test_your_tools)

## Verificação empírica desta sessão

| Alvo                                                                                                                       | Descoberta pelo recurso WebMCP do navegador                                                          | Execução                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Toolbox, página inicial após renderização                                                                                  | Nenhuma ferramenta                                                                                   | Não executada: nenhuma ferramenta exposta.                                                                             |
| Toolbox, JSON Formatter após renderização                                                                                  | Nenhuma ferramenta                                                                                   | Não executada: nenhuma ferramenta exposta.                                                                             |
| [Demonstração oficial de agendamento](https://googlechromelabs.github.io/webmcp-tools/demos/explainer/) no mesmo navegador | `bookSlot`, `cancelBooking`, `getAvailability`; interface informa `document.modelContext` detectado. | `getAvailability` com data sintética `2026-10-20` retornou `{"2026-10-20":["09:00","10:00","14:00","15:00","16:00"]}`. |

O controle positivo distingue ausência de integração da Toolbox de incapacidade geral do navegador usado. Não foram alterados flags ou perfil do navegador. A versão exata e inspeção direta irrestrita da API nativa não foram confirmadas: o avaliador CUA possui superfície restrita e a conexão DevTools encontrou perfil ocupado. Não houve teste de cancelamento, cenários entre origens ou execução WebMCP da Toolbox.

Pendências para uma implementação futura: comparar resultado WebMCP e UI, validar argumentos inválidos e limites, confirmar cleanup em navegação, testar cancelamento real e comportamento sem API, verificar CSP/Permissions Policy no ambiente publicado e registrar navegador/versão/token usados. Uma PWA não fornece suporte WebMCP automaticamente.
