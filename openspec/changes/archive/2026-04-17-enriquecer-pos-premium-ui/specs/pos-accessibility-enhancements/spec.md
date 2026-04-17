## ADDED Requirements

### Requirement: Conformance WCAG 2.2 Level AA
O sistema SHALL atender aos critérios de sucesso WCAG 2.2 nível AA.

#### Scenario: Contraste de texto
- **WHEN** o sistema é auditado para acessibilidade
- **THEN** todo o texto normal tem razão de contraste mínima de 4.5:1 contra seu background

#### Scenario: Contraste de texto grande
- **WHEN** texto é 18pt+ ou 14pt+ bold
- **THEN** a razão de contraste mínima é 3:1

#### Scenario: Contraste de UI components
- **WHEN** componentes UI (bordas, ícones) são verificados
- **THEN** a razão de contraste mínima é 3:1 contra cores adjacentes

### Requirement: Target Size Mínimo
O sistema SHALL garantir áreas de toque/clique adequadas.

#### Scenario: Tamanho mínimo de alvo
- **WHEN** elementos interativos são medidos
- **THEN** cada um tem área mínima de 24x24px (CSS pixels), conforme WCAG 2.2 SC 2.5.8

#### Scenario: Alvos importantes maiores
- **WHEN** botões críticos (adicionar, checkout, controles de quantidade) são verificados
- **THEN** eles têm área mínima de 44x44px para melhor usabilidade

#### Scenario: Espaçamento entre alvos
- **WHEN** elementos clicáveis estão próximos
- **THEN** o espaçamento entre eles permite 24x24px para cada sem sobreposição

### Requirement: Focus Visible
O sistema SHALL implementar indicadores de foco claros para navegação por teclado.

#### Scenario: Foco em elementos interativos
- **WHEN** um elemento recebe foco via teclado (Tab)
- **THEN** um indicador de foco visível aparece: outline de 2px solid #6366f1, offset de 2px, borda arredondada consistente com o elemento

#### Scenario: Foco não em mouse click
- **WHEN** um elemento recebe foco via mouse click
- **THEN** o outline de foco NÃO aparece (usando :focus-visible), evitando poluição visual

#### Scenario: Foco em cards
- **WHEN** um card de produto recebe foco
- **THEN** além do outline, ele aplica os mesmos estilos de hover (elevação, sombra) para clareza

### Requirement: Skip Links
O sistema SHALL implementar links para pular navegação.

#### Scenario: Skip to main content
- **WHEN** a página carrega
- **THEN** um link invisível (skip-link) está disponível como primeiro elemento focável, permitindo usuários de teclado pular direto para a área principal de produtos

#### Scenario: Skip to cart
- **WHEN** em desktop
- **THEN** um segundo skip-link permite pular direto para o carrinho

#### Scenario: Visibilidade do skip link
- **WHEN** o skip link recebe foco
- **THEN** ele se torna visível (position: fixed, top: 0, left: 0, z-index: 10000, estilizado como botão primário)

### Requirement: Estrutura Semântica HTML
O sistema SHALL usar elementos HTML semânticos apropriados.

#### Scenario: Landmarks principais
- **WHEN** a estrutura HTML é verificada
- **THEN** os seguintes landmarks estão presentes: `<header>`, `<main>`, `<nav>` (categorias), `<aside>` (carrinho em desktop), `<footer>` ou seção de checkout

#### Scenario: Hierarquia de headings
- **WHEN** a página é analisada
- **THEN** os headings seguem hierarquia lógica (h1 para título principal, h2 para seções, h3 para subseções), sem saltos

#### Scenario: Listas estruturadas
- **WHEN** listas de itens são renderizadas (produtos, categorias, itens do carrinho)
- **THEN** elas usam elementos `<ul>`/`<li>` ou `<ol>`/`<li>` apropriados, não apenas divs genéricas

### Requirement: ARIA Labels e Roles
O sistema SHALL implementar atributos ARIA onde necessário.

#### Scenario: Botões com ícones apenas
- **WHEN** um botão contém apenas um ícone (sem texto visível)
- **THEN** ele tem `aria-label` descrevendo a ação (ex: "Remover item", "Aumentar quantidade")

#### Scenario: Botões com texto e ícone
- **WHEN** um botão tem texto + ícone
- **THEN** o ícone tem `aria-hidden="true"` para evitar leitura duplicada

#### Scenario: Search input
- **WHEN** o campo de busca está presente
- **THEN** ele tem `role="search"` no formulário container ou `aria-label="Buscar produtos"` no input

#### Scenario: Live regions
- **WHEN** o carrinho é atualizado
- **THEN** o container do carrinho tem `aria-live="polite"` para anunciar adições/remoções a leitores de tela

#### Scenario: Estado atual do carrinho
- **WHEN** itens são adicionados/removidos
- **THEN** uma mensagem é anunciada via aria-live: "[Nome do produto] adicionado ao carrinho. Total: X itens"

### Requirement: Keyboard Navigation
O sistema SHALL implementar navegação completa por teclado.

#### Scenario: Tab order lógico
- **WHEN** o usuário pressiona Tab
- **THEN** o foco segue fluxo visual lógico: header → categorias → busca → produtos → carrinho → checkout

#### Scenario: Tab dentro do carrinho
- **WHEN** dentro da coluna/drawer do carrinho
- **THEN** Tab navega entre: itens → controles de quantidade → botão remover → checkout

#### Scenario: Escape para fechar
- **WHEN** um modal, drawer, ou bottom sheet está aberto
- **THEN** pressionar ESC fecha o elemento e retorna foco ao elemento que o abriu

#### Scenario: Atalhos de teclado
- **WHEN** o usuário está na tela POS
- **THEN** os seguintes atalhos funcionam:
  - `+`/`-` no item focado: aumentar/diminuir quantidade
  - `Delete` ou `Backspace` no item focado: remover item (com confirmação se quantidade > 1)
  - `1-9`: selecionar categoria correspondente (desktop)
  - `/` ou `Ctrl+K`: focar no campo de busca
  - `ESC`: fechar modais/drawers ou limpar busca

### Requirement: Focus Trap em Modais
O sistema SHALL implementar trap de foco em elementos modais.

#### Scenario: Foco preso no drawer/modal
- **WHEN** um drawer ou modal está aberto
- **THEN** o foco do teclado fica preso dentro dele - Tab no último elemento vai para o primeiro, Shift+Tab no primeiro vai para o último

#### Scenario: Restauração de foco
- **WHEN** o drawer/modal fecha
- **THEN** o foco retorna ao elemento que o abriu (botão que acionou, ou card de produto)

### Requirement: Screen Reader Anúncios
O sistema SHALL fornecer feedback auditivo para ações importantes.

#### Scenario: Anúncio de adição
- **WHEN** um produto é adicionado ao carrinho
- **THEN** leitores de tela anunciam: "[Nome do produto] adicionado. Carrinho agora tem X itens, total R$ XX,XX"

#### Scenario: Anúncio de remoção
- **WHEN** um item é removido
- **THEN** leitores de tela anunciam: "[Nome do produto] removido do carrinho"

#### Scenario: Anúncio de erro
- **WHEN** ocorre um erro (produto sem estoque, falha na adição)
- **THEN** leitores de tela anunciam via `aria-live="assertive"`: "Erro: [mensagem específica]"

#### Scenario: Anúncio de loading
- **WHEN** produtos estão carregando
- **THEN** leitores de tela anunciam: "Carregando produtos, aguarde" via aria-live

### Requirement: Formulários Acessíveis
O sistema SHALL implementar formulários acessíveis.

#### Scenario: Labels associados
- **WHEN** inputs de formulário estão presentes (busca, quantidade manual)
- **THEN** cada input tem `<label>` associado via `for` attribute, ou `aria-label`/`aria-labelledby`

#### Scenario: Estados de erro
- **WHEN** um input tem erro de validação
- **THEN** a mensagem de erro é associada via `aria-describedby` e o input tem `aria-invalid="true"`

#### Scenario: Descrições de inputs
- **WHEN** um input precisa de contexto adicional
- **THEN** uma descrição é fornecida via `aria-describedby` (ex: "Digite o código do produto ou nome para buscar")

### Requirement: Imagens Acessíveis
O sistema SHALL tratar imagens adequadamente para acessibilidade.

#### Scenario: Imagens de produto
- **WHEN** um produto tem imagem
- **THEN** ela tem `alt="[Nome do produto]"` - descrição funcional, não apenas "Imagem do produto"

#### Scenario: Imagens decorativas
- **WHEN** uma imagem é puramente decorativa (ícones, backgrounds)
- **THEN** ela tem `alt=""` (string vazia) ou `aria-hidden="true"` e `role="presentation"`

#### Scenario: Produtos sem imagem
- **WHEN** um produto não tem imagem
- **THEN** o placeholder é renderizado como div com `aria-hidden="true"` e texto alternativo no card (nome do produto já presente)

### Requirement: Alt Text de Ícones
O sistema SHALL fornecer alternativas textuais para ícones.

#### Scenario: Ícones com propósito claro
- **WHEN** um ícone comunica informação (ex: ícone de check para "em estoque")
- **THEN** ele tem `aria-label` descrevendo o significado, ou está associado a texto visível

#### Scenario: Ícones decorativos
- **WHEN** um ícone é puramente decorativo (estético)
- **THEN** ele tem `aria-hidden="true"` e `focusable="false"` (para SVGs)

### Requirement: Zoom e Reflow
O sistema SHALL suportar zoom até 400%.

#### Scenario: Reflow a 400% zoom
- **WHEN** o usuário dá zoom de 400%
- **THEN** o conteúdo reflow sem necessidade de scroll horizontal (WCAG 1.4.10), layout adapta para single column

#### Scenario: Texto escalável
- **WHEN** o usuário aumenta tamanho de fonte do navegador
- **THEN** todos os textos escalam proporcionalmente sem quebra de layout

### Requirement: Motion e Vestibular
O sistema SHALL respeitar preferências de movimento.

#### Scenario: prefers-reduced-motion
- **WHEN** o usuário tem `prefers-reduced-motion: reduce`
- **THEN** todas as animações automáticas (shimmer, entrada de elementos, etc.) são desabilitadas ou substituídas por transições instantâneas

#### Scenario: Parar animações
- **WHEN** uma animação dura mais que 5 segundos (shimmer de loading)
- **THEN** o usuário pode pausar ou a animação para automaticamente após 5s
