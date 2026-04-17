## ADDED Requirements

### Requirement: Nomenclatura de variáveis deve ser descritiva
Todos os identificadores DEVEM comunicar claramente seu propósito.

#### Scenario: Variáveis booleanas
- **WHEN** declarando variável booleana
- **THEN** usar prefixo `is`, `has`, `can`, `should` (ex: `isLoading`, `hasPermission`)
- **AND** NUNCA usar nomes genéricos como `flag`, `status`, `ok`

#### Scenario: Variáveis de contadores
- **WHEN** declarando contadores
- **THEN** incluir o que está sendo contado (ex: `itemCount`, `retryAttempts`)
- **AND** NUNCA usar `i`, `j`, `k` exceto em loops curtos

#### Scenario: Variáveis de acumuladores
- **WHEN** declarando acumuladores
- **THEN** nomear pelo resultado final (ex: `totalPrice`, `formattedDate`)

### Requirement: Nomenclatura de funções deve seguir padrão verbo-substantivo
Funções DEVEM ter nomes que indicam claramente a ação e o alvo.

#### Scenario: Funções que retornam booleano
- **WHEN** função verifica uma condição
- **THEN** usar `isValid`, `hasItem`, `canAccess` (começa com verbo auxiliar)

#### Scenario: Funções que transformam dados
- **WHEN** função modifica ou converte dados
- **THEN** usar `formatDate`, `parseToken`, `normalizeInput` (verbo + alvo)

#### Scenario: Funções que executam ações
- **WHEN** função executa operação com side effects
- **THEN** usar `saveUser`, `deleteItem`, `sendNotification` (verbo + substantivo)

#### Scenario: Funções que buscam dados
- **WHEN** função recupera dados
- **THEN** usar `fetchUser`, `getConfig`, `loadSettings` (verbo de obtenção)

#### Scenario: Funções que calculam valores
- **WHEN** função computa valor baseado em inputs
- **THEN** usar `calculateTotal`, `computeDistance`, `determineStatus` (verbo de cálculo)

### Requirement: Nomenclatura de constantes deve usar UPPER_SNAKE_CASE
Constantes de configuração e valores fixos DEVEM usar naming convention consistente.

#### Scenario: Constantes mágicas
- **WHEN** valor numérico ou string aparece diretamente no código
- **THEN** extrair para constante com UPPER_SNAKE_CASE
- **AND** exemplo: `const MAX_RETRY_COUNT = 3`

#### Scenario: Chaves de storage
- **WHEN** usando chaves para localStorage
- **THEN** extrair para constante descritiva: `const STORAGE_KEY_CART = 'cart_data'`

#### Scenario: Configurações de app
- **WHEN** valores de configuração são definidos
- **THEN** usar `const DEFAULT_PAGE_SIZE = 10`
