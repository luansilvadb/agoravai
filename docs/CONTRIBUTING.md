# Guia de Contribuição - POS Premium

## Como Contribuir

### Criando um Novo Componente

1. **Estrutura do arquivo**
```javascript
/**
 * ComponentName Component
 * Brief description of the component
 * 
 * @see design.md for specifications
 */

export class ComponentName {
  /**
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = {
      // Default options
      ...options
    };
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    // Implementation
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Cleanup
  }
}

export default ComponentName;
```

2. **Localização**
   - Salve em `js/components/ui/ComponentName.js`

3. **Estilos**
   - Use CSS custom properties (design tokens)
   - Injete estilos via `_injectStyles()`
   - Siga o padrão BEM para nomes de classes

### Padrões de Código

#### CSS
```css
/* BEM Naming */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* Tokens */
.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .my-component {
    transition: none;
  }
}
```

#### JavaScript
```javascript
// Use ES6+ features
const myFunction = (param) => param * 2;

// Destructuring
const { prop1, prop2 } = options;

// Async/await
async function loadData() {
  const data = await fetchData();
  return data;
}

// Optional chaining
const value = obj?.property?.nested;
```

### Design Tokens

Use sempre os tokens CSS disponíveis:

| Tipo | Token | Exemplo |
|------|-------|---------|
| Cores | `--color-{name}` | `--color-primary` |
| Espaçamento | `--spacing-{n}` | `--spacing-4` |
| Tipografia | `--font-size-{size}` | `--font-size-base` |
| Sombras | `--shadow-{size}` | `--shadow-md` |
| Bordas | `--radius-{size}` | `--radius-lg` |

### Acessibilidade

Todo componente deve suportar:

1. **Keyboard navigation**
   - `Tab` order lógico
   - `Enter` / `Space` para ativar
   - `Escape` para fechar/fechar

2. **Screen readers**
   - `aria-label` para ícones
   - `aria-live` para atualizações
   - `role` apropriado

3. **Focus management**
   - `:focus-visible` para outline
   - Focus trap em modais
   - Restauração de foco

```javascript
// Exemplo de acessibilidade
render() {
  this.element = document.createElement('button');
  this.element.setAttribute('aria-label', 'Descrição do botão');
  this.element.setAttribute('aria-describedby', 'hint-id');
  
  return this.element;
}
```

### Animações

Use as utilidades de animação:

```javascript
import { 
  popAnimation, 
  Duration, 
  Easing,
  conditionalAnimation 
} from '../utils/animations.js';

// Animate with reduced motion support
conditionalAnimation(() => 
  popAnimation(this.element, 1.05, Duration.INSTANT)
);
```

### Testes

Antes de submeter:

1. **Teste visual**
   - Verifique em 3 viewports (desktop, tablet, mobile)
   - Teste todos os temas (light, dark, high-contrast)

2. **Teste de acessibilidade**
   - Navegue apenas com teclado
   - Verifique contraste
   - Teste com zoom 200% e 400%

3. **Teste de performance**
   - Verifique repaints no DevTools
   - Mantenha 60fps em animações

### Checklist de Componente

- [ ] JSDoc documentação
- [ ] Props documentadas
- [ ] CSS usando tokens
- [ ] Animações com `prefers-reduced-motion`
- [ ] Acessibilidade implementada
- [ ] Responsivo em 3 breakpoints
- [ ] High-contrast mode suportado
- [ ] Método `destroy()` implementado

### Exemplo Completo

Veja `Button.js` ou `Card.js` como exemplos de implementação completa.

## Dúvidas?

Abra uma issue no repositório.
