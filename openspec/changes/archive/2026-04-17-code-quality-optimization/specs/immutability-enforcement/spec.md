## ADDED Requirements

### Requirement: Operações de objetos devem ser imutáveis
Todas as operações que modificam objetos DEVEM usar spread operator para criar novas instâncias.

#### Scenario: Atualização de propriedade
- **WHEN** atualizando uma propriedade de um objeto
- **THEN** usar `const newObj = { ...obj, prop: newValue }`
- **AND** NUNCA usar `obj.prop = newValue`

#### Scenario: Atualização de múltiplas propriedades
- **WHEN** atualizando várias propriedades de um objeto
- **THEN** usar `const newObj = { ...obj, ...updates }`

#### Scenario: Remoção de propriedade
- **WHEN** removendo uma propriedade de um objeto
- **THEN** usar destructuring com rest: `const { removed, ...rest } = obj`

### Requirement: Operações de arrays devem ser imutáveis
Todas as operações que modificam arrays DEVEM usar métodos imutáveis.

#### Scenario: Adicionar elemento
- **WHEN** adicionando item ao array
- **THEN** usar spread: `const newArr = [...arr, item]` ou `[item, ...arr]`
- **AND** NUNCA usar `arr.push(item)`

#### Scenario: Remover elemento
- **WHEN** removendo item de array por índice
- **THEN** usar `const newArr = arr.filter((_, i) => i !== index)`
- **AND** NUNCA usar `arr.splice(index, 1)`

#### Scenario: Atualizar elemento
- **WHEN** atualizando item específico
- **THEN** usar `const newArr = arr.map((item, i) => i === index ? newItem : item)`
- **AND** NUNCA usar atribuição direta `arr[index] = newItem`

#### Scenario: Ordenar array
- **WHEN** ordenando elementos
- **THEN** usar `const newArr = [...arr].sort(comparator)`
- **AND** NUNCA usar `arr.sort()` diretamente

### Requirement: Array methods em vez de loops
Preferir métodos funcionais de array em vez de loops imperativos.

#### Scenario: Transformação de elementos
- **WHEN** transformando cada elemento de um array
- **THEN** usar `arr.map(transformFn)` em vez de for-loop

#### Scenario: Filtragem de elementos
- **WHEN** selecionando elementos que satisfazem condição
- **THEN** usar `arr.filter(predicateFn)` em vez de for-loop

#### Scenario: Busca de elemento
- **WHEN** encontrando primeiro elemento que satisfaz condição
- **THEN** usar `arr.find(predicateFn)` em vez de for-loop

#### Scenario: Redução para valor único
- **WHEN** agregando array para valor scalar
- **THEN** usar `arr.reduce(reducer, initial)` em vez de for-loop
