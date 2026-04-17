## Context

Sistema PDV desenvolvido do zero usando apenas HTML, CSS e JavaScript puro. A arquitetura deve ser simples, modular e totalmente responsiva para funcionar em desktops e dispositivos móveis.

## Goals / Non-Goals

**Goals:**
- Interface responsiva mobile-first
- Armazenamento local persistente via localStorage
- Design moderno e intuitivo
- Modularidade com separação clara de responsabilidades
- Performance otimizada sem frameworks externos

**Non-Goals:**
- Backend ou API externa
- Autenticação de usuários
- Integração com meios de pagamento reais
- Impressão de recibos físicos

## Decisions

### Arquitetura: SPA com múltiplas views
- **Decision**: Usar uma única página HTML com views alternáveis via JavaScript
- **Rationale**: Simplicidade, performance e compatibilidade mobile
- **Alternatives**: Múltiplas páginas HTML (rejeitado: recarregamento lento)

### Armazenamento: localStorage
- **Decision**: Persistir dados no localStorage do navegador
- **Rationale**: Não requer backend, funciona offline
- **Alternatives**: IndexedDB (rejeitado: complexidade desnecessária), API externa (rejeitado: requisito de pureza)

### CSS: Mobile-first com CSS Grid e Flexbox
- **Decision**: Abordagem mobile-first com media queries para desktop
- **Rationale**: Melhor experiência em dispositivos móveis
- **Alternatives**: Desktop-first (rejeitado: maioria dos usuários em mobile)

### Estrutura de módulos:
- `js/models/` - Classes de dados (Product, Cart, Sale)
- `js/services/` - Lógica de negócio (Storage, CartManager, Payment)
- `js/views/` - Renderização e DOM manipulation
- `js/app.js` - Inicialização e roteamento

### Ícones: Lucide via CDN
- **Decision**: Usar Lucide icons via CDN
- **Rationale**: Ícones modernos, leves, sem dependência de build

## Risks / Trade-offs

- **Risk**: Limite de armazenamento do localStorage (~5MB)
  - **Mitigation**: Compactar dados, implementar limpeza automática de vendas antigas

- **Risk**: Perda de dados ao limpar navegador
  - **Mitigation**: Exportação/Importação manual de dados

- **Risk**: Não funciona em múltiplos dispositivos simultaneamente
  - **Mitigation**: Sistema é local por design, não requer sincronização

## Migration Plan

1. Desenvolver estrutura base HTML/CSS
2. Implementar módulos JavaScript
3. Integrar views e navegação
4. Testar responsividade em diferentes tamanhos
5. Deploy como arquivos estáticos

## Open Questions

- Nenhuma - requisitos claros
