## ADDED Requirements

### Requirement: Footer fixo com contexto do operador
A sidebar DEVE ter footer sempre visível com informações do operador.

#### Scenario: Footer sempre visível
- **GIVEN** a sidebar tem muitos itens de menu
- **WHEN** o usuário scrolla a navegação
- **THEN** o footer permanece fixo no bottom da sidebar
- **AND** não é afetado pelo scroll do conteúdo acima

#### Scenario: Informações do operador exibidas
- **GIVEN** um operador está "logado" (simulado para MVP)
- **THEN** o footer exibe:
  - Avatar/ícone do usuário
  - Nome do operador (ex: "João Silva")
  - Caixa atual (ex: "Caixa #3")
  - Status online/offline

#### Scenario: Ações no footer
- **GIVEN** o footer está visível
- **THEN** ele contém botões de ação:
  - Configurações (ícone de engrenagem)
  - Ajuda (ícone de interrogação)
  - Logout (ícone de porta/sair)

#### Scenario: Footer no modo colapsado
- **GIVEN** a sidebar está colapsada (64px)
- **THEN** o footer mostra apenas ícones (sem texto)
- **AND** os ícones mantêm espaçamento vertical adequado
- **AND** tooltips aparecem no hover

### Requirement: Estado do caixa
O footer DEVE indicar o estado atual do caixa.

#### Scenario: Caixa aberto
- **GIVEN** o caixa está aberto e operacional
- **THEN** o indicador de caixa mostra cor verde
- **AND** texto indica "Caixa #N - Aberto"

#### Scenario: Caixa fechado
- **GIVEN** o caixa está fechado
- **THEN** o indicador de caixa mostra cor cinza ou laranja
- **AND** texto indica "Caixa #N - Fechado"

#### Scenario: Click em caixa abre detalhes
- **WHEN** o usuário clica na área do caixa no footer
- **THEN** um modal ou dropdown mostra informações detalhadas
- **AND** opções de abrir/fechar caixa se aplicável
