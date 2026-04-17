## ADDED Requirements

### Requirement: Breakpoints responsivos
O sistema SHALL implementar media queries para 3 breakpoints principais: desktop (>= 1024px), tablet (>= 768px e < 1024px), e mobile (< 768px).

#### Scenario: Desktop layout
- **WHEN** a viewport tem largura >= 1024px
- **THEN** o layout exibe 3 colunas fixas: coluna de categorias (200px fixa), área de produtos (flex: 1), coluna do carrinho (380px fixa), todas visíveis simultaneamente

#### Scenario: Tablet layout
- **WHEN** a viewport tem largura >= 768px e < 1024px
- **THEN** o layout exibe: sidebar de categorias (colapsável, 60px ícone-only ou 200px expandida), área de produtos (flex: 1), carrinho em drawer lateral (escondido por padrão, slide-in quando aberto)

#### Scenario: Mobile layout
- **WHEN** a viewport tem largura < 768px
- **THEN** o layout exibe: header fixo, área de produtos em full-width (1-2 colunas grid), carrinho como bottom sheet (escondido por padrão), navegação por tabs ou bottom nav

### Requirement: Layout Desktop - 3 Colunas
O sistema SHALL implementar layout de três colunas para desktop com todas as seções visíveis.

#### Scenario: Categorias visíveis
- **WHEN** em desktop
- **THEN** a coluna de categorias (200px) mostra lista completa com ícones e labels, permitindo scroll independente se necessário

#### Scenario: Grid de produtos
- **WHEN** em desktop
- **THEN** a área central mostra grid de 3-4 colunas de produtos, com scroll independente, header de busca e filtros sticky no topo desta coluna

#### Scenario: Carrinho sempre visível
- **WHEN** em desktop
- **THEN** a coluna do carrinho (380px) permanece visível à direita, mostrando itens, quantidades, subtotal, total, e botão de checkout, com scroll independente

#### Scenario: Altura completa
- **WHEN** em desktop
- **THEN** todas as três colunas ocupam 100vh menos a altura do header, sem scroll da página inteira (cada coluna scrolla independentemente)

### Requirement: Layout Tablet - Drawer de Carrinho
O sistema SHALL implementar drawer lateral para o carrinho em tablet.

#### Scenario: Drawer fechado
- **WHEN** o drawer está fechado
- **THEN** apenas um botão flutuante "Carrinho (X itens)" é visível no canto inferior direito, mostrando badge com contagem

#### Scenario: Abrir drawer
- **WHEN** o usuário clica no botão de carrinho ou em um produto (adicionar)
- **THEN** o drawer desliza da direita (slide-in), cobrindo 50-60% da largura, com backdrop semi-transparente escurecendo o resto

#### Scenario: Drawer aberto - interação
- **WHEN** o drawer está aberto
- **THEN** ele exibe os mesmos componentes do carrinho desktop (itens, controles, totais), permitindo scroll interno, e fecha ao clicar no backdrop ou botão X

#### Scenario: Fechar drawer
- **WHEN** o usuário clica fora do drawer, no botão X, ou pressiona ESC
- **THEN** o drawer desliza para fora (slide-out), backdrop desaparece, foco retorna ao elemento que abriu

### Requirement: Layout Mobile - Bottom Sheet
O sistema SHALL implementar bottom sheet para o carrinho em mobile.

#### Scenario: Bottom sheet fechado
- **WHEN** o bottom sheet está fechado
- **THEN** uma barra flutuante (floating action bar) aparece no bottom, mostrando "X itens - R$ XX,XX" e botão "Ver Carrinho"

#### Scenario: Abrir bottom sheet
- **WHEN** o usuário clica na barra flutuante ou arrasta para cima (swipe up)
- **THEN** o bottom sheet expande de baixo para cima, ocupando 70-85% da altura, com handle visual na parte superior

#### Scenario: Bottom sheet parcial
- **WHEN** o usuário dá swipe down leve no handle
- **THEN** o bottom sheet colapsa para estado "peek" mostrando apenas totais e botão checkout

#### Scenario: Fechar bottom sheet
- **WHEN** o usuário arrasta para baixo além do threshold (swipe down longo), clica no backdrop, ou pressiona ESC
- **THEN** o bottom sheet desliza para baixo e desaparece completamente

### Requirement: Sidebar de Categorias Responsiva
O sistema SHALL implementar sidebar de categorias adaptativa.

#### Scenario: Desktop - sidebar expandida
- **WHEN** em desktop
- **THEN** a sidebar mostra ícone + label para cada categoria, com 200px de largura fixa

#### Scenario: Tablet - sidebar colapsável
- **WHEN** em tablet
- **THEN** a sidebar pode estar: expandida (200px, ícone + label) ou colapsada (60px, apenas ícones), com toggle button no topo

#### Scenario: Mobile - bottom sheet de categorias
- **WHEN** em mobile
- **THEN** as categorias são acessadas via: dropdown no header, ou horizontal scroll de chips/badges abaixo do header, ou modal bottom sheet quando há muitas categorias

### Requirement: Touch Targets em Mobile
O sistema SHALL garantir que todos os elementos interativos sejam adequados para touch.

#### Scenario: Tamanho mínimo touch target
- **WHEN** em dispositivos touch
- **THEN** todos os elementos clicáveis têm área mínima de 44x44px (incluindo padding invisível se necessário)

#### Scenario: Espaçamento entre elementos
- **WHEN** em dispositivos touch
- **THEN** elementos clicáveis adjacentes têm gap mínimo de 8px para evitar toques acidentais

### Requirement: Orientação de Tela
O sistema SHALL suportar ambas as orientações (portrait e landscape) em tablets.

#### Scenario: Tablet portrait
- **WHEN** tablet em portrait
- **THEN** layout similar ao mobile é aplicado (bottom sheet, grid adaptativo)

#### Scenario: Tablet landscape
- **WHEN** tablet em landscape
- **THEN** layout similar ao desktop é aplicado (3 colunas se couber, ou 2 colunas com drawer)

### Requirement: Viewport Meta Tag
O sistema SHALL configurar viewport corretamente para impedir zoom indesejado.

#### Scenario: Meta tag configurada
- **WHEN** a página é carregada
- **THEN** o head contém: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` (ou equivalente que previne zoom em inputs)
