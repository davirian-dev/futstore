# Regras do Projeto — FutStore Brasil

- **Documentação:** Consulte `docs/ARQUITETURA.md` e `docs/WORKFLOW-IA.md` antes de alterar o projeto.
- **Arquivos Principais:**
  - Vitrine: `index.html`
  - Lógica de loja, carrinho e cupons: `app.js`
  - Catálogo de produtos: `produtos.json`
  - Painel dos sócios: `painel/index.html`
- **Validação:** Sempre valide `produtos.json` e execute `node --check app.js` após alterações.

## Padrões de Qualidade & Engenharia (Antigravity Suite)
- **Rigor Técnico (Gravitas)**: Ler os componentes e seus chamadores antes de mutações; validar integridade com testes e checagem de sintaxe (
ode --check ou 
pm run build).
- **Design & UI Anti-Slop (Impeccable)**:
  - Usar /impeccable critique ou /impeccable polish antes de fechar alterações de interface.
  - Evitar gradientes genéricos roxo/violeta sem motivo, manter contraste WCAG AA (mínimo 4.5:1) e hierarquia tipográfica com saltos mínimos de 1.25x entre títulos.
  - Não aninhar cards dentro de cards desnecessariamente.
- **Arquitetura (Graphify)**: O projeto possui grafo AST indexado em graphify-out/. Para navegar por dependências ou refatorações de alto impacto, consulte o grafo ou execute graphify query.
