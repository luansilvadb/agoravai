## Why

O script `postinstall.js` atual possui código JavaScript com classes e métodos privados, mas carece de tipagem forte, separação clara de responsabilidades e adere à arquitetura DDD/Hexagonal. A refatoração para TypeScript permitirá maior segurança de tipos, testabilidade e manutenibilidade, alinhando o código aos padrões maduros do ecossistema.

## What Changes

- **BREAKING**: Conversão completa de JavaScript para TypeScript com tipagem estrita
- **BREAKING**: Reestruturação da arquitetura seguindo DDD (Domain-Driven Design) e Hexagonal Architecture
- **BREAKING**: Separação de responsabilidades em camadas: Domain, Application, Infrastructure
- Novo sistema de logging tipado e extensível via ports/adapters
- Novo sistema de error handling com domain errors específicos
- Novo serviço de filesystem desacoplado via interface/port
- Configuração via schema validado com Zod
- Suporte a testes unitários com injeção de dependências

## Capabilities

### New Capabilities
- `logger-port`: Abstração tipada para logging com múltiplos níveis e metadados estruturados
- `filesystem-port`: Interface desacoplada para operações de sistema de arquivos
- `config-validation`: Schema-driven configuration com validação de ambiente
- `copy-operations`: Serviço especializado em cópia recursiva de diretórios
- `error-domain`: Sistema de domain errors hierárquico e tipado

### Modified Capabilities
- (nenhum - este é um novo módulo refatorado)

## Impact

- **Scripts**: Substituição de `scripts/postinstall.js` por `scripts/postinstall/` (módulo TypeScript)
- **Build**: Adição de configuração TypeScript específica para scripts
- **Package.json**: Atualização do entry point do postinstall
- **Dependências**: Possível adição de `ts-node` ou `tsx` para execução
- **CI/CD**: Scripts de build devem compilar o postinstall antes da instalação
