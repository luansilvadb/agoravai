## ADDED Requirements

### Requirement: Sistema de Tokens de Tema
O sistema SHALL implementar variáveis CSS para três temas: light, dark, e high-contrast.

#### Scenario: Tokens de cor por tema
- **WHEN** o arquivo CSS de temas é carregado
- **THEN** os seguintes tokens são definidos para cada tema com valores diferentes:
  - --color-bg: background principal
  - --color-surface: superfícies elevadas (cards, drawers)
  - --color-surface-hover: hover em superfícies
  - --color-elevated: elementos flutuantes (toasts, modais)
  - --color-text-primary: texto principal
  - --color-text-secondary: texto secundário
  - --color-text-muted: texto terciário/desabilitado
  - --color-border: bordas
  - --color-border-hover: bordas em hover
  - --color-primary: cor primária (índigo)
  - --color-primary-hover: primária em hover
  - --color-primary-subtle: primária sutil (backgrounds)
  - --color-secondary: cor secundária (laranja)
  - --color-shadow: cor base para sombras

#### Scenario: Valores tema claro
- **WHEN** o tema claro é aplicado
- **THEN** os valores são: --color-bg: #fafafa, --color-surface: #ffffff, --color-text-primary: #1f2937, --color-text-secondary: #6b7280, --color-border: #e5e7eb, --color-shadow: rgba(0,0,0,0.1)

#### Scenario: Valores tema escuro
- **WHEN** o tema escuro é aplicado
- **THEN** os valores são: --color-bg: #0f172a, --color-surface: #1e293b, --color-surface-hover: #334155, --color-text-primary: #f8fafc, --color-text-secondary: #94a3b8, --color-text-muted: #64748b, --color-border: #334155, --color-shadow: rgba(0,0,0,0.4)

#### Scenario: Valores tema high-contrast
- **WHEN** o tema alto contraste é aplicado
- **THEN** os valores são: --color-bg: #000000, --color-surface: #000000, --color-text-primary: #ffffff, --color-text-secondary: #ffffff, --color-border: #ffffff, todas as bordas são 2px solid (não 1px)

### Requirement: Troca Dinâmica de Tema
O sistema SHALL permitir troca de tema sem recarregar a página.

#### Scenario: Aplicação via classe
- **WHEN** um tema é selecionado
- **THEN** uma classe é adicionada ao elemento `:root` (ou `document.documentElement`): .theme-light, .theme-dark, ou .theme-high-contrast

#### Scenario: Troca sem flash
- **WHEN** o tema é trocado
- **THEN** as cores mudam instantaneamente (via CSS variables), sem flash branco/preto, sem recarregar a página

#### Scenario: Transição suave de cores
- **WHEN** o tema é trocado
- **THEN** uma transição CSS de 200ms é aplicada a propriedades de cor (background-color, color, border-color) para mudança suave

### Requirement: Persistência de Preferência
O sistema SHALL salvar e restaurar a preferência de tema do usuário.

#### Scenario: Salvar no localStorage
- **WHEN** o usuário muda o tema manualmente
- **THEN** a escolha é salva em `localStorage` com chave `pos-theme` (valores: 'light', 'dark', 'high-contrast')

#### Scenario: Restaurar ao carregar
- **WHEN** a aplicação é carregada
- **THEN** o tema salvo em `localStorage` é aplicado automaticamente

#### Scenario: Tema padrão
- **WHEN** não há tema salvo (primeira visita)
- **THEN** o sistema detecta `prefers-color-scheme` do sistema operacional e aplica 'light' ou 'dark' automaticamente

### Requirement: Detecção prefers-color-scheme
O sistema SHALL respeitar a preferência do sistema operacional.

#### Scenario: Detecção automática inicial
- **WHEN** o usuário acessa pela primeira vez (sem tema salvo)
- **THEN** o sistema verifica `window.matchMedia('(prefers-color-scheme: dark)')` e aplica tema correspondente

#### Scenario: Listener para mudanças de sistema
- **WHEN** o usuário muda o tema do sistema operacional
- **THEN** a aplicação detecta via `matchMedia().addEventListener('change', ...)` e propõe alteração (ou aplica automaticamente se nunca trocou manualmente)

### Requirement: Componente ThemeToggle
O sistema SHALL implementar um componente para alternar entre temas.

#### Scenario: Botão de toggle
- **WHEN** o componente é renderizado
- **THEN** ele exibe: ícone representando tema atual (sol para claro, lua para escuro, contraste para high-contrast), label descritivo "Tema [atual]"

#### Scenario: Menu de seleção
- **WHEN** o usuário clica no botão de tema
- **THEN** um dropdown menu aparece com 3 opções: Claro, Escuro, Alto Contraste, cada uma com ícone e checkmark no tema atual

#### Scenario: Troca via menu
- **WHEN** o usuário seleciona um tema no menu
- **THEN** o tema é aplicado imediatamente, menu fecha, ícone do botão atualiza, e preferência é salva

#### Scenario: Keyboard acessível
- **WHEN** o menu de tema está aberto
- **THEN** ele é navegável por teclado: Tab entre opções, Enter para selecionar, ESC para fechar, foco é trapped no menu enquanto aberto

### Requirement: Tema High-Contrast
O sistema SHALL implementar tema especial para acessibilidade visual.

#### Scenario: Contraste máximo
- **WHEN** tema high-contrast é ativado
- **THEN** todas as cores são puramente preto e branco, com contraste 21:1 (máximo possível)

#### Scenario: Bordas obrigatórias
- **WHEN** tema high-contrast é ativado
- **THEN** todos os elementos interativos têm bordas de 2px solid branco (cards, botões, inputs), não importa o estado

#### Scenario: Focus visível máximo
- **WHEN** tema high-contrast é ativado e um elemento recebe foco
- **THEN** o outline é 4px solid com offset de 4px, garantindo visibilidade máxima

#### Scenario: Remoção de transparências
- **WHEN** tema high-contrast é ativado
- **THEN** nenhum elemento usa transparência (rgba com alpha < 1), sombras são removidas ou substituídas por bordas sólidas

#### Scenario: Texto sempre branco
- **WHEN** tema high-contrast é ativado
- **THEN** todo texto é #ffffff, sem tons de cinza, garantindo máximo contraste

### Requirement: Temas em Componentes Específicos
O sistema SHALL adaptar componentes específicos para cada tema.

#### Scenario: Skeleton em tema escuro
- **WHEN** skeleton screens são exibidos em tema escuro
- **THEN** o shimmer usa gradiente com cores mais claras (rgba(255,255,255,0.1) para rgba(255,255,255,0.2)), base é surface-hover mais escuro

#### Scenario: Toast em tema escuro
- **WHEN** toasts aparecem em tema escuro
- **THEN** eles usam background mais claro que surface (--color-elevated: #334155), mantendo legibilidade

#### Scenario: Inputs em tema escuro
- **WHEN** inputs de formulário em tema escuro
- **THEN** background é surface (não bg), border é visível (não transparente), placeholder usa text-muted

#### Scenario: Sombras em tema escuro
- **WHEN** tema escuro está ativo
- **THEN** sombras usam rgba(0,0,0,0.4) ou mais opaco para serem visíveis contra backgrounds escuros

### Requirement: Preview de Tema
O sistema SHALL permitir preview visual das opções de tema.

#### Scenario: Preview no menu
- **WHEN** o menu de seleção de tema está aberto
- **THEN** cada opção mostra um mini-preview visual (pequeno retângulo colorido) representando as cores principais do tema

### Requirement: Tema e Impressão
O sistema SHALL garantir legibilidade ao imprimir.

#### Scenario: Print stylesheet
- **WHEN** o usuário imprime a página (Ctrl+P)
- **THEN** o tema força light mode independente da preferência atual, removendo backgrounds coloridos, sombras, mantendo apenas texto e estrutura essencial
