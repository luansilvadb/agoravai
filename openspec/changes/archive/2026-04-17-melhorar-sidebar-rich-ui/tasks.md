## 1. Estrutura HTML da Sidebar

- [x] 1.1 Refatorar estrutura da sidebar em `index.html` com novas classes (sidebar-collapsed, nav-parent, nav-children)
- [x] 1.2 Adicionar botão de toggle no header da sidebar
- [x] 1.3 Reorganizar nav-items em estrutura hierárquica (Produtos, Histórico com submenus)
- [x] 1.4 Criar estrutura do footer fixo com user context
- [x] 1.5 Adicionar tooltips HTML (estrutura para CSS-only)

## 2. CSS - Layout e Estados da Sidebar

- [x] 2.1 Implementar variáveis CSS para larguras (240px, 64px) e transições
- [x] 2.2 Criar estilos base da sidebar expandida (posição fixed, flex column)
- [x] 2.3 Criar estilos da sidebar colapsada (width 64px, textos ocultos)
- [x] 2.4 Implementar transições suaves (width, margin-left, opacity 350ms ease)
- [x] 2.5 Ajustar `main-content` margin-left dinâmico (240px ↔ 64px)
- [x] 2.6 Criar tooltips CSS-only para modo colapsado (::after pseudo-element)

## 3. CSS - Navegação Hierárquica

- [x] 3.1 Estilizar itens de menu pai (com indicador de expansão/seta)
- [x] 3.2 Criar estilos para submenus (padding-left, background sutil)
- [x] 3.3 Implementar animação de expansão/colapso de submenus (max-height/opacity)
- [x] 3.4 Criar estados visuais: item ativo (primary), ativo indireto (gray), hover
- [x] 3.5 Girar indicador de seta quando submenu expandido

## 4. CSS - Footer Fixo

- [x] 4.1 Criar estrutura do footer (position sticky/fixed dentro da sidebar)
- [x] 4.2 Estilizar área de user context (avatar, nome, caixa, status)
- [x] 4.3 Estilizar botões de ação (config, ajuda, logout)
- [x] 4.4 Adaptar footer para modo colapsado (apenas ícones)

## 5. JavaScript - SidebarController

- [x] 5.1 Criar classe `SidebarController` em `js/app.js` ou arquivo separado
- [x] 5.2 Implementar método `toggle()` para expandir/colapsar
- [x] 5.3 Implementar métodos `expand()` e `collapse()`
- [x] 5.4 Implementar listener de atalho de teclado (Ctrl/Cmd+B)
- [x] 5.5 Implementar método `expandMenu(menuId)` e `collapseMenu(menuId)`
- [x] 5.6 Implementar `toggleMenu(menuId)` para cliques em itens pai

## 6. JavaScript - Persistência de Estado

- [x] 6.1 Implementar `localStorage` key `pdv_sidebar_state`
- [x] 6.2 Salvar estado `collapsed` ao alterar
- [x] 6.3 Salvar array `expandedMenus` ao expandir/colapsar submenus
- [x] 6.4 Implementar `loadState()` para restaurar estado na inicialização
- [x] 6.5 Sincronizar entre abas via `storage` event listener

## 7. JavaScript - Navegação e Ativos

- [x] 7.1 Atualizar lógica de clique para distinguir pai vs filho
- [x] 7.2 Implementar marcação de item ativo (remove/add classes)
- [x] 7.3 Implementar marcação de "ativo indireto" em pais quando filho selecionado
- [x] 7.4 Restaurar menus expandidos baseado no item ativo após reload
- [x] 7.5 Integrar com Router existente (`window.router.navigate`)

## 8. Integração e Refinamento

- [x] 8.1 Garantir compatibilidade mobile (manter drawer overlay existente)
- [x] 8.2 Testar transições suaves em diferentes navegadores
- [x] 8.3 Verificar acessibilidade (ARIA labels, roles, keyboard navigation)
- [x] 8.4 Testar persistência entre reloads
- [x] 8.5 Testar sincronização multi-abas
- [x] 8.6 Ajustar z-index e stacking context se necessário

## 9. Testes e Validação

- [x] 9.1 Validar specs em `sidebar-navigation.md` (todos os cenários passam)
- [x] 9.2 Validar specs em `sidebar-state.md` (todos os cenários passam)
- [x] 9.3 Validar specs em `user-context.md` (todos os cenários passam)
- [x] 9.4 Testar em telas pequenas (1024px, 768px) - mobile drawer preservado
- [x] 9.5 Testar performance (transições GPU-accelerated)
