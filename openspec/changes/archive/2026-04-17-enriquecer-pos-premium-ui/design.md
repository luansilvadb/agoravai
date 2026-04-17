## Context

O projeto atual possui uma arquitetura MVC em JavaScript vanilla com:
- **Models**: `Product.js`, `CartItem.js`, `Cart.js`, `User.js`
- **Services**: `CartManager.js`, `StorageService.js`
- **Views**: `CartView.js`, `CheckoutView.js`, `DashboardView.js`, etc.
- **CSS**: `style.css` com estilos básicos

A tela de POS atual utiliza `CartView.js` que apresenta uma interface funcional mas visualmente genérica, sem identidade visual própria. A estrutura HTML está em `index.html` com seções para produtos e carrinho lado a lado em desktop.

### Estado Atual
- Layout básico com duas colunas (produtos/carrinho)
- Estilos CSS inline ou classes genéricas
- Sem sistema de design definido
- Pouca hierarquia visual
- Responsividade limitada

### Stakeholders
- Usuários finais: Operadores de caixa (desktop) e vendedores mobile (tablet)
- Sistema: Deve integrar-se com `CartManager.js` existente

## Goals / Non-Goals

**Goals:**
1. Criar sistema de design visual premium com direção estética clara (luxury + modern tech)
2. Implementar layout responsivo verdadeiro (desktop: 1024px+, mobile: até 768px)
3. Adicionar micro-interactions significativas que reforçem ações críticas (adicionar item, finalizar venda)
4. Atingir conformidade WCAG 2.2 AA
5. Manter performance com CSS hardware-accelerated animations
6. Preservar 100% da compatibilidade com serviços existentes

**Non-Goals:**
- Alterar regras de negócio ou lógica de carrinho
- Adicionar dependências externas de UI (React, Vue, etc.)
- Redesenhar outras views (Checkout, Dashboard) - apenas POS
- Implementar backend ou alterar APIs

## Decisions

### Direção Visual: "Luxury Modern Tech"
Escolhemos uma direção premium inspirada em:
- Apple Store (clareza, hierarquia)
- Square POS (eficiência mobile)
- Notion (tipografia elegante, espaçamento generoso)

**Por que não Minimalista Brutal ou Maximalista?**
- Brutal seria muito austero para comércio que precisa transmitir calor humano
- Maximalista distraíria operadores durante fluxos rápidos de venda
- Luxury Modern Tech equilibra profissionalismo com calor humano necessário

### Sistema de Cores
**Paleta Primária:**
- `--color-primary`: #6366f1 (Índigo vibrante - energia, inovação)
- `--color-primary-dark`: #4f46e5 (versão escura para hover)
- `--color-secondary`: #f97316 (Laranja âmbar - ações importantes, cta)

**Paleta Neutros:**
- `--color-bg`: #fafafa (fundo quente, não puro branco)
- `--color-surface`: #ffffff (cards, elementos elevados)
- `--color-text-primary`: #1f2937 (quase preto, menos agressivo)
- `--color-text-secondary`: #6b7280 (cinza médio)
- `--color-border`: #e5e7eb (bordas sutis)

**Por que não gradientes em todo lugar?**
- Gradientes em excesso datam rapidamente a interface
- Usamos gradientes apenas no header e em estados especiais (promoções)
- Foco em superfícies com profundidade via sombras e elevação

### Tipografia
**Fonte Display**: Inter (Google Fonts) - moderna, legível, ótima em todos os tamanhos
**Escala**: Modular scale de 1.25 (4, 5, 6.25, 7.8125, 9.7656, 12.207 rem)
**Peso**: 400 (body), 500 (labels), 600 (subtítulos), 700 (títulos)

**Por que não serif ou fonte mais decorativa?**
- POS exige legibilidade em condições de loja (luz variada, distância)
- Inter é neutra o suficiente para não competir com conteúdo
- Suporte a numerais tabulares (preços alinhados)

### Layout Responsivo
**Desktop (1024px+):**
- Grid de 3 colunas: Categorias (200px) | Produtos (1fr) | Carrinho (380px)
- Carrinho sempre visível para contexto completo
- Teclado de atalhos exposto na UI

**Tablet/Mobile (até 768px):**
- Modo "foco": ou vê produtos, ou vê carrinho
- Bottom sheet para carrinho (desliza de baixo)
- Gestos: swipe left no produto = adicionar rápido
- Navbar flutuante com ações primárias

**Por que não layout idêntico em ambos?**
- Desktop tem espaço para contexto completo (produtos + carrinho)
- Mobile precisa de foco absoluto em uma tarefa por vez
- Tentar encaixar desktop em mobile resulta em interface minúscula

### Componentes Visuais

**Cards de Produto:**
- Elevação: box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
- Hover: translateY(-4px) + shadow mais profundo
- Borda: 1px solid transparent, mudando para --color-border no hover
- Imagem: aspect-ratio 4/3, object-fit cover, border-radius 12px

**Botões Primários:**
- Background: gradiente linear índigo (135deg)
- Shadow: 0 4px 14px rgba(99, 102, 241, 0.4)
- Hover: scale(1.02) + shadow mais intenso
- Active: scale(0.98) + shadow reduzido
- Border-radius: 12px (consistente com cards)

**Botões de Quantidade (+/-):**
- Forma circular, 40px de diâmetro
- Target size de 44x44px (WCAG 2.5.8)
- Ripple effect no click (CSS animation)

### Animações

**Durações:**
- Micro-interactions: 150ms (feedback instantâneo)
- Transições de estado: 300ms
- Entrada de elementos: 400ms ease-out

**Easing:**
- Padrão: cubic-bezier(0.4, 0, 0.2, 1)
- Entrada: cubic-bezier(0, 0, 0.2, 1)
- Saída: cubic-bezier(0.4, 0, 1, 1)
- Bounce sutil: cubic-bezier(0.34, 1.56, 0.64, 1)

**Animações Específicas:**
- Adicionar ao carrinho: Card "pula" (scale 1.05 → 1) + ícone flutua até carrinho
- Carrinho atualizado: Header "shake" sutil (rotate ±2deg)
- Loading: Shimmer effect em cards (skeleton screens)
- Toast notifications: Slide in from top + fade

**Por que não mais animações?**
- Operadores fazem ações repetitivas - animações excessivas causam fadiga
- Foco em animações que comunicam (adicionou? carregando? erro?)

### Acessibilidade

**WCAG 2.2 AA Compliance:**
- Contraste mínimo 4.5:1 para texto normal (testado em todas as combinações)
- Contraste mínimo 3:1 para UI components (bordas, ícones)
- Target size mínimo 24x24px (excedemos com 44x44px para botões críticos)
- Focus visible: outline de 2px solid #6366f1 com 2px offset
- Skip links para navegação rápida
- ARIA labels em todos os ícones/botões sem texto visível

**Keyboard Navigation:**
- Tab order lógico (categorias → produtos → carrinho → checkout)
- Atalhos: 
  - `ESC`: Fechar modais/drawers
  - `+`/`-`: Aumentar/diminuir quantidade no item focado
  - `Enter`: Confirmar ação
  - `1-9`: Selecionar categoria (atalho desktop)

**Screen Reader:**
- aria-live="polite" no carrinho para anúncio de adições
- aria-describedby em botões com contexto adicional
- role="alert" para erros e confirmações

### Sistema de Temas
Implementação via CSS custom properties + classe no `:root`:
- `.theme-light`: Padrão, definido acima
- `.theme-dark`: Background #0f172a, surface #1e293b, texto invertido
- `.theme-high-contrast`: Preto/branco puro, bordas 2px obrigatórias

Persistência via `localStorage`, aplicação sem flash via script no `<head>`.

## Risks / Trade-offs

**Risco: Performance em dispositivos antigos**
→ Mitigação: Todas animações usam `transform` e `opacity` (compositing layer). Fallback para `prefers-reduced-motion`. Teste em dispositivos de entrada antes de deploy.

**Risco: Curva de aprendizado para usuários acostumados com UI antiga**
→ Mitigação: Mantemos mesma estrutura mental (produtos à esquerda, carrinho à direita). Tooltips de onboarding nos primeiros 3 usos. Botão "voltar ao layout clássico" disponível por 30 dias.

**Risco: CSS bundle maior**
→ Mitigação: CSS dividido em `pos-premium.css` carregado apenas na rota POS. Gzipped deve adicionar <15KB. Tree-shaking de componentes não utilizados.

**Trade-off: Complexidade de manutenção**
A nova UI adiciona ~2000 linhas de CSS e vários componentes JavaScript. Benefício de UX justifica custo de manutenção para core feature do produto.

## Migration Plan

### Fase 1: Preparação
1. Criar `PosPremiumView.js` em paralelo, não substituir `CartView.js`
2. Feature flag `usePremiumPOS` em `localStorage`
3. CSS em arquivo separado para não afetar outras views

### Fase 2: Rollout Gradual
1. Semana 1: 10% dos usuários (beta opt-in)
2. Semana 2: 50% dos usuários (novos usuários default)
3. Semana 3: 100% dos usuários (com opção de voltar)
4. Semana 6: Remover flag e código antigo

### Rollback
- Feature flag permite volta instantânea
- CSS isolado não afeta outras páginas
- Dados em `CartManager.js` inalterados

## Open Questions

1. **Animação de "fly to cart"**: Devemos implementar com FLIP technique ou manter simples (scale only) por simplicidade?
   → Decisão: Iniciar com scale only, adicionar FLIP se feedback de usuários solicitar.

2. **Tema escuro**: Devemos detectar `prefers-color-scheme` automaticamente ou sempre iniciar em tema claro?
   → Decisão: Respeitar `prefers-color-scheme` no primeiro load, persistir escolha do usuário.

3. **Imagens de produtos**: UI assume imagens 4:3. O que fazer com produtos sem imagem?
   → Decisão: Placeholder com inicial do produto + cor gerada por hash do nome.

4. **Gestos mobile**: Swipe é intuitivo mas pode conflitar com scroll. Usar long-press + menu?
   → Decisão: Swipe horizontal apenas (direita → adicionar, esquerda → detalhes). Scroll vertical mantido.

## Technical Architecture

### Estrutura de Arquivos
```
js/
  views/
    PosPremiumView.js       # View principal POS (nova)
  components/
    ui/
      Button.js             # Componente botão reutilizável
      Card.js               # Card de produto
      QuantityControl.js    # Botões +/-/input quantidade
      CartItemRow.js        # Linha de item no carrinho
      Toast.js              # Notificações toast
      SkeletonCard.js       # Loading placeholder
      ThemeToggle.js        # Botão tema claro/escuro
  utils/
    animations.js           # Utilitários de animação (FLIP, etc.)
    accessibility.js        # Helpers a11y (focus trap, announce)
  theme.js                  # Lógica de tema (load/save/toggle)

css/
  pos-premium.css           # Estilos POS premium (tokens + componentes)
  pos-premium-responsive.css # Media queries responsivas

index.html                  # Modificado para suportar nova estrutura
```

### Integração com Sistema Existente
- `PosPremiumView` recebe `CartManager` via constructor (mesmo padrão atual)
- Eventos: `item:added`, `item:removed`, `cart:updated` (mesmo pub/sub)
- Nenhuma alteração em `CartManager`, `StorageService`, ou Models

### State Management
- Local: UI state (tema, modais abertos, categoria selecionada)
- Global via `CartManager`: Dados de carrinho (persistência automática)
