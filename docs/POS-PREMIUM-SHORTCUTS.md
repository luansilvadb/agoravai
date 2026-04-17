# POS Premium Keyboard Shortcuts

## Global Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `/` | Focus search | Focus the product search input |
| `ESC` | Close panels | Close cart drawer/bottom sheet |
| `Tab` | Navigate | Move focus to next element |
| `Shift + Tab` | Navigate back | Move focus to previous element |
| `Enter` | Activate | Activate focused button/link |

## Product Grid Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `↑` / `↓` | Navigate products | Move between products in grid |
| `Enter` | Add to cart | Add focused product to cart |
| `Ctrl/Cmd + F` | Focus search | Alternative search focus |

## Cart Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `+` | Increase quantity | Increase focused item quantity |
| `-` | Decrease quantity | Decrease focused item quantity |
| `Delete` / `Backspace` | Remove item | Remove focused item from cart |

## Category Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `←` / `→` | Navigate categories | Move between category filters |
| `Enter` | Select category | Apply selected category filter |

## Accessibility Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl/Cmd + B` | Toggle sidebar | Collapse/expand sidebar (tablet) |

## Skip Links

When navigating with Tab key, skip links appear at the top of the page:

- **"Pular para produtos"** - Jump to product grid
- **"Pular para carrinho"** - Jump to cart section
- **"Pular para categorias"** - Jump to category filters

## Screen Reader Support

All shortcuts are announced by screen readers when focused:
- Button tooltips include keyboard shortcuts
- `aria-label` attributes describe available shortcuts
- Focus management is maintained during navigation

## Implementation

Keyboard shortcuts are implemented in `PosPremiumView.js`:

```javascript
setupKeyboardShortcuts() {
  // Search focus
  this.keyboardShortcuts.register('/', () => {
    this.elements.searchInput?.focus();
  });

  // Close panels
  this.keyboardShortcuts.register('Escape', () => {
    this.closeCartPanels();
  });
}
```

## Customization

To add custom shortcuts:

```javascript
import { KeyboardShortcuts } from './js/utils/accessibility.js';

const shortcuts = new KeyboardShortcuts();

// Register custom shortcut
shortcuts.register('n', () => {
  // Your action
}, { ctrl: true }); // Requires Ctrl key

// Activate
shortcuts.activate();
```
