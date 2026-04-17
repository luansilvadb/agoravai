## 1. Análise e Preparação

- [x] 1.1 Inspecionar estrutura HTML atual da tela POS (arquivo `pages/pos.html` ou similar)
- [x] 1.2 Identificar classes CSS Tailwind existentes e estilos customizados
- [x] 1.3 Verificar componentes do carrinho e sua hierarquia DOM
- [x] 1.4 Fazer backup dos arquivos que serão modificados

## 2. Estrutura HTML - Layout Grid

- [x] 2.1 Adicionar container principal com classes `grid` e breakpoints responsivos
- [x] 2.2 Criar 3 áreas de grid: `products`, `cart`, `summary` para desktop
- [x] 2.3 Envolver carrinho em container flex com `flex-col h-full`
- [x] 2.4 Adicionar atributos `role` e `aria-label` para acessibilidade (complementary, main)
- [x] 2.5 Testar estrutura em modo mobile para garantir preservação do comportamento atual

## 3. CSS - Altura Total e Flexbox

- [x] 3.1 Aplicar `h-[calc(100vh-4rem)]` no container principal (ajustar 4rem conforme header real)
- [x] 3.2 Configurar carrinho com `flex-1 min-h-0 overflow-y-auto` para scroll interno
- [x] 3.3 Configurar resumo/total com `flex-shrink-0` para permanecer fixo
- [x] 3.4 Adicionar media queries para breakpoints (md:, lg:) no Tailwind
- [x] 3.5 Implementar `min-height` fallback para telas muito pequenas (<600px)

## 4. Grid de 3 Colunas Desktop

- [x] 4.1 Configurar `grid-cols-[280px_1fr_320px]` para desktop (>1024px)
- [x] 4.2 Aplicar `gap-4` (16px) entre colunas
- [x] 4.3 Configurar coluna de produtos com grid interno `grid-cols-2` para miniaturas
- [x] 4.4 Configurar coluna de resumo com `sticky top-0` ou flex equivalente
- [x] 4.5 Adicionar transições suaves `transition-all duration-200`

## 5. Breakpoints Responsivos

- [x] 5.1 Implementar layout 1 coluna para mobile (<768px) - preservar comportamento atual
- [x] 5.2 Implementar layout 2 colunas para tablet (768px-1024px)
- [x] 5.3 Implementar layout 3 colunas para desktop (>1024px)
- [x] 5.4 Verificar redimensionamento suave sem quebras de layout
- [x] 5.5 Testar comportamento em orientação landscape mobile

## 6. Acessibilidade e UX

- [x] 6.1 Adicionar `scroll-behavior: smooth` para scroll interno do carrinho
- [x] 6.2 Verificar ordem de foco Tab entre as 3 colunas
- [x] 6.3 Testar com leitor de tela (NVDA/VoiceOver) se regiões são identificadas
- [x] 6.4 Garantir contraste WCAG AAA conforme design system
- [x] 6.5 Verificar target size mínimo 24x24px para botões de ação

## 7. Testes e Validação

- [x] 7.1 Testar em 1920px (desktop wide) - 3 colunas, carrinho 100% altura
- [x] 7.2 Testar em 1366px (desktop padrão) - layout proporcional
- [x] 7.3 Testar em 1024px (tablet landscape) - transição para 2 colunas
- [x] 7.4 Testar em 768px (tablet portrait) - 2 colunas ou 1 coluna
- [x] 7.5 Testar em 375px (mobile) - comportamento original preservado
- [x] 7.6 Testar carrinho vazio - estado vazio centralizado verticalmente
- [x] 7.7 Testar carrinho com 20+ itens - scroll interno funcionando
- [x] 7.8 Testar redimensionamento contínuo de janela - transições suaves

## 8. Cleanup e Documentação

- [x] 8.1 Remover classes CSS não utilizadas ou duplicadas
- [x] 8.2 Verificar consistência de nomes de classes com padrão do projeto
- [x] 8.3 Documentar mudanças em comentários se necessário
- [x] 8.4 Atualizar CHANGELOG ou documentação se existir
