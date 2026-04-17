# POS Premium Components

Component library for the Premium POS interface.

## Installation

Components are loaded as ES modules. Ensure your build system supports ES6 imports:

```javascript
import { Button } from './js/components/ui/Button.js';
```

## Available Components

### Button

Reusable button with variants, sizes, and states.

```javascript
const button = new Button({
  text: 'Click me',
  variant: 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'md', // 'sm' | 'md' | 'lg'
  onClick: () => console.log('Clicked'),
  disabled: false,
  loading: false
});
container.appendChild(button.render());
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | '' | Button text |
| variant | string | 'primary' | Visual style |
| size | string | 'md' | Button size |
| icon | string | null | SVG HTML for icon |
| onClick | function | null | Click handler |
| disabled | boolean | false | Disabled state |
| loading | boolean | false | Loading spinner |

### Card

Product card with image, details, and add-to-cart action.

```javascript
const card = new Card({
  product: {
    id: '1',
    name: 'Product Name',
    price: 29.99,
    image: '/path/to/image.jpg',
    category: 'Electronics',
    description: 'Product description'
  },
  onAddToCart: (product) => cart.add(product),
  disabled: false,
  loading: false
});
container.appendChild(card.render());
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| product | Object | required | Product data |
| onAddToCart | function | null | Add to cart handler |
| onClick | function | null | Card click handler |
| disabled | boolean | false | Disabled state |
| loading | boolean | false | Skeleton state |

### QuantityControl

Quantity selector with +/- buttons.

```javascript
const control = new QuantityControl({
  value: 1,
  min: 1,
  max: 99,
  compact: false,
  onChange: (newValue, oldValue) => console.log(newValue)
});
container.appendChild(control.render());
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 1 | Initial quantity |
| min | number | 1 | Minimum value |
| max | number | 99 | Maximum value |
| compact | boolean | false | Compact mode |
| onChange | function | null | Value change handler |

### ThemeToggle

Theme selector dropdown (light/dark/high-contrast).

```javascript
const toggle = new ThemeToggle({
  onChange: (theme) => console.log(theme)
});
container.appendChild(toggle.render());
```

### CartItemRow

Cart item display with quantity control and remove action.

```javascript
const row = new CartItemRow({
  item: {
    id: 'item-1',
    product: { name: 'Product', price: 29.99, image: '/img.jpg' },
    quantity: 2
  },
  compact: false,
  onQuantityChange: (id, qty) => console.log(id, qty),
  onRemove: (id) => console.log('Remove', id)
});
container.appendChild(row.render());
```

### Toast

Notification toast with variants.

```javascript
import { toast } from './js/components/ui/Toast.js';

toast.success('Item added!', 'Success');
toast.error('Something went wrong', 'Error');
toast.warning('Check your input', 'Warning');
toast.info('New update available', 'Info');
```

### SkeletonCard

Loading skeleton placeholder.

```javascript
import { SkeletonCard } from './js/components/ui/SkeletonCard.js';

// Single skeleton
const skeleton = new SkeletonCard({ compact: false });
container.appendChild(skeleton.render());

// Multiple skeletons (grid)
const grid = SkeletonCard.createGrid(6, false);
container.appendChild(grid);
```

### Drawer

Slide-in drawer panel.

```javascript
const drawer = new Drawer({
  position: 'right', // 'left' | 'right' | 'top' | 'bottom'
  width: '400px',
  content: contentElement,
  title: 'Drawer Title',
  onClose: () => console.log('Closed')
});
await drawer.open();
```

### BottomSheet

Mobile bottom sheet with swipe to dismiss.

```javascript
const sheet = new BottomSheet({
  content: contentElement,
  title: 'Sheet Title',
  onOpen: () => console.log('Opened'),
  onClose: () => console.log('Closed')
});
await sheet.open();
```

### CartBadge

Animated cart badge with item count.

```javascript
const badge = new CartBadge({
  count: 3,
  total: 89.97,
  onClick: () => openCart(),
  headerElement: cartHeader // For shake animation
});
container.appendChild(badge.render());

// Update with animation
badge.update(5, 149.95);
```

## CSS Tokens

Components use CSS custom properties for theming:

```css
/* Colors */
--color-primary: #6366f1;
--color-bg: #fafafa;
--color-surface: #ffffff;
--color-text-primary: #1f2937;

/* Typography */
--font-family: 'Inter', sans-serif;
--font-size-base: 1rem;
--font-weight-semibold: 600;

/* Spacing */
--spacing-1: 0.25rem;
--spacing-4: 1rem;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
```

## Animation Utilities

```javascript
import { 
  popAnimation, 
  shakeAnimation, 
  slideIn, 
  badgePopAnimation,
  applyStaggeredAnimation 
} from './js/utils/animations.js';

// Pop effect
await popAnimation(element, 1.05, 150);

// Shake effect
await shakeAnimation(element, 2, 300);

// Slide in
await slideIn(element, 'top', 20, 400);

// Staggered grid animation
applyStaggeredAnimation(
  Array.from(document.querySelectorAll('.card')),
  'stagger-fade-in',
  0,
  50
);
```

## Accessibility

All components support:
- Keyboard navigation (Tab, Enter, Escape, arrows)
- Screen reader announcements
- Focus management
- `prefers-reduced-motion` support
- High contrast mode support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
