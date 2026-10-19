---
name: Toolbox
description: Bancada de trabalho local para ferramentas de desenvolvimento.
colors:
  accent: '#285d45'
  ink: '#22382c'
  muted: '#647064'
  paper: '#f7f8f4'
  surface: '#ffffff'
  line: '#e1e6dc'
  wash: '#edf3e9'
  preview: '#eaf0e5'
  code-key: '#395a4b'
  code-string: '#856029'
  code-value: '#3b6a90'
  error: '#a13535'
  dark-accent: '#a3d1aa'
  dark-ink: '#e1e9de'
  dark-muted: '#a9b8a9'
  dark-paper: '#142019'
  dark-surface: '#1b2822'
  dark-line: '#34463b'
  dark-wash: '#253c2d'
  dark-preview: '#22362a'
  dark-code-key: '#b4d1b8'
  dark-code-string: '#e7c38c'
  dark-code-value: '#a2c7e0'
  dark-error: '#f2aaa1'
typography:
  display:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: 'clamp(38px, 3.7vw, 56px)'
    fontWeight: 750
    lineHeight: 1.13
    letterSpacing: '-0.04em'
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: '19px'
    fontWeight: 700
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: '15px'
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: '-0.015em'
  body:
    fontFamily: "'IBM Plex Sans Variable', sans-serif"
    fontSize: '13px'
    lineHeight: 1.75
  label:
    fontFamily: "'IBM Plex Sans Variable', sans-serif"
    fontSize: '13px'
    fontWeight: 500
  code:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: '13px'
    lineHeight: 1.8
rounded:
  navigation: '6px'
  field: '8px'
  surface: '12px'
spacing:
  compact: '8px'
  small: '12px'
  medium: '16px'
  panel: '20px'
  section: '24px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.surface}'
    rounded: '{rounded.field}'
    height: '40px'
    padding: '0 15px'
  button-primary-dark:
    backgroundColor: '{colors.dark-accent}'
    textColor: '#163120'
    rounded: '{rounded.field}'
    height: '40px'
    padding: '0 15px'
  button-ghost:
    textColor: '{colors.muted}'
    rounded: '{rounded.field}'
    height: '40px'
    padding: '0 15px'
  button-ghost-hover:
    backgroundColor: '{colors.wash}'
    textColor: '{colors.ink}'
  field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    height: '42px'
  navigation-active:
    backgroundColor: '{colors.wash}'
    textColor: '{colors.accent}'
    rounded: '{rounded.navigation}'
    padding: '12px'
  filter-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.paper}'
    rounded: '{rounded.navigation}'
    padding: '9px 11px'
  tool-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.surface}'
    padding: '20px 20px 16px'
---

# Design System: Toolbox

## Overview

**Creative North Star: "Bancada de trabalho"**

Uma bancada organizada, clara e técnica: papel suave, ferramentas reconhecíveis e espaço para trabalhar. A navegação permanece disponível em telas amplas; pesquisa, catálogo e área de entrada/resultado compartilham a mesma linguagem. A personalidade aprovada combina tons de papel, verde escuro, tipografia técnica e um modo escuro equivalente. Fontes são locais.

Este documento atualiza a direção aprovada com o que foi construído em `src/styles.scss`, `src/legibility.scss`, `src/app/app.scss`, `src/app/features/home/home.scss` e `src/app/features/tools/catalog/tool-card/tool-card.scss`, além do shell e dos componentes compartilhados. O contrato permanece: reconhecer a finalidade no primeiro viewport, encontrar ferramentas por nome ou palavra-chave e executar, copiar ou exportar sem cadastro. A composição específica da home não é uma obrigação para toda tela. Os valores preliminares de tinta, verde ativo e largura do seed foram resolvidos pelos tokens e medidas atuais abaixo.

**Key Characteristics:**

- Papel e superfícies claras, com verde como sinal de ação.
- Mesmo vocabulário em carvão verde e sálvia no modo escuro.
- Manrope para títulos, IBM Plex Sans para interface e IBM Plex Mono para dados.
- Catálogo em cards e bancada de entrada/resultado com divisórias suaves.
- Estados de teclado, erros e resultados fazem parte da experiência.

## Colors

A paleta é predominantemente neutra, levemente verde, com acento funcional e cores de sintaxe subordinadas à leitura.

### Primary

- **Verde de trabalho** (`accent`): ações principais, seleção, links de ação, foco e ícones da categoria padrão.
- **Sálvia ativa** (`dark-accent`): o mesmo papel no modo escuro; botões sólidos usam texto verde profundo para conservar contraste.

### Neutral

- **Papel** (`paper`) e **superfície** (`surface`): fundo contínuo e planos de navegação, cards e painéis.
- **Tinta** (`ink`), **texto secundário** (`muted`) e **divisória** (`line`): hierarquia de texto e separação estrutural.
- **Lavagem verde** (`wash`) e **prévia** (`preview`): seleção, avisos, ícones e a demonstração de código.
- Os tokens com prefixo `dark-` substituem esses papéis em conjunto; o tema não consiste em inverter uma única cor.

Cores auxiliares de código distinguem chave, string e valor. Ícones de categorias usam pares suaves de azul, ocre, violeta e terracota, cada um com equivalente escuro, definidos no CSS. Erros usam o token semântico `error`, com mensagem textual e região de alerta.

**The Semantic Pairing Rule.** Fundo, texto, borda e estado mudam juntos ao trocar o tema; use os papéis semânticos do CSS.

## Typography

**Display Font:** Manrope Variable, com sans-serif de fallback.  
**Body Font:** IBM Plex Sans Variable, com sans-serif de fallback.  
**Label/Mono Font:** IBM Plex Mono para código, dados e indicação de atalho.

A marca e os títulos têm desenho geométrico firme, enquanto a interface mantém leitura direta. A fonte monoespaçada identifica material técnico; não substitui a fonte de interface em parágrafos.

### Hierarchy

- **Display:** título da home com escala fluida, peso forte e entrelinha compacta. Usa 46px até 1100px e 42px até 600px. Durante a pesquisa, recolhe para 32px (30px no móvel) sem remover o campo nem perder foco.
- **Headline:** seções do catálogo; páginas de listagem usam título maior (30px, reduzido para 26px e 25px).
- **Title:** nomes dos cards; cabeçalhos dos painéis usam 14px. Títulos de ferramenta usam `clamp(24px, 2.5vw, 32px)`, com 25px no móvel.
- **Body / Label:** descrições, navegação e campos usam a escala final de legibilidade, normalmente 13px. As regras em `src/legibility.scss` complementam os estilos globais de `src/styles.scss`.
- **Code:** entradas e resultados usam a escala monoespaçada do frontmatter, com quebra de linhas longas no resultado. A demonstração da home tem tratamento compacto próprio.

**The Data Type Rule.** Reserve a fonte monoespaçada para conteúdo técnico e preserve a fonte de interface em controles e explicações.

## Layout

O shell amplo tem sidebar fixa (248px), topbar (76px) e corpo deslocado pela largura da sidebar. O conteúdo central tem largura máxima implementada de 1400px e padding de 46px 48px 64px. A largura preliminar de 1280px do seed não corresponde ao build final.

O catálogo usa três colunas iguais com intervalo de 15px; os cards preenchem a altura de sua linha. A bancada usa duas colunas iguais com intervalo de 22px e painéis alinhados pelo topo. Formulários usam duas colunas internas quando o espaço permite; campos de texto extensos ocupam a largura completa.

- **Até 1200px:** sidebar de 224px, conteúdo com padding de 35px 30px 50px e bancada em uma coluna, entrada antes do resultado.
- **Até 1100px:** a home passa a uma coluna e omite o exemplo de transformação; atalhos essenciais passam a duas colunas.
- **Até 960px:** catálogo em duas colunas.
- **Até 720px:** sidebar vira gaveta de 260px, corpo sem deslocamento, topbar de 66px e conteúdo com padding de 30px 22px 40px. O rodapé empilha.
- **Até 420px:** catálogo e campos passam a uma coluna. A interface suporta largura mínima de 320px.
- **Até 600px:** atalhos essenciais passam a uma coluna.

A organização deve sobreviver a português, inglês e espanhol, que usam o mesmo layout. Conteúdo de resultado pode crescer; não o limite a uma imagem estática ou a uma linha sem quebra.

## Elevation & Depth

A maior parte da interface é plana: superfícies, divisórias finas e mudanças tonais constroem profundidade. Botões, cards e o exemplo de transformação não usam sombra. A pesquisa principal da home tem sombra difusa baixa (`0 4px 14px #173b2409`). A gaveta móvel tem fundo de proteção translúcido; sua função é delimitar o contexto modal.

O exemplo da home permanece alinhado à bancada. Cards e o acesso ao formatador transicionam apenas borda e fundo em 150ms; a gaveta usa 200ms com `ease-out`. Movimento reduzido remove transições e animações, sem ocultar conteúdo.

**The Quiet Surface Rule.** Use bordas e contraste tonal para organizar o trabalho; reserve a elevação observada para os elementos de apresentação da home.

## Shapes

Cantos discretamente arredondados diferenciam controles, navegação e planos maiores. Campos e avisos usam o raio de campo; links de navegação e filtros usam o raio de navegação; cards e painéis usam o raio de superfície. Divisórias têm 1px e acompanham o tema. Ícones são SVG lineares coerentes, normalmente entre 14px e 21px, dentro de suportes tonais quando representam ferramentas.

## Components

### Buttons

Ações diretas, compactas e com rótulos em caixa normal. O primário é sólido; o secundário contornado usa a borda semântica; o ghost usa texto secundário e recebe lavagem verde no hover. O botão padrão tem 40px de altura, o pequeno tem 32px e as ações quadradas usam 38px. Botões desabilitados acompanham indisponibilidade real, como copiar sem resultado.

Foco visível usa contorno de 2px no acento, afastado 4px; campos usam afastamento de 3px. Preserve o foco em controles com ícone e dê nome acessível.

### Chips

Filtros de categoria são links com contorno, ícone opcional e cantos de navegação. O selecionado usa acento sólido e texto de papel. Seleção é informação de estado, não apenas hover.

### Cards / Containers

Na home, os essenciais usam uma variante compacta de 90px, com nome, ícone, categoria e favorito independente. O catálogo completo conserva os cards com descrições; seus rodapés identificam a categoria e a seta indica navegação. A assinatura da home é um exemplo de transformação JSON, com entrada compacta, resultado formatado e acesso à ferramenta real. O exemplo é identificado explicitamente, usa código selecionável e não simula um editor. Durante a busca, o destaque recolhe e os filtros de categoria cedem espaço aos resultados. Esses estilos ficam em `src/app/features/home/home.scss` e `src/app/features/tools/catalog/tool-card/tool-card.scss`, encapsulados nos componentes.

Cards do catálogo usam superfície, borda fina e raio de superfície. O link cobre o conteúdo principal; o favorito é um botão independente, fora do link. A estrela padrão usa texto secundário; a selecionada recebe acento, fundo tonal e preenchimento. O estado também é exposto por `aria-pressed`.

Painéis da bancada repetem a superfície e o raio, com cabeçalho separado por divisória. A ação principal permanece no painel de entrada; copiar e exportar ficam no cabeçalho do resultado.

### Inputs / Fields

Campos têm fundo de papel, borda semântica e rótulo associado. Entradas comuns têm 42px de altura; textareas usam código, altura mínima de 240px e redimensionamento vertical. A pesquisa principal combina campo e ícone no mesmo contorno e evidencia foco do conjunto.

Erros ocupam um bloco tonal de erro com texto explicativo e `role="alert"`. Estado de processamento, resultado pronto e retorno de copiar/exportar são anunciados. Resultado textual permite seleção, quebra de conteúdo longo e navegação por teclado.

### Navigation

A sidebar usa links com ícones, texto secundário e seleção tonal no acento. O topo mantém pesquisa global, idioma e tema. Ctrl/Cmd+K leva à pesquisa.

No móvel, abrir a navegação move foco para a gaveta, contém Tab/Shift+Tab, torna o corpo inerte e bloqueia a rolagem do fundo. Escape, fechar ou clicar no fundo devolve foco ao acionador; escolher destino leva ao conteúdo. Ao ultrapassar o breakpoint móvel, a gaveta fecha. O link de pular conteúdo continua disponível por teclado.

### Bancada de entrada e resultado

Entrada e resultado são pares estáveis. Estado vazio explica a próxima ação; o estado preenchido mantém ações de cópia/exportação, aviso quando necessário e contagem de caracteres. A indicação de privacidade acompanha a bancada, com texto legível nos dois temas.

## Do's and Don'ts

### Do:

- **Do** preservar a bancada clara de papel e seu equivalente escuro em carvão verde.
- **Do** aplicar os papéis semânticos de cor e a escala final de legibilidade.
- **Do** manter favoritos como controles independentes dos links de ferramenta.
- **Do** preservar foco visível, rótulos associados e anúncios de erro e resultado.
- **Do** adaptar catálogo, navegação e bancada ao espaço disponível e aos dois idiomas.

### Don't:

- **Don't** substituir o vocabulário técnico aprovado por outra identidade visual.
- **Don't** transformar a composição da home em uma obrigação para todas as ferramentas.
- **Don't** usar a indicação de processamento local para sugerir publicação, popularidade medida ou verificação criptográfica sem evidência.
- **Don't** ocultar conteúdo para executar animações ou ignorar movimento reduzido.
