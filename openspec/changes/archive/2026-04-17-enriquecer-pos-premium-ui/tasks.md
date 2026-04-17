## 1. Setup e Fundação

- [x] 1.1 Criar estrutura de diretórios: `js/components/ui/`, `js/utils/`, `css/pos-premium/`
- [x] 1.2 Criar arquivo `css/pos-premium/tokens.css` com CSS custom properties para tema claro
- [x] 1.3 Criar arquivo `js/utils/animations.js` com utilitários de easing e durações
- [x] 1.4 Criar arquivo `js/utils/accessibility.js` com helpers de a11y (focus trap, announce)
- [x] 1.5 Criar arquivo `js/theme.js` com lógica de tema (load, save, toggle, detect prefers-color-scheme)

## 2. Sistema de Design - Tokens e Variáveis

- [x] 2.1 Implementar tokens de cores no `tokens.css`: --color-primary, --color-bg, --color-surface, etc.
- [x] 2.2 Implementar tokens de tipografia: --font-family, --font-size-* escalas, --font-weight-*
- [x] 2.3 Implementar tokens de espaçamento: --spacing-1 a --spacing-12
- [x] 2.4 Implementar tokens de sombra: --shadow-sm, --shadow-md, --shadow-lg, --shadow-primary
- [x] 2.5 Implementar tokens de borda/radius: --radius-sm a --radius-full

## 3. Sistema de Temas

- [x] 3.1 Criar `css/pos-premium/theme-dark.css` com override de tokens para tema escuro
- [x] 3.2 Criar `css/pos-premium/theme-high-contrast.css` com override para alto contraste
- [x] 3.3 Implementar classe `.theme-light`, `.theme-dark`, `.theme-high-contrast` no `:root`
- [x] 3.4 Implementar transição suave entre temas (transition em propriedades de cor)
- [x] 3.5 Criar componente `js/components/ui/ThemeToggle.js` com dropdown de seleção
- [x] 3.6 Implementar persistência de tema em localStorage com chave 'pos-theme'
- [x] 3.7 Implementar detecção automática de `prefers-color-scheme` no primeiro load
- [x] 3.8 Implementar listener para mudanças de sistema operacional

## 4. Componentes UI Base

- [x] 4.1 Criar `js/components/ui/Button.js` com variantes (primary, secondary, ghost, danger) e tamanhos
- [x] 4.2 Implementar estados de botão: default, hover, active, disabled, loading
- [x] 4.3 Implementar ripple effect CSS em botões
- [x] 4.4 Criar `js/components/ui/Card.js` para cards de produto com estrutura definida
- [x] 4.5 Implementar estados visuais de Card: default, hover (elevação +4px), active, disabled
- [x] 4.6 Criar `js/components/ui/QuantityControl.js` com botões +/- e display
- [x] 4.7 Garantir target size de 44x44px nos botões de quantidade
- [x] 4.8 Implementar animação de número ao alterar quantidade (scale + color change)

## 5. Componentes de Carrinho

- [x] 5.1 Criar `js/components/ui/CartItemRow.js` com thumbnail, nome, quantidade, preço, remover
- [x] 5.2 Implementar estado vazio do carrinho com mensagem ilustrativa
- [x] 5.3 Criar `js/components/ui/Toast.js` com variantes (success, error, info, warning)
- [x] 5.4 Implementar posicionamento de toast: top-right desktop, top-center mobile
- [x] 5.5 Implementar auto-dismiss de toast após 4 segundos
- [x] 5.6 Criar `js/components/ui/SkeletonCard.js` com shimmer effect
- [x] 5.7 Implementar animação shimmer CSS (gradiente movendo horizontalmente)

## 6. Layout Responsivo

- [x] 6.1 Criar `css/pos-premium/layout-desktop.css` com grid de 3 colunas (200px | 1fr | 380px)
- [x] 6.2 Implementar scroll independente em cada coluna desktop
- [x] 6.3 Criar `css/pos-premium/layout-tablet.css` com sidebar colapsável e drawer de carrinho
- [x] 6.4 Implementar drawer lateral para carrinho em tablet (slide-in/out, backdrop)
- [x] 6.5 Criar `css/pos-premium/layout-mobile.css` com grid de produtos adaptativo
- [x] 6.6 Implementar bottom sheet para carrinho em mobile (swipe up/down, handle)
- [x] 6.7 Implementar categorias como horizontal scroll de chips em mobile
- [x] 6.8 Garantir touch targets de 44x44px em todos os elementos interativos mobile

## 7. Micro-interactions e Animações

- [x] 7.1 Implementar animação de hover em cards: translateY(-4px) + shadow aumentado
- [x] 7.2 Implementar animação de click em botões: scale(0.98) + shadow reduzido
- [x] 7.3 Implementar animação "pulo" do card ao adicionar ao carrinho (scale 1.0→1.05→1.0)
- [x] 7.4 Implementar animação de badge do carrinho ao atualizar (scale pop 1.0→1.3→1.0)
- [x] 7.5 Implementar shake sutil no header do carrinho desktop ao atualizar
- [x] 7.6 Implementar animação de entrada de toast (slide down + fade in)
- [x] 7.7 Implementar staggered animation para grid de produtos (delay 50ms entre cards)
- [x] 7.8 Implementar animação de remoção de item do carrinho (slide out + fade + height 0)
- [x] 7.9 Implementar suporte a `prefers-reduced-motion` (desabilitar/transformar animações)

## 8. Acessibilidade (WCAG 2.2 AA)

- [x] 8.1 Implementar skip links para "Pular para produtos" e "Pular para carrinho"
- [x] 8.2 Garantir contraste mínimo 4.5:1 para todo texto normal
- [x] 8.3 Garantir contraste mínimo 3:1 para componentes UI e texto grande
- [x] 8.4 Implementar outline de foco visível: 2px solid #6366f1, offset 2px, usando :focus-visible
- [x] 8.5 Adicionar `aria-label` em todos os botões de ícone (sem texto visível)
- [x] 8.6 Implementar `aria-live="polite"` no container do carrinho
- [x] 8.7 Implementar anúncios de screen reader para adicionar/remover itens
- [x] 8.8 Garantir estrutura HTML semântica: header, main, nav, aside, headings hierárquicos
- [x] 8.9 Implementar focus trap em drawers e modais
- [x] 8.10 Implementar restauração de foco ao fechar drawers/modais
- [x] 8.11 Implementar atalhos de teclado: +/- para quantidade, ESC para fechar, / para busca
- [x] 8.12 Adicionar `aria-describedby` para inputs com descrições/contexto
- [x] 8.13 Garantir alt text em todas as imagens de produto
- [x] 8.14 Testar zoom de 400% com reflow correto (sem scroll horizontal)

## 9. View Principal POS Premium

- [x] 9.1 Criar `js/views/PosPremiumView.js` estrutura base da view
- [x] 9.2 Implementar header fixo com logo, busca, e ThemeToggle
- [x] 9.3 Implementar sidebar de categorias com scroll independente
- [x] 9.4 Implementar grid de produtos com busca e filtros
- [x] 9.5 Implementar coluna/drawer/bottom sheet do carrinho (adaptativo por viewport)
- [x] 9.6 Integrar com `CartManager.js` existente (eventos: item:added, item:removed, cart:updated)
- [x] 9.7 Implementar renderização de produtos via componentes Card
- [x] 9.8 Implementar renderização de itens do carrinho via CartItemRow
- [x] 9.9 Implementar botão de checkout com navegação para CheckoutView
- [x] 9.10 Adicionar feature flag `usePremiumPOS` em localStorage para rollout gradual

## 10. Integração e Otimização

- [x] 10.1 Modificar `index.html` para carregar CSS pos-premium apenas quando necessário
- [x] 10.2 Modificar `js/app.js` para registrar rota da nova view PosPremiumView
- [x] 10.3 Implementar lazy loading de imagens de produtos (loading="lazy")
- [x] 10.4 Implementar CSS containment para isolar repaints (contain: layout paint)
- [x] 10.5 Otimizar animações para hardware acceleration (transform, opacity only)
- [x] 10.6 Criar `css/pos-premium/print.css` para estilos de impressão (forçar light mode)
- [ ] 10.7 Testar performance em dispositivos de entrada (throttling CPU if needed)

## 11. Testes e QA

- [ ] 11.1 Testar layout em desktop (1920px, 1366px, 1024px)
- [ ] 11.2 Testar layout em tablet (768px-1024px, portrait e landscape)
- [ ] 11.3 Testar layout em mobile (< 768px, 375px, 414px)
- [ ] 11.4 Testar navegação completa por teclado (Tab, Shift+Tab, Enter, ESC)
- [ ] 11.5 Testar com leitor de tela (NVDA ou VoiceOver)
- [ ] 11.6 Testar temas claro/escuro/alto-contraste em todas as views
- [ ] 11.7 Testar `prefers-reduced-motion` (reduzir animações)
- [ ] 11.8 Validar contraste com ferramenta (WCAG contrast checker)
- [ ] 11.9 Testar zoom 400% sem scroll horizontal
- [ ] 11.10 Testar touch targets em dispositivos reais ou emulador

## 12. Documentação e Handoff

- [x] 12.1 Criar documentação de componentes no código (JSDoc)
- [x] 12.2 Documentar tokens CSS disponíveis
- [x] 12.3 Documentar atalhos de teclado disponíveis
- [x] 12.4 Criar guia de contribuição para novos componentes UI
- [x] 12.5 Atualizar README com informações sobre o novo POS Premium
