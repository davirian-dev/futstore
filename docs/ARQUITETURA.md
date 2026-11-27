# FutStore Brasil — Arquitetura & Documentação

> Documento em Markdown (compatível com Obsidian e agentes de IA).

## 1. Visão Geral
- **Nome:** FutStore Brasil (`futstore`)
- **Tipo:** E-commerce esportivo (camisas tailandesas 1:1, retrô, personalização, cupons de sócios, carrinho local e cálculo de frete grátis) + Painel administrativo.
- **Stack:** HTML5, Tailwind CSS CDN, JavaScript Vanilla (`app.js`), JSON (`produtos.json`), Vercel (`vercel.json`).

## 2. Estrutura do Projeto
- `index.html`: Vitrine da loja, seções promocionais, modal/drawer de carrinho e checkout.
- `app.js`: Lógica de catálogo (`carregarProdutos`), carrinho em `localStorage`, cupons de sócio (`DAVI10`, `RUAN10`, `GUILHERME10`, `FUT10`), versão torcedor/jogador e prova social.
- `produtos.json`: Base estática de produtos, categorias, preços e imagens.
- `painel/index.html`: Painel administrativo dos sócios FutStore.
- `assets/produtos/` e `assets/videos/`: Imagens `.webp` dos mantos e vídeo hero.
- `privacidade.html`, `termos.html`, `robots.txt`, `sitemap.xml`, `vercel.json`.

## 3. Regras para IA
1. **Catálogo Centralizado:** Produtos e imagens devem seguir o padrão existente em `produtos.json` e `assets/produtos/`.
2. **Integridade do Carrinho & Cupons:** Alterações em preços, acréscimo de versão jogador, frete grátis (`META_FRETE_GRATIS`) ou cupons passam sempre por `app.js`.
3. **Validação:** Verificar sintaxe de `app.js` (`node --check app.js`) e integridade JSON de `produtos.json` após editar.
