## ADDED Requirements

### Requirement: Persistência de estado da sidebar
O sistema DEVE persistir preferências de UI do usuário.

#### Scenario: Estado de colapso é restaurado
- **GIVEN** o usuário colapsou a sidebar manualmente
- **WHEN** a página é recarregada ou reaberta
- **THEN** a sidebar mantém-se colapsada
- **AND** o localStorage contém `"collapsed": true`

#### Scenario: Submenus expandidos são restaurados
- **GIVEN** o usuário expandiu os menus "Produtos" e "Histórico"
- **WHEN** a página é recarregada
- **THEN** ambos os submenus aparecem expandidos
- **AND** o localStorage contém `"expandedMenus": ["products", "history"]`

#### Scenario: Rota atual é rastreada
- **WHEN** o usuário navega para qualquer view
- **THEN** a rota é salva no localStorage como `"lastRoute"`
- **AND** isso pode ser usado para restaurar contexto futuramente

### Requirement: API JavaScript para controle da sidebar
O sistema DEVE expor API para controle programático da sidebar.

#### Scenario: Expander sidebar via API
- **GIVEN** a sidebar está colapsada
- **WHEN** código chama `window.sidebarController.expand()`
- **THEN** a sidebar expande para 240px
- **AND** o estado é atualizado no localStorage

#### Scenario: Colapsar sidebar via API
- **GIVEN** a sidebar está expandida
- **WHEN** código chama `window.sidebarController.collapse()`
- **THEN** a sidebar colapsa para 64px
- **AND** o estado é atualizado no localStorage

#### Scenario: Toggle sidebar via API
- **WHEN** código chama `window.sidebarController.toggle()`
- **THEN** a sidebar alterna entre expandida/colapsada

#### Scenario: Expande submenu via API
- **GIVEN** o menu "Produtos" está colapsado
- **WHEN** código chama `window.sidebarController.expandMenu("products")`
- **THEN** o submenu expande
- **AND** "products" é adicionado a `expandedMenus` no localStorage

### Requirement: Sincronização entre múltiplas abas
O sistema DEVE sincronizar estado entre abas do mesmo origin.

#### Scenario: Mudança em uma aba reflete em outra
- **GIVEN** o usuário tem 2 abas abertas do PDV
- **WHEN** o usuário colapsa a sidebar na aba 1
- **THEN** a aba 2 detecta a mudança via `storage` event
- **AND** a sidebar na aba 2 também colapsa automaticamente
