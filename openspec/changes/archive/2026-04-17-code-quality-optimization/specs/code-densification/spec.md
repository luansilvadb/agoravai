## ADDED Requirements

### Requirement: Eliminar código redundante
O sistema DEVE remover duplicações de código aplicando o princípio DRY.

#### Scenario: Identificação de duplicação
- **WHEN** dois ou mais blocos de código compartilham 3+ linhas idênticas
- **THEN** extrair para função utilitária reutilizável

#### Scenario: Consolidar validações repetidas
- **WHEN** múltiplas funções validam os mesmos critérios
- **THEN** criar validador único centralizado

### Requirement: Simplificar estruturas condicionais
O sistema DEVE substituir nesting profundo por early returns.

#### Scenario: Conversão de if-aninhado
- **WHEN** uma função contém 3+ níveis de if/else aninhados
- **THEN** converter para early returns com guard clauses

#### Scenario: Flatten de condicionais simples
- **WHEN** uma condicional tem apenas 2 branches simples
- **THEN** considerar conversão para ternary operator quando legível

### Requirement: Aplicar features modernas do JavaScript
O sistema DEVE utilizar ES6+ features para reduzir verbosidade.

#### Scenario: Destructuring em parâmetros
- **WHEN** uma função acessa múltiplas propriedades de um objeto
- **THEN** usar destructuring no parâmetro ou primeira linha

#### Scenario: Template literals
- **WHEN** strings usam concatenação com +
- **THEN** substituir por template literals com backticks

#### Scenario: Optional chaining
- **WHEN** acesso a propriedades aninhadas requer verificação de null
- **THEN** usar optional chaining operator (?.)

#### Scenario: Nullish coalescing
- **WHEN** atribuir valores default para null/undefined
- **THEN** usar nullish coalescing (??) em vez de OR lógico (||)
