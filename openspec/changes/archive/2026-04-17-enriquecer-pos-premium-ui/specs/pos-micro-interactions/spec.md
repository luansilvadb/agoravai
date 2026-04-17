## ADDED Requirements

### Requirement: Durações de Animação
O sistema SHALL implementar durações consistentes para diferentes tipos de interação.

#### Scenario: Micro-interactions rápidas
- **WHEN** o usuário interage com elementos (hover, click)
- **THEN** o tempo de transição é 150ms para feedback imediato

#### Scenario: Transições de estado
- **WHEN** o sistema muda de estado (abrir modal, mudar view)
- **THEN** o tempo de transição é 300ms

#### Scenario: Entrada de elementos
- **WHEN** novos elementos aparecem na tela
- **THEN** o tempo de entrada é 400ms com easing de ease-out

### Requirement: Easing Functions
O sistema SHALL usar easing functions específicas para diferentes tipos de movimento.

#### Scenario: Easing padrão
- **WHEN** uma animação genérica ocorre
- **THEN** ela usa cubic-bezier(0.4, 0, 0.2, 1) - Material Design standard

#### Scenario: Easing de entrada
- **WHEN** um elemento entra na tela
- **THEN** ele usa cubic-bezier(0, 0, 0.2, 1) - deceleração suave

#### Scenario: Easing de saída
- **WHEN** um elemento sai da tela
- **THEN** ele usa cubic-bezier(0.4, 0, 1, 1) - aceleração suave

#### Scenario: Easing com bounce
- **WHEN** uma ação precisa de atenção especial (success, importante)
- **THEN** ela pode usar cubic-bezier(0.34, 1.56, 0.64, 1) - leve overshoot/bounce

### Requirement: Animação de Hover em Cards
O sistema SHALL implementar elevação suave em cards de produto no hover.

#### Scenario: Hover em card de produto
- **WHEN** o cursor passa sobre um card de produto
- **THEN** o card: eleva 4px (translateY(-4px)), aumenta a sombra (shadow-sm → shadow-lg), adiciona borda visível (1px solid --color-border), tudo em 150ms

#### Scenario: Sair do hover
- **WHEN** o cursor sai do card
- **THEN** o card retorna ao estado original em 150ms

### Requirement: Animação de Click em Botões
O sistema SHALL implementar feedback tátil visual em botões.

#### Scenario: Click em botão primário
- **WHEN** o usuário clica em um botão primário
- **THEN** o botão: reduz para scale(0.98), diminui sombra, feedback instantâneo em 150ms

#### Scenario: Release do botão
- **WHEN** o usuário solta o clique
- **THEN** o botão retorna ao scale normal (1.0) com sombra restaurada, em 150ms

#### Scenario: Ripple effect
- **WHEN** o usuário clica em botões e cards interativos
- **THEN** um efeito ripple (onda circular) expande do ponto de click até preencher o elemento, fade out em 300ms

### Requirement: Animação de Adicionar ao Carrinho
O sistema SHALL implementar feedback visual quando produto é adicionado.

#### Scenario: Card "pula"
- **WHEN** um produto é adicionado ao carrinho
- **THEN** o card dá um "pulo" - scale de 1.0 → 1.05 → 1.0 com easing bounce, duração 400ms

#### Scenario: Badge do carrinho atualiza
- **WHEN** itens são adicionados
- **THEN** o badge de contagem no botão de carrinho faz "pop" - scale 1.0 → 1.3 → 1.0 com easing bounce, duração 300ms

#### Scenario: Shake no header do carrinho (desktop)
- **WHEN** o carrinho é atualizado em desktop
- **THEN** o header da coluna do carrinho dá um shake sutil - rotate de 0 → -2deg → 2deg → 0deg, duração 300ms

### Requirement: Animação de Quantidade
O sistema SHALL implementar feedback visual em controles de quantidade.

#### Scenario: Incremento de quantidade
- **WHEN** o usuário clica em "+"
- **THEN** o número: scale 1.0 → 1.2 (com cor primária) → 1.0, duração 200ms

#### Scenario: Decremento de quantidade
- **WHEN** o usuário clica em "-"
- **THEN** o número: scale 1.0 → 0.8 → 1.0, duração 200ms

### Requirement: Animação de Drawer/Modal
O sistema SHALL implementar transições suaves para drawers e modais.

#### Scenario: Abrir drawer lateral
- **WHEN** um drawer lateral é aberto
- **THEN** ele desliza de translateX(100%) para translateX(0), duração 300ms, easing ease-out

#### Scenario: Backdrop do drawer
- **WHEN** o drawer abre
- **THEN** o backdrop fade in de opacity 0 para 0.5, duração 300ms

#### Scenario: Abrir bottom sheet
- **WHEN** um bottom sheet é aberto
- **THEN** ele desliza de translateY(100%) para translateY(0), duração 300ms, easing com leve bounce

#### Scenario: Fechar drawer/bottom sheet
- **WHEN** fechado
- **THEN** animação reversa com duração 250ms (mais rápida para sentir responsivo)

### Requirement: Animação de Toast
O sistema SHALL implementar entrada e saída elegantes para toasts.

#### Scenario: Entrada do toast
- **WHEN** um toast aparece
- **THEN** ele: slide in de translateY(-100%) para translateY(0), fade in de opacity 0 para 1, duração 400ms, easing ease-out

#### Scenario: Saída do toast
- **WHEN** o toast fecha (timeout ou manual)
- **THEN** ele: slide out para translateY(-20px), fade out, duração 300ms

### Requirement: Animação de Loading - Skeleton
O sistema SHALL implementar shimmer effect em skeleton screens.

#### Scenario: Efeito shimmer
- **WHEN** skeleton cards são visíveis
- **THEN** um gradiente linear move-se horizontalmente através do card, de left -200% para right 200%, ciclo de 1.5s, infinito

#### Scenario: Gradiente shimmer
- **WHEN** o shimmer é aplicado
- **THEN** o gradiente é: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)

### Requirement: Staggered Animations
O sistema SHALL implementar animações escalonadas para listas de elementos.

#### Scenario: Entrada de grid de produtos
- **WHEN** produtos são renderizados
- **THEN** cada card entra com fade + slide up, com delay escalonado de 50ms entre cada card (card 1: 0ms, card 2: 50ms, card 3: 100ms, etc.)

#### Scenario: Máximo stagger delay
- **WHEN** há muitos itens na lista
- **THEN** o delay máximo é limitado a 500ms (primeiros 10 itens), itens subsequentes aparecem sem delay adicional

### Requirement: Animação de Remover Item do Carrinho
O sistema SHALL implementar feedback ao remover itens.

#### Scenario: Remover item
- **WHEN** um item é removido do carrinho
- **THEN** a linha: slide out para direita (translateX 100%), fade out, altura reduzida para 0, duração 300ms, depois é removida do DOM

### Requirement: prefers-reduced-motion
O sistema SHALL respeitar preferência do usuário por menos movimento.

#### Scenario: Usuário prefere reduced motion
- **WHEN** o usuário tem `prefers-reduced-motion: reduce` configurado
- **THEN** todas as animações são desabilitadas ou reduzidas a simples fades de 150ms (no transform/scale)
