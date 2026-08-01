# Contexto do Projeto — Catálogo Digital "Sativa Coffee Shop"

> Documento gerado para dar contexto completo a outra ferramenta de IA (Codex) sobre o projeto em andamento. Cole isso no início do prompt.

## 1. O que é o projeto

Catálogo digital estático (SPA) para uma tabacaria/coffee shop, inspirado na UX do **Vendizap** (mobile-first, navegação fluida, checkout redirecionado pro WhatsApp). Um único arquivo `index.html` autocontido, sem build/bundler.

## 2. Stack técnica (restrições que devem ser respeitadas)

- **HTML5 semântico** puro.
- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) — sem build step, sem PostCSS.
- **JavaScript vanilla** (sem frameworks, sem npm/bundler).
- **Fontes**: Google Fonts — `Inter` (texto geral) e `Zilla Slab` (marca/títulos, classe `.font-brand`).
- **Fonte de dados**: Google Sheets via **SheetDB** (`https://sheetdb.io/api/v1/275gm74y55ago`), duas abas:
  - `?sheet=Categorias`
  - `?sheet=Catalogo`
- Tudo roda 100% client-side. Sem backend próprio.

## 3. Arquitetura do JavaScript (módulos, nessa ordem no arquivo)

1. **DB** — estado vivo: `storeInfo` fixo no código + `categories`/`products` preenchidos via fetch.
2. **STORE_EXTRA_INFO** — dados institucionais fixos (endereço, horário, redes sociais, avaliação) usados no rodapé. **⚠️ Atualmente com placeholders, não são dados reais.**
3. **API** — `fetchCategories()`, `fetchProducts()`, `fetchAll()` (usa `Promise.all`).
4. **MAPPER** — normaliza linhas cruas da planilha (strings) pro formato usado na UI.
5. **STATE** — única fonte de verdade: `activeCategory`, `searchQuery`, `cart`.
6. **UTILS** — funções puras: `formatCurrency`, `parsePrice`, `parseBoolean`, `parseDriveImageUrl`, `normalizeForSearch`, `getVisibleProducts`.
7. **DOM** — todas as referências a elementos centralizadas num objeto.
8. **RENDER** — só desenha a UI a partir do estado, nunca muda estado.
9. **CART** — regras de negócio (add/remove/incrementar/decrementar/subtotal/abrir/fechar).
10. **WHATSAPP** — monta mensagem do pedido e abre `wa.me`.
11. **THEME** — dark mode (toggle + `localStorage`).
12. **LAYOUT** — ajustes que dependem de medir o DOM (spacer do header, fade dos filtros).
13. **EVENTS** — toda a delegação de eventos centralizada.
14. **INIT** — bootstrap assíncrono (fetch → loading → render).

**Padrão importante**: cards de produto e itens de carrinho são renderizados a partir de `<template>` HTML (não com strings de `innerHTML`), pra evitar XSS e manter o HTML legível.

## 4. Mapeamento de colunas da planilha (case-sensitive!)

**Aba "Categorias"**: `id`, `slug`, `name`

**Aba "Catalogo"**: `id`, `categoryid` (minúsculo, sem camelCase), `name`, `description` (opcional), `price` (string BR, ex: `"12,50"`), `imageUrl`, `isActive` (opcional — se vazio, assume `true`)

Se os nomes das colunas mudarem na planilha, o objeto `Mapper` no JS precisa ser ajustado.

## 5. Identidade visual

- Paleta: verde escuro (`brand-900` `#0f2415` até `brand-50` `#f2f7f4`) + laranja de destaque (`accent-500` `#f97316`).
- Header sempre com fundo escuro (`bg-brand-900/85`), independente do dark mode do resto do site.
- `dark:` variants no `tailwind.config` com `darkMode: 'class'` — toggle manual, não segue só a preferência do SO (mas usa `prefers-color-scheme` como valor inicial default se não houver preferência salva).

## 6. Histórico de decisões e features já implementadas

| # | Feature | Detalhe técnico relevante |
|---|---------|---------------------------|
| 1 | Catálogo inicial mockado | JSON estático → depois migrado pra API |
| 2 | Migração para SheetDB | `Promise.all` nas 2 abas, `Mapper` para normalizar |
| 3 | Conversão de preço BR | `.replace(',', '.')` + `parseFloat`, com fallback pra `0` |
| 4 | Descrição opcional | Remove a tag `<p>` do card se vazia, em vez de deixar em branco |
| 5 | Loading state | Evoluiu de spinner → **skeleton cards** (`animate-pulse`) |
| 6 | Imagens do Google Drive | Testado `uc?export=view` (bloqueado por **CORB**) → resolvido com `https://lh3.googleusercontent.com/d/{ID}` |
| 7 | Fallback de imagem quebrada | `img.onerror` troca para um **SVG inline em data URI** (nunca depende de rede) |
| 8 | Segurança (pré-publicação) | Recomendado restringir permissões do SheetDB pra **read-only** no dashboard (evitar que qualquer um com a URL da API delete/edite a planilha via POST/DELETE) |
| 9 | Busca por produto | Debounce de 200ms, normaliza acentos (`normalizeForSearch`) |
| 10 | Botão flutuante do WhatsApp | Mensagem genérica de contato (diferente da mensagem de pedido do carrinho) |
| 11 | Badge "Nx no carrinho" no card | Sincronizado via `Render.syncCartBadgesOnGrid()` |
| 12 | Header com altura dinâmica | `ResizeObserver` no header ajusta um spacer, em vez de altura fixa "no chute" |
| 13 | Rodapé institucional | Endereço, link "Como chegar" (`maps/dir/?api=1&destination=`), horário, redes sociais, avaliação — **todos com placeholders visíveis, precisam ser preenchidos com dados reais antes de publicar** |
| 14 | Barra de carrinho flutuante | Fixa embaixo, some atrás do drawer (z-index) quando aberto; desloca o botão do WhatsApp pra cima quando visível |
| 15 | Dark mode | Toggle com ícone sol/lua, `localStorage`, detecção inicial roda **antes** do Tailwind CDN carregar (evita flash de tema errado) |
| 16 | Fade nas bordas dos filtros | Overlays com gradiente, visibilidade controlada por scroll listener (`Layout.updateFiltersFade`) |

## 7. ⚠️ Pendências / placeholders que PRECISAM ser preenchidos antes de publicar

No objeto `STORE_EXTRA_INFO` (topo do `<script>` principal):
- `address` — endereço real
- `hours` — horário real de funcionamento
- `instagramUrl` / `facebookUrl` — links reais
- `googleRatingText` — nota/quantidade real de avaliações no Google (ou remover o bloco se ainda não tiver)

Além disso:
- `logo.jpg` referenciado no header — precisa existir na mesma pasta do `index.html`.
- Verificar se todos os arquivos de imagem no Google Drive estão com permissão **"Qualquer pessoa com o link"**.
- No painel do SheetDB, restringir permissões pra **somente leitura** (GET) antes de publicar.

## 8. Ideias discutidas mas AINDA NÃO implementadas

- Modal de detalhe do produto (clicar na foto abre descrição completa + escolher quantidade)
- Selo de "Mais vendido"/"Promoção" (precisaria de coluna extra na planilha)
- Valor mínimo de pedido com aviso
- Horário de funcionamento **dinâmico** ("Aberto agora" / "Fechado, abre às Xh") calculado via JS a partir de `STORE_EXTRA_INFO.hours`
- Cache leve dos dados da API (evitar refetch a cada carregamento)
- PWA (instalável, ícone na tela inicial)
- Web Share API (compartilhar produto individual)

## 9. Onde está o código atual

O arquivo completo e atualizado (`index.html`, único arquivo, ~900 linhas) já está pronto e funcional com tudo listado na seção 6. Está disponível nos outputs desta conversa — se o Codex for continuar o desenvolvimento, o ideal é colar o conteúdo completo do arquivo junto com este contexto, ou referenciar que o arquivo já existe e pedir para o Codex trabalhar incrementalmente nele (evitando reescrever do zero).
