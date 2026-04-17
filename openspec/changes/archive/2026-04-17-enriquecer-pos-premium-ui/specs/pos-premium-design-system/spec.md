## ADDED Requirements

### Requirement: Sistema de tokens CSS
O sistema SHALL implementar tokens CSS custom properties no `:root` para todas as variáveis visuais do POS premium.

#### Scenario: Tokens de cores definidos
- **WHEN** o arquivo CSS é carregado
- **THEN** as seguintes propriedades customizadas estão disponíveis: --color-primary (#6366f1), --color-primary-dark (#4f46e5), --color-secondary (#f97316), --color-bg (#fafafa), --color-surface (#ffffff), --color-text-primary (#1f2937), --color-text-secondary (#6b7280), --color-border (#e5e7eb)

#### Scenario: Tokens de tipografia definidos
- **WHEN** o arquivo CSS é carregado
- **THEN** as seguintes propriedades de fonte estão disponíveis: --font-family ('Inter', system-ui, sans-serif), --font-size-xs (0.75rem), --font-size-sm (0.875rem), --font-size-base (1rem), --font-size-lg (1.125rem), --font-size-xl (1.25rem), --font-size-2xl (1.5rem), --font-size-3xl (1.875rem), --font-weight-normal (400), --font-weight-medium (500), --font-weight-semibold (600), --font-weight-bold (700)

#### Scenario: Tokens de espaçamento definidos
- **WHEN** o arquivo CSS é carregado
- **THEN** as seguintes propriedades de espaçamento estão disponíveis: --spacing-1 (0.25rem), --spacing-2 (0.5rem), --spacing-3 (0.75rem), --spacing-4 (1rem), --spacing-5 (1.25rem), --spacing-6 (1.5rem), --spacing-8 (2rem), --spacing-10 (2.5rem), --spacing-12 (3rem)

#### Scenario: Tokens de sombra e elevação
- **WHEN** o arquivo CSS é carregado
- **THEN** as seguintes propriedades de shadow estão disponíveis: --shadow-sm (0 1px 2px rgba(0,0,0,0.05)), --shadow-md (0 4px 6px rgba(0,0,0,0.1)), --shadow-lg (0 10px 15px rgba(0,0,0,0.1)), --shadow-primary (0 4px 14px rgba(99, 102, 241, 0.4))

#### Scenario: Tokens de borda e raio
- **WHEN** o arquivo CSS é carregado
- **THEN** as seguintes propriedades de border estão disponíveis: --radius-sm (6px), --radius-md (8px), --radius-lg (12px), --radius-xl (16px), --radius-full (9999px)

### Requirement: Componente Card de Produto
O sistema SHALL implementar um componente visual Card para exibição de produtos no POS.

#### Scenario: Estrutura do card
- **WHEN** um produto é renderizado
- **THEN** o card contém: imagem (aspect-ratio 4/3), nome do produto, preço, categoria/badges opcionais, e área de interação para adicionar ao carrinho

#### Scenario: Estados visuais do card
- **WHEN** o usuário interage com o card
- **THEN** os seguintes estados visuais são aplicados: default (border transparent, shadow-sm), hover (translateY(-4px), shadow-lg, border visível), active (scale(0.98)), disabled (opacity 0.5, cursor not-allowed, pointer-events none)

### Requirement: Componente Button
O sistema SHALL implementar um componente Button reutilizável com múltiplas variantes.

#### Scenario: Variantes de botão
- **WHEN** um botão é renderizado
- **THEN** as seguintes variantes estão disponíveis e aplicam os estilos corretos: primary (fundo índigo, texto branco, shadow), secondary (fundo cinza claro, texto escuro), ghost (transparente, borda, texto índigo), danger (fundo vermelho, texto branco)

#### Scenario: Estados do botão
- **WHEN** o usuário interage com o botão
- **THEN** os estados visuais são: default, hover (scale(1.02), shadow aumentado), active (scale(0.98)), disabled (opacity 0.5, cursor not-allowed), loading (spinner substitui texto, mantém dimensões)

#### Scenario: Tamanhos de botão
- **WHEN** um botão é renderizado
- **THEN** os tamanhos disponíveis são: sm (padding y 0.375rem, fonte xs), md (padding y 0.625rem, fonte sm), lg (padding y 0.875rem, fonte base)

### Requirement: Componente QuantityControl
O sistema SHALL implementar um controle de quantidade com botões + e - e display numérico.

#### Scenario: Estrutura do controle
- **WHEN** o controle é renderizado
- **THEN** ele contém: botão - (esquerda), input/display de quantidade (centro, min-width 3rem), botão + (direita)

#### Scenario: Target size acessível
- **WHEN** os botões de quantidade são renderizados
- **THEN** cada botão tem dimensões mínimas de 44x44px (WCAG 2.2 target size)

#### Scenario: Limites de quantidade
- **WHEN** a quantidade atinge o mínimo (1) ou máximo (definido)
- **THEN** o botão correspondente (- ou +) é desabilitado visualmente (opacity reduzida, cursor not-allowed)

### Requirement: Componente CartItemRow
O sistema SHALL implementar uma linha de item no carrinho com produto, quantidade, preço e remoção.

#### Scenario: Estrutura da linha
- **WHEN** um item é adicionado ao carrinho
- **THEN** a linha mostra: thumbnail do produto (48x48px), nome e variantes (se houver), controle de quantidade, preço total do item, botão de remover

#### Scenario: Estado vazio do carrinho
- **WHEN** o carrinho está vazio
- **THEN** exibe mensagem ilustrativa "Seu carrinho está vazio" com ícone e sugestão para adicionar produtos

### Requirement: Componente Toast
O sistema SHALL implementar notificações toast para feedback de ações.

#### Scenario: Variantes de toast
- **WHEN** uma notificação é exibida
- **THEN** as variantes disponíveis são: success (ícone check, borda/background verde), error (ícone x, borda/background vermelho), info (ícone i, borda/background azul), warning (ícone !, borda/background laranja)

#### Scenario: Posicionamento e duração
- **WHEN** um toast é acionado
- **THEN** ele aparece no topo direito (desktop) ou topo central (mobile), permanece visível por 4 segundos ou até fechamento manual, e desaparece com animação de fade + slide

### Requirement: Componente Skeleton
O sistema SHALL implementar skeleton screens para estados de loading.

#### Scenario: Estrutura do skeleton
- **WHEN** dados estão carregando
- **THEN** o skeleton card exibe: placeholder de imagem (aspect-ratio 4/3, background cinza), linhas de texto (2-3 linhas com width variado), tudo com animação shimmer (gradiente animado horizontal)

#### Scenario: Animação shimmer
- **WHEN** o skeleton é visível
- **THEN** uma animação CSS move um gradiente linear de -200% para 200% a cada 1.5s, criando efeito de brilho passando

### Requirement: Sistema de Grid Layout
O sistema SHALL implementar layouts em grid responsivos para organização do conteúdo.

#### Scenario: Grid de produtos desktop
- **WHEN** a viewport é >= 1024px
- **THEN** os produtos são exibidos em grid de 3-4 colunas com gap de --spacing-4

#### Scenario: Grid de produtos tablet
- **WHEN** a viewport é >= 768px e < 1024px
- **THEN** os produtos são exibidos em grid de 2-3 colunas com gap de --spacing-3

#### Scenario: Grid de produtos mobile
- **WHEN** a viewport é < 768px
- **THEN** os produtos são exibidos em grid de 2 colunas (ou 1 em telas muito pequenas < 480px) com gap de --spacing-2

### Requirement: Header Premium
O sistema SHALL implementar um header fixo com branding e ações principais.

#### Scenario: Estrutura do header
- **WHEN** a página POS é carregada
- **THEN** o header contém: logo/brand (esquerda), título/contexto atual (centro), ações globais - tema, usuário, logout (direita)

#### Scenario: Header fixo
- **WHEN** o usuário scrolla a página
- **THEN** o header permanece fixo no topo (position: fixed, z-index: 100), com backdrop-blur quando conteúdo passa por baixo

### Requirement: Componente Search
O sistema SHALL implementar busca de produtos com input estilizado.

#### Scenario: Estrutura da busca
- **WHEN** o componente é renderizado
- **THEN** ele contém: ícone de lupa (esquerda, dentro do input), input de texto com placeholder "Buscar produtos...", botão de limpar (x, aparece apenas quando há texto)

#### Scenario: Estados do input
- **WHEN** o input de busca interage
- **THEN** os estados são: default (border normal), focus (border índigo, ring de 2px), disabled (background cinza, cursor not-allowed)
