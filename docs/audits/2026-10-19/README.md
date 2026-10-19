# Auditoria de UI/UX — Toolbox

Data: 19/10/2026. Escopo: projeto completo. Skills aplicadas: frontend-design, impeccable (audit) e richardrx.

## Parecer

**A identidade visual funciona; o maior ganho está na operação das ferramentas.** A bancada em papel e verde, com Manrope e IBM Plex, tem consistência e combina com o público técnico. Recomendo preservar essa direção e concentrar as mudanças em legibilidade das ações, formulários específicos para cada tarefa, feedback próximo da entrada e descoberta do catálogo.

Integridade: **parcialmente aprovada**. O sistema visual é reconhecível, mas há falhas verificadas de contraste, mensagens incompletas, regras numéricas inadequadas e abstrações de formulário que chegam à experiência de uso.

**16 achados: 0 P0, 4 P1 e 12 P2.** P1 deve ser resolvido antes de uma publicação; P2 deve entrar na próxima passagem de UX. Os erros de importação observados durante movimentações simultâneas de arquivos são registrados como limitação da sessão, não como P0 permanente do produto.

## Nota de saúde

| Dimensão                   |  Nota / 4 | Evidência principal                                                                                                    |
| -------------------------- | --------: | ---------------------------------------------------------------------------------------------------------------------- |
| Acessibilidade             |         2 | Links primários com contraste insuficiente; diferenças indicadas apenas por cor                                        |
| Performance                |        3* | Rotas carregadas sob demanda e Workers nas operações previstas; execução automática precisa de política por ferramenta |
| Responsividade             |         3 | 167 ferramentas sem overflow horizontal em 320 e 390 px; resultado e ações ficam distantes em formulários longos       |
| Temas                      |         3 | Shell e tokens coerentes nos dois temas; prévias de leitura têm superfície clara fixa                                  |
| Integridade da experiência |         2 | Conteúdo truncado, decimais bloqueados e 149 descrições genéricas                                                      |
| **Total**                  | **13/20** | **Aceitável, com trabalho significativo de UX**                                                                        |

Esta é uma avaliação heurística do estado observado, não uma certificação WCAG. *A nota de performance é provisória: não houve medição de Core Web Vitals, Lighthouse ou perfil em hardware limitado.

## Contexto e comportamento desejado

Público inferido do PRODUCT.md: desenvolvedores, QA e profissionais técnicos. Modo predominante: **Operate**. Cada tela deve permitir reconhecer a entrada esperada, obter um resultado correto e copiar ou baixar esse resultado com pouca decisão e pouco deslocamento.

Métrica principal sugerida: tempo até o primeiro resultado utilizável. Métricas secundárias: conclusão de tarefa, erros de entrada, tempo até copiar/baixar e tempo para localizar a ferramenta. São propostas para sessões de usabilidade ou medição local consentida; não há dados de uso que permitam afirmar aumento de conversão ou redução de abandono.

## Cobertura e limites

- Foram lidos o shell, home, templates e estilos compartilhados, preferências, catálogo e as definições de controles das 167 ferramentas, incluindo os controles gerados por factories.
- As 167 rotas foram percorridas em desktop de 1440 px e celular de 390 px. Uma passagem adicional percorreu as 167 ferramentas, home, catálogo e favoritos em 320 px.
- Nenhum overflow horizontal de página ou controle ultrapassando a viewport foi encontrado nessas passagens. Isso cobre os estados iniciais, não toda combinação de conteúdo ou arquivo.
- Foram conferidas as 12 categorias, home, catálogo, favoritos vazio, recentes preenchido, categoria inválida e 404.
- Exemplos de JSON Minifier e Text Diff foram executados. A rejeição de temperatura decimal foi reproduzida. Menu móvel, Escape e abertura da paleta por Ctrl+K foram exercitados.
- Houve inspeção visual da home desktop, PIX móvel, favoritos em 320 px e bancada no tema escuro, além de medições de layout.
- Não houve teste em Safari/iPhone físico, leitor de tela, zoom de texto a 200%, rede lenta, todos os uploads ou todos os modos de cada ferramenta. Não se deve interpretar a cobertura de rotas como validação dos 167 algoritmos.
- O detector Impeccable rodou uma vez em modo **DEGRADED**: faltavam htmlparser2, css-select, css-tree e domutils. Seus avisos de escala tipográfica são candidatos de revisão; não foram contados como defeitos automaticamente. O próprio DESIGN.md documenta tamanhos auxiliares que o detector sinalizou.
- O checkout sofreu uma reorganização simultânea de catálogo, componentes e ferramentas. Foram descartados achados transitórios, como editores duplicados que desapareceram durante a sessão. As referências abaixo usam os caminhos finais observados.
- Não alterei a interface. Os arquivos desta pasta são o resultado da auditoria. Não executei format:check, lint, suíte de testes ou build de produção; o servidor de desenvolvimento compilou inicialmente, teve falhas transitórias durante as movimentações e voltou a servir as telas usadas no fechamento.

Inventário completo: [coverage.md](./coverage.md). Evidência da passagem móvel: [mobile-390.json](./mobile-390.json).

## P1 — corrigir antes de publicar

### 01. Links com aparência de botão principal perdem o contraste

**Local:** [src/styles.scss:51](C:/Eu/toolbox/src/styles.scss:51), estados vazios em [home.html:187](C:/Eu/toolbox/src/app/features/home/home.html:187) e página 404.

**Evidência:** em favoritos vazio, “Explorar ferramentas” tem texto rgb(100,112,100) sobre rgb(40,93,69): **1,47:1**. No escuro, rgb(169,184,169) sobre rgb(163,209,170): **1,21:1**. A regra global de links com color: inherit prevalece sobre a cor do componente em camada do DaisyUI.

**Impacto:** a principal saída do estado vazio parece desabilitada e fica difícil de ler. O problema reaparece em links primários que herdam texto secundário.

**Correção:** aplicar explicitamente o par semântico de fundo e texto do botão, inclusive em âncoras. Conferir estado normal, hover e foco nos dois temas. Texto normal precisa de 4,5:1 conforme [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Alavanca:** saliência da ação e reconhecimento. KPI: sucesso ao sair de favoritos/404. Extrapolação técnica dos princípios de clareza da skill richardrx. **Comando:** $impeccable harden.

### 02. A validação compartilhada impede números decimais legítimos

**Local:** [tool-workbench.ts:204](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.ts:204), [tool-workbench.html:323](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html:323), temperature.tool.ts e percentage.tool.ts.

**Reprodução:** informar **36.5** em temperatura produz “Temperatura: -1000000–1000000”, sem resultado. O valor está dentro do intervalo; é rejeitado por Number.isInteger e step=1.

**Impacto:** conversões e cálculos comuns não podem ser concluídos; a mensagem informa o motivo errado.

**Correção:** declarar por campo se aceita inteiro ou decimal e seu step. Temperatura e valores percentuais devem aceitar frações; quantidade, porta e dimensões inteiras mantêm sua regra. Mostrar “Informe um número válido” ou o intervalo correto junto ao campo.

**Alavanca:** prevenção e recuperação de erro. KPI: conclusão dos cálculos. Extrapolação técnica, alinhada à prioridade de fluxo funcional da [card src:2080254201104347325](https://x.com/richardrx/status/2080254201104347325). **Comando:** $impeccable harden.

### 03. Traduções cortam instruções no meio da frase

**Local:** [pt.json:59](C:/Eu/toolbox/src/app/i18n/pt.json:59), [pt.json:472](C:/Eu/toolbox/src/app/i18n/pt.json:472), es.json e textos da home.

**Evidência:** favoritos mostra “Clique na estrela de uma”; o texto de recentes vazio está traduzido como “As”. A mensagem de privacidade termina em “nem salvos”. No espanhol há entradas que ainda contêm texto em inglês, por exemplo o texto secundário do catálogo. São valores truncados no dicionário, não corte visual por CSS.

**Impacto:** orientações de primeiro uso e privacidade ficam incompletas; trocar o idioma não produz uma experiência consistente.

**Correção:** revisar as mensagens como frases completas, preservando quebras apenas como apresentação. Conferir PT/EN/ES em busca, favoritos, recentes, erros, processamento e resultados. Não basta conferir a existência de uma chave.

**Alavanca:** fluência cognitiva e orientação no estado vazio. KPI: conseguir escolher o próximo passo sem ajuda. Base: [card src:2005682912419606553](https://x.com/richardrx/status/2005682912419606553). **Comando:** $impeccable clarify.

### 04. O diff depende de vermelho e verde para comunicar o tipo de mudança

**Local:** [tool-workbench.html:167](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html:167), [src/styles.scss:1236](C:/Eu/toolbox/src/styles.scss:1236).

**Evidência:** o exemplo Text Diff distingue “Olá, mundo!” e “Olá, Brasil!” por classes de cor. A tabela expõe textos e números de linha; não há marcador por linha nem descrição acessível de adição/remoção. O aviso menciona −/+ que não aparecem nas linhas.

**Impacto:** usuários que não distinguem as cores ou usam leitor de tela precisam deduzir a operação manualmente. A indicação não satisfaz o princípio de [uso de cor da WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

**Correção:** adicionar −/+ e rótulos acessíveis por trecho ou linha; incluir resumo de adições/remoções na bancada de diff. Preservar cabeçalhos e cores como reforço.

**Alavanca:** reconhecimento e redundância de informação. KPI: identificar corretamente uma alteração. Extrapolação de acessibilidade. **Comando:** $impeccable harden.

## P2 — próxima passagem de UX

### 05. A execução automática usa a mesma política para tarefas muito diferentes

**Local:** [tool-workbench.ts:166](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.ts:166).

Toda edição agenda execução em 300 ms, limpa o resultado anterior e pode desabilitar campos durante o processamento. Existe agora uma indicação de atualização automática, mas ela não resolve a diferença entre formatar JSON, gerar novos dados aleatórios, abrir um arquivo e executar trabalho criptográfico.

**Correção:** adotar política explícita por ferramenta: transformação leve automática; geração aleatória e trabalho pesado sob ação; arquivos com processamento após configuração completa. Preservar o último resultado com indicação “Entrada alterada” quando apropriado. Evitar alertas enquanto o usuário ainda monta uma entrada sintaticamente incompleta. Para tarefas longas, oferecer cancelamento quando possível.

**Mecanismo/KPI:** previsibilidade e esforço percebido; medir interrupções da digitação e conclusão sem reexecuções desnecessárias. Extrapolação dos princípios richardrx. **Comando:** $impeccable optimize.

### 06. No celular, resultado e erro ficam longe da ação

**Local:** [tool-workbench.html:334](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html:334), [src/styles.scss:786](C:/Eu/toolbox/src/styles.scss:786). Medições em mobile-390.json.

Em 390×844, o painel de resultado começa em aproximadamente **1550 px no PIX**, **1348 px em pessoas**, **1314 px em Kubernetes** e **1299 px no cURL**, a partir do topo da página. Erros também aparecem no painel de resultado. Não há ligação visível entre o campo problemático e o erro.

**Correção:** após execução manual, anunciar resultado e oferecer “Ver resultado”; usar abas Entrada/Resultado ou uma ação acessível próxima do formulário, sem deslocar o foco a cada execução automática. Associar erros ao campo por aria-describedby e aria-invalid.

**Mecanismo/KPI:** custo de deslocamento e Lei de Fitts; tempo entre executar e copiar. Base de alcance: [card src:1886783248308510995](https://x.com/richardrx/status/1886783248308510995). A solução de abas é extrapolação para esta bancada. **Comando:** $impeccable adapt.

### 07. Campos sem uso continuam visíveis em operações alternativas

**Local:** [pix.tool.ts:15](C:/Eu/toolbox/src/app/features/tools/brazilian/pix.tool.ts:15), [connection-string.tool.ts:7](C:/Eu/toolbox/src/app/features/tools/database/connection-string.tool.ts:7), [pdf-pages.tool.ts:15](C:/Eu/toolbox/src/app/features/tools/text/pdf-pages.tool.ts:15), CPF/CNPJ, OTP e bcrypt.

Decodificar PIX mostra chave, nome, cidade, valor e TXID para geração. SQLite mantém servidor, usuário, senha e TLS. PDFs mantêm seleção de páginas mesmo em união. Gerar CPF apresenta campo “CPF para validar”.

**Correção:** selecionar a operação primeiro e mostrar apenas seus campos relevantes. Manter valores em memória ao alternar. Desabilitar ou ocultar parâmetros inaplicáveis com uma explicação quando necessário.

**Mecanismo/KPI:** carga cognitiva e divulgação progressiva; tempo para preencher e taxa de entrada inválida. Base: [card src:2003495704849760387](https://x.com/richardrx/status/2003495704849760387). **Comando:** $impeccable distill.

### 08. O formulário genérico não descreve bem o dado esperado

**Local:** [controls.ts](C:/Eu/toolbox/src/app/features/tools/_shared/controls.ts), [tool-workbench.html](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html), ferramentas de certificados, documentos e utilitários.

Diversas entradas são apenas “Entrada”, com textarea de pelo menos 240 px para um CPF, cor, código de permissão, versão semântica ou expressão curta. Campos numéricos textuais não declaram inputmode. Senhas do P12 e connection string não têm ação para revelar.

**Correção:** usar nomes específicos (“Certificado PEM”, “CPF”, “Cor CSS”, “Versão original”), exemplo de formato junto ao campo e tipo/altura adequados. Adicionar inputmode e permitir revelar senha. CNPJ alfanumérico precisa manter teclado compatível com letras.

**Mecanismo/KPI:** correspondência entre controle e tarefa; menos erros e menos digitação. Base mobile: “Teclado normal em campo numérico é uma covardia com o usuário” — [src:1999607836213641569](https://x.com/richardrx/status/1999607836213641569). A escolha de controles por ferramenta é extrapolação. **Comando:** $impeccable clarify.

### 09. Descrições e marcadores pouco ajudam a escolher

**Local:** [catalog](C:/Eu/toolbox/src/app/features/tools/catalog), [definition.ts:16](C:/Eu/toolbox/src/app/features/tools/_shared/definition.ts:16).

Foram contados **149 de 167** cards com a fórmula “nome da ferramenta: processe e exporte localmente” e **152** marcadores “Novo”. A ação compartilhada também se chama “Executar” em muitas ferramentas.

**Correção:** descrever entrada, transformação e saída em uma frase; exemplo: “Transforme CREATE TABLE PostgreSQL em classes C#”. Usar “Gerar QR Code”, “Decodificar certificado” e “Converter para WebP”. Exibir “Novo” somente quando houver critério temporal real. Acrescentar sinônimos de tarefa à busca.

**Mecanismo/KPI:** cheiro da informação e saliência; tempo para escolher a ferramenta correta. Base: carga cognitiva da [card src:1886382416358519059](https://x.com/richardrx/status/1886382416358519059); exemplos de copy são extrapolação. **Comando:** $impeccable clarify.

### 10. A home acumula apresentação, atalhos e catálogo completo

**Local:** [home.html](C:/Eu/toolbox/src/app/features/home/home.html), [home.scss](C:/Eu/toolbox/src/app/features/home/home.scss).

Em 390 px, o catálogo completo ficou com cerca de **35.803 px de altura**. A home repete todos os 167 cards após apresentação, recentes e essenciais. A busca ajuda, mas a exploração por rolagem vira uma lista extensa.

**Correção:** manter busca e retorno rápido como centro da home; apresentar categorias com contagens e levar à listagem completa. No catálogo, oferecer lista compacta ou agrupamento por categoria. Não remover ferramentas nem impor paginação sem validar a necessidade.

**Mecanismo/KPI:** Lei de Hick e custo de varredura; tempo de descoberta. Base: [src:1886382416358519059](https://x.com/richardrx/status/1886382416358519059). Aplicação ao catálogo é extrapolação. **Comando:** $impeccable layout.

### 11. Estados vazios diferentes recebem a mesma explicação

**Local:** [home.html:187](C:/Eu/toolbox/src/app/features/home/home.html:187), [home.ts](C:/Eu/toolbox/src/app/features/home/home.ts).

Favoritos vazio, pesquisa sem resultado e categoria inexistente usam “Nada por aqui ainda”. Uma categoria inválida chega a receber a orientação de que ferramentas abertas aparecerão ali.

**Correção:** “Nenhuma ferramenta para ‘termo’” com “Limpar busca”; “Você ainda não tem favoritos” com orientação completa; “Categoria não encontrada” com retorno às categorias. Em recentes, explicar o que é guardado e oferecer exploração. Vincular o valor do input da home à query para refletir também URLs abertas diretamente com q.

**Mecanismo/KPI:** orientação e recuperação; proporção de buscas vazias que chega a uma ferramenta. Base: [src:2005682912419606553](https://x.com/richardrx/status/2005682912419606553). **Comando:** $impeccable onboard.

### 12. Favoritos além do 18º desaparecem ao reabrir

**Local:** [preferences.ts:31](C:/Eu/toolbox/src/app/core/services/preferences.ts:31).

A interface permite continuar adicionando, mas a leitura de preferências trunca os IDs em 18. A perda é inferida diretamente da implementação de leitura e gravação; não foi necessário apagar preferências do usuário para demonstrá-la.

**Correção:** remover o limite arbitrário dos favoritos ou tornar o limite explícito antes de adicionar. Manter o limite de recentes separado.

**Mecanismo/KPI:** confiança e memória externa; retenção dos atalhos escolhidos. Extrapolação de UX. **Comando:** $impeccable harden.

### 13. “Exportar” pode baixar texto quando o usuário quer o arquivo produzido

**Local:** [tool-workbench.html:356](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html:356), [tool-workbench.ts](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.ts), ferramentas de imagens, PDFs e favicon.

O cabeçalho exporta result.output, enquanto botões separados baixam os artifacts. Para imagens, o texto descreve tamanhos e formato; o arquivo convertido está em outro botão. O mesmo padrão mistura pacote ZIP, PDF e representação textual.

**Correção:** quando houver um único artefato, usar “Baixar imagem/PDF/ZIP” como ação principal. Nomear “Exportar relatório” para o texto. Com vários arquivos, exibir lista com tipo, tamanho e nome.

**Mecanismo/KPI:** correspondência entre intenção e ação; primeiro download correto. Extrapolação de clareza. **Comando:** $impeccable clarify.

### 14. O espaço de trabalho perde largura cedo em tablet e notebook

**Local:** [src/styles.scss:991](C:/Eu/toolbox/src/styles.scss:991).

A bancada empilha entrada e saída abaixo de 1200 px, enquanto a sidebar permanece até 720 px. Em 768 px foram medidos 534 px para o main e 474 px para o painel interno. A interface cabe, mas leitura e comparação ficam estreitas.

**Correção:** definir breakpoints pela largura mínima útil dos painéis, considerar gaveta no intervalo de tablet e permitir ampliar o resultado. Conferir 768, 1024, 1200 e 1440 px com texto longo.

**Mecanismo/KPI:** densidade útil e esforço de comparação; tempo para revisar uma saída. Extrapolação responsiva. **Comando:** $impeccable adapt.

### 15. Controles de toque e texto auxiliar ficam pequenos

**Local:** [src/styles.scss:121](C:/Eu/toolbox/src/styles.scss:121), [src/styles.scss:541](C:/Eu/toolbox/src/styles.scss:541), [legibility.scss](C:/Eu/toolbox/src/legibility.scss).

Medições em 390 px: favorito **31×31**, tema **32×38**, idioma **84×34** e menu **38×38**. Campos usam normalmente 13 px e vários textos auxiliares 10–12 px.

**Correção:** usar área de toque de pelo menos 44×44 como meta de conforto, inclusive quando o ícone fica pequeno; aumentar texto dos campos no móvel e preservar hierarquia. Conferir zoom automático no Safari físico, que não foi testado nesta sessão.

**Padrão:** menos de 44 px não é, por si só, falha WCAG AA: o [critério 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) usa 24 px e exceções de espaçamento. O achado aqui é ergonomia.

**Mecanismo/KPI:** Lei de Fitts; acertos no primeiro toque. Base: [src:1886783248308510995](https://x.com/richardrx/status/1886783248308510995). **Comando:** $impeccable adapt.

### 16. Prévias de leitura não acompanham o tema

**Local:** [preview.ts:8](C:/Eu/toolbox/src/app/features/tools/_shared/preview.ts:8), [tool-workbench.html:422](C:/Eu/toolbox/src/app/features/tools/workbench/tool-workbench.html:422).

O documento da prévia fixa texto #152b24 e fundo #fafaf7. No tema escuro, Markdown, árvore JSON e outras prévias de leitura mantêm uma grande área clara. A borda do iframe ainda usa --border-color com fallback #ccc.

**Correção:** passar a aparência às prévias de leitura e usar o token real de borda do shell. Preservar as cores escolhidas pelo usuário em contraste, gradiente e playgrounds CSS; a amostra não deve mudar para combinar com o tema.

**Mecanismo/KPI:** continuidade visual e conforto de leitura; revisão do resultado. Extrapolação de design. **Comando:** $impeccable colorize.

## O que preservar

- Paleta verde e papel, tipografia local e equivalente escuro: há uma linguagem própria de ferramenta de trabalho.
- Busca visível, normalização de acentos, categorias e acesso direto às rotas.
- Links dos cards e botões de favorito independentes, com aria-pressed.
- Menu móvel com foco inicial, fundo inerte, bloqueio de rolagem e devolução do foco por Escape.
- Paleta com dialog nativo, foco no campo e navegação por teclado.
- Rótulos associados aos campos, foco visível, regiões de status e alertas.
- Previews em sandbox e explicações sobre dados sintéticos e limites dos validadores.
- Ausência de overflow horizontal nas passagens registradas.

## Direção de design

Preservar a “bancada de trabalho” aprovada. Usar o verde para ação e seleção, Manrope para títulos, IBM Plex Sans para controles e Mono para dados. A assinatura visual deve ser a relação clara entre **entrada → transformação → resultado**, repetida com precisão em cada ferramenta.

A oportunidade estética mais útil é tornar o resultado específico: diff legível, arquivo pronto para baixar, certificado com seções identificáveis, cor com amostra e valores. Evitar que todo resultado pareça o mesmo bloco de JSON. Esta é uma recomendação de direção, ainda não um redesenho aprovado.

## Ordem recomendada

1. **$impeccable harden** — contraste dos links primários, números decimais, semântica do diff e favoritos.
2. **$impeccable clarify** — traduções completas, rótulos, descrições, ações e downloads.
3. **$impeccable distill** — controles condicionais por operação.
4. **$impeccable adapt** — ligação entre entrada e resultado, tablet e toque.
5. **$impeccable onboard** — busca vazia, favoritos, recentes e categorias inválidas.
6. **$impeccable optimize** — política de execução por ferramenta; medir tarefas pesadas antes de otimizar.
7. **$impeccable colorize** — tema das prévias de leitura.
8. **$impeccable layout** — reduzir a extensão da home e facilitar exploração do catálogo.
9. **$impeccable polish** — acabamento após as correções funcionais.
10. Reexecutar **$impeccable audit** após a implementação para comparar resultados.

As etapas podem ser executadas individualmente, em conjunto ou em outra ordem. A implementação é uma etapa separada desta auditoria.

## Leitura richardrx aplicada

Priorizei fluxo funcional e tempo até valor. A card src:2080254201104347325 registra: “Se podemos nos preocupar com o esteticamente agradável é porque já resolvemos o funcional e a conversão antes.” As demais aplicações estão identificadas junto de cada recomendação, e as extensões técnicas foram marcadas como extrapolações. Não há evidência de uso que permita atribuir um ganho percentual ao Toolbox.
