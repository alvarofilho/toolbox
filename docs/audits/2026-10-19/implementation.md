# Correções da auditoria de UI/UX

Data: 19/10/2026. Complemento da [auditoria original](./README.md), preservada como registro do estado anterior.

## Entrega

Os 16 achados receberam correções. A identidade visual existente foi preservada: papel, verde, Manrope e IBM Plex.

| Achado                      | Correção implementada                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 — Contraste das ações    | Cores explícitas de texto e fundo nos botões primários, inclusive links. Contraste medido em favoritos vazio: **7,66:1 claro / 8,20:1 escuro**.                                               |
| 02 — Decimais               | Metadados de step e teclado por campo; validação distingue decimais, inteiros e limites. Temperatura de 36.5 °C retorna 97.7 °F no navegador.                                                 |
| 03 — Traduções              | Frases completas e revisão dos dicionários PT/EN/ES, incluindo controles produzidos por factories. Teste verifica cobertura das definições, opções e ações nos três idiomas.                  |
| 04 — Diff acessível         | Marcadores −/+ e descrições de remoção/adição, além das cores; resumo das alterações.                                                                                                         |
| 05 — Execução               | Política explícita por ferramenta. Transformações leves usam debounce; geração, arquivos e trabalho pesado exigem ação. Resultado anterior é preservado e identificado quando a entrada muda. |
| 06 — Resultado e erros      | Erros próximos aos campos, aria-invalid e aria-describedby; execução manual oferece acesso ao resultado e foco adequado, respeitando redução de movimento.                                    |
| 07 — Campos condicionais    | Operação primeiro e parâmetros relevantes em PIX, documentos, PDF, SQLite, criptografia e outros fluxos. Valores são preservados ao alternar.                                                 |
| 08 — Semântica das entradas | Rótulos específicos, exemplos de formato, controles de uma linha quando apropriados, inputmode e ação de revelar senha.                                                                       |
| 09 — Clareza do catálogo    | Substituídas as 149 descrições genéricas por descrições de entrada, função e saída nos três idiomas. Ações específicas e remoção dos marcadores Novo sem critério temporal.                   |
| 10 — Descoberta             | Home com busca, atalhos, seis essenciais e diretório de 12 categorias. Catálogo completo agrupado e com alternância entre lista compacta e cards.                                             |
| 11 — Estados vazios         | Explicações e saídas específicas para favoritos, recentes, busca sem resultados e categoria inexistente. Busca reflete o parâmetro da URL.                                                    |
| 12 — Favoritos              | Removido o truncamento em 18 itens; teste persiste e recarrega 30 favoritos. Limite de recentes permanece independente.                                                                       |
| 13 — Downloads              | A ação principal baixa o artefato produzido quando há um único arquivo. Nome, tipo e tamanho ficam visíveis; relatório textual tem ação separada.                                             |
| 14 — Tablet e notebook      | Navegação recolhível até 1024 px e colunas da bancada adaptadas à largura disponível.                                                                                                         |
| 15 — Toque e leitura        | Alvos principais de 44 px, campos móveis de 16 px, ajustes de rótulos, espaçamento e títulos longos.                                                                                          |
| 16 — Temas das prévias      | Prévias de leitura acompanham o tema dentro do iframe isolado, mantendo a restrição de scripts.                                                                                               |

## Verificação

- `pnpm run format:check`: aprovado.
- `pnpm run lint`: aprovado.
- `pnpm run test --watch=false`: **310 testes aprovados em 10 arquivos**.
- `pnpm run build`: aprovado, incluindo a geração de 180 rotas públicas de SEO. A compilação ainda informa dependências CommonJS e bundle inicial de **506,84 kB**, **6,84 kB** acima do orçamento de aviso; são avisos, não falhas de compilação.
- Chromium: **167 ferramentas percorridas em 320, 390 e 1440 px**, sem overflow horizontal nos estados iniciais. A passagem em 390 px também conferiu associação dos campos a rótulos e ausência de chaves de tradução expostas.
- Estados de favoritos, recentes, busca vazia, categoria inválida e 404 conferidos em PT/EN/ES na largura de 320 px.
- Em 768 px: menu abre, Escape fecha e bancada ocupa uma coluna sem overflow.
- Download de QR Code exercitado: **qrcode.svg**, MIME **image/svg+xml**, **1227 bytes**. A verificação interceptou temporariamente o download para inspecionar o Blob e o nome sem gravar arquivo.
- Prévia Markdown no tema escuro conferida com `data-theme="dark"` e sandbox sem permissões.
- Inspeção visual da home móvel e das bancadas nos temas claro e escuro.

## Limites

Cobertura de rotas e testes automatizados não equivale a verificar todos os algoritmos, modos e combinações de arquivos das 167 ferramentas. Não houve certificação WCAG, sessão com leitor de tela, Safari/iPhone físico, perfil em hardware limitado ou medição de Core Web Vitals. O detector Impeccable ficou em modo degradado por falta de dependências de análise; seus resultados não foram usados como certificação.

O checkout recebeu alterações simultâneas de organização, traduções e SEO. Os comandos acima representam o estado disponível no fechamento desta passagem; mudanças posteriores devem passar pela mesma validação.
