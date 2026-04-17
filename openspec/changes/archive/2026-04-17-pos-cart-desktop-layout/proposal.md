# Proposal: pos-cart-desktop-layout

## Problem Statement

A tela de POS (Ponto de Venda) atual possui problemas de layout no carrinho quando usada em desktop:

- **Altura limitada**: O carrinho não ocupa a altura total disponível da viewport, resultando em um visual compacto e subutilizado do espaço da tela
- **Layout não otimizado para desktop**: A interface parece projetada principalmente para dispositivos móveis, não aproveitando o espaço horizontal extra disponível em monitores desktop
- **Experiência do usuário degradada**: Operadores de caixa em desktop precisam rolar excessivamente dentro de um carrinho pequeno, reduzindo a eficiência no atendimento

## Goals

1. **Ocupar altura total da viewport**: O carrinho deve estender-se de ponta a ponta verticalmente (100vh menos header/footer) em telas desktop
2. **Layout responsivo adaptativo**: Implementar um layout grid que reorganize elementos inteligentemente para desktop (ex: 2-3 colunas) vs mobile (1 coluna)
3. **Melhor utilização do espaço horizontal**: Aproveitar áreas laterais para mostrar informações complementares (resumo, ações rápidas) sem comprometer o carrinho
4. **Manter consistência visual**: Preservar o design system existente (PDV Pro) com cores, sombras sutis e tipografia Inter

## Non-Goals

- Não alterar a funcionalidade core de adicionar/remover itens do carrinho
- Não modificar a lógica de cálculo de valores ou integração com API
- Não adicionar novas features (ex: busca de produtos, histórico) - foco apenas em layout/UX
- Não criar tema escuro (conforme design system atual)

## Solution Overview

Implementar um layout CSS Grid/Flexbox responsivo que:

1. **Desktop (>1024px)**: Layout de 3 colunas - catálogo de produtos (esquerda), carrinho principal (centro, 100% altura), resumo/ações (direita)
2. **Tablet (768px-1024px)**: Layout de 2 colunas - catálogo + carrinho expansível
3. **Mobile (<768px)**: Manter layout atual de 1 coluna com carrinho em drawer/modal

Utilizar `min-h-screen` e `h-full` com flexbox para garantir que o carrinho ocupe todo o espaço vertical disponível, evitando scroll interno desnecessário.

### New Capabilities

- `responsive-pos-layout`: Sistema de layout adaptativo para diferentes breakpoints de tela
- `full-height-cart`: Carrinho com altura dinâmica ajustada à viewport
- `desktop-optimized-grid`: Grid de 3 colunas para desktop com áreas definidas (produtos, carrinho, ações)

### Modified Capabilities

- Nenhum - esta mudança é puramente de layout/UX, sem alteração de requisitos funcionais

## Impact

**Arquivos afetados:**
- `pages/pos.html` - Estrutura HTML do layout
- `css/pos.css` ou `style.css` - Estilos responsivos e grid
- Possível ajuste em `js/pos.js` - Se houver lógica de resize/scroll

**Dependências:**
- TailwindCSS (já configurado no projeto)
- Design System PDV Pro (cores, tipografia, espaçamento)
- Nenhuma dependência externa nova

**Testes:**
- Verificar em múltiplos breakpoints (1920px, 1366px, 1024px, 768px, 375px)
- Testar com carrinho vazio, com poucos itens, e com muitos itens (scroll interno apenas quando necessário)
