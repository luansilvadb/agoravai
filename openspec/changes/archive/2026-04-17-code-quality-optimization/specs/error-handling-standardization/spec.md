## ADDED Requirements

### Requirement: Tratamento de erros deve ser consistente
Todas as operações que podem falhar DEVEM ter tratamento de erro padronizado.

#### Scenario: Try-catch em operações async
- **WHEN** executando operação assíncrona que pode falhar
- **THEN** envolver em try-catch block
- **AND** capturar erro específico, não genérico

#### Scenario: Mensagens de erro descritivas
- **WHEN** lançando ou logando erro
- **THEN** incluir contexto: `throw new Error('Failed to load cart: ${error.message}')`
- **AND** NUNCA usar mensagens genéricas como 'Error occurred'

#### Scenario: Early error throwing
- **WHEN** detectando condição inválida no início da função
- **THEN** lançar erro imediatamente (fail fast)
- **AND** NUNCA propagar estado inválido

### Requirement: Validação de inputs deve ser centralizada
Validações repetidas DEVEM ser extraídas para funções reutilizáveis.

#### Scenario: Validação de parâmetros obrigatórios
- **WHEN** função requer parâmetros obrigatórios
- **THEN** validar no início com guard clause
- **AND** lançar erro específico se ausente: `if (!id) throw new Error('id is required')`

#### Scenario: Validação de tipo
- **WHEN** parâmetro deve ser de tipo específico
- **THEN** validar e lançar erro informativo
- **AND** exemplo: `if (typeof price !== 'number') throw new TypeError('price must be a number')`

#### Scenario: Validação de range
- **WHEN** valor deve estar dentro de range
- **THEN** validar e lançar erro descritivo
- **AND** exemplo: `if (quantity < 0) throw new RangeError('quantity cannot be negative')`

### Requirement: Defaults devem ser explícitos
Valores padrão DEVEM ser claramente definidos e documentados.

#### Scenario: Parâmetros com default
- **WHEN** função aceita parâmetros opcionais
- **THEN** usar default parameters: `function loadData(limit = 10)`
- **AND** NUNCA deixar undefined propagar silenciosamente

#### Scenario: Fallback para valores ausentes
- **WHEN** acessando valor que pode ser null/undefined
- **THEN** usar nullish coalescing: `const name = user?.name ?? 'Anonymous'`
- **AND** não usar OR lógico para defaults (evita conflito com falsy values)

### Requirement: Logging deve ser informativo
Logs DEVEM fornecer contexto suficiente para debugging.

#### Scenario: Log de operações importantes
- **WHEN** executando operação significativa
- **THEN** logar com contexto: `console.log('Cart loaded:', { itemCount: cart.items.length })`
- **AND** evitar logs sem dados: `console.log('done')`

#### Scenario: Log de erros
- **WHEN** capturando erro
- **THEN** usar console.error com stack quando relevante
- **AND** incluir contexto da operação: `console.error('Failed to save order:', error)`
