## ADDED Requirements

### Requirement: Sidebar deve ser colapsável manualmente
A sidebar DEVE permitir expansão e colapso manual via botão e atalho de teclado.

#### Scenario: Usuário clica no botão de colapsar
- **GIVEN** a sidebar está expandida (240px)
- **WHEN** o usuário clica no botão de toggle no header da sidebar
- **THEN** a sidebar colapsa para 64px de largura
- **AND** o texto dos itens de navegação desaparece (opacity 0)
- **AND** o main-content ajusta seu margin-left para 64px
- **AND** o estado é persistido no localStorage

#### Scenario: Usuário pressiona atalho de teclado
- **GIVEN** a sidebar está em qualquer estado
- **WHEN** o usuário pressiona Ctrl+B (ou Cmd+B no Mac)
- **THEN** a sidebar alterna entre expandida e colapsada
- **AND** a transição ocorre suavemente em 350ms

#### Scenario: Tooltip aparece no modo colapsado
- **GIVEN** a sidebar está colapsada
- **WHEN** o usuário faz hover sobre um item de navegação
- **THEN** um tooltip aparece à direita do ícone mostrando o label completo
- **AND** o tooltip desaparece quando o mouse sai

### Requirement: Navegação hierárquica com submenus
A sidebar DEVE suportar menus de 2 níveis (pai/filho) com expansão/colapso.

#### Scenario: Usuário expande menu pai
- **GIVEN** existe um item de menu "Produtos" com submenus
- **AND** o submenu está colapsado
- **WHEN** o usuário clica no item "Produtos"
- **THEN** o submenu expande mostrando os itens filhos
- **AND** um indicador visual (seta) gira para indicar expansão
- **AND** a altura da sidebar ajusta-se com transição suave

#### Scenario: Usuário seleciona item filho
- **GIVEN** o submenu "Produtos" está expandido
- **WHEN** o usuário clica em "Cadastrar" (item filho)
- **THEN** a navegação ocorre para a view de cadastro
- **AND** o item "Cadastrar" recebe estado visual "ativo"
- **AND** o item pai "Produtos" recebe estado visual "ativo indireto"
- **AND** o submenu permanece expandido

#### Scenario: Menu ativo persiste expansão
- **GIVEN** um item filho está ativo (ex: "Listar")
- **WHEN** a página é recarregada
- **THEN** o submenu "Produtos" já aparece expandido
- **AND** o item "Listar" mantém estado ativo

### Requirement: Indicadores visuais de estado
Os itens de navegação DEVEM ter estados visuais claros.

#### Scenario: Item raiz ativo
- **WHEN** um item de menu raiz (sem filhos) está selecionado
- **THEN** ele exibe background primary-color e texto branco
- **AND** um indicador lateral (border-left ou barra) aparece

#### Scenario: Item pai com filho ativo
- **GIVEN** um item filho está ativo
- **THEN** o item pai exibe background sutil diferente do ativo
- **AND** um indicador lateral de cor diferente aparece
- **AND** o label do pai permanece visível

#### Scenario: Hover em item
- **WHEN** o mouse passa sobre qualquer item não-ativo
- **THEN** o item exibe background de hover (gray-100)
- **AND** a transição ocorre em 150ms
