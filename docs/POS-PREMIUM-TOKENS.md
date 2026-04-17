# POS Premium Design Tokens

Design tokens for the Premium POS interface.

## Color Tokens

### Primary Palette
| Token | Light | Dark | High-Contrast |
|-------|-------|------|---------------|
| `--color-primary` | #6366f1 | #818cf8 | #6366f1 |
| `--color-primary-dark` | #4f46e5 | #6366f1 | #4f46e5 |
| `--color-primary-light` | #818cf8 | #a5b4fc | #818cf8 |
| `--color-secondary` | #f97316 | #fb923c | #c2410c |

### Background Colors
| Token | Light | Dark | High-Contrast |
|-------|-------|------|---------------|
| `--color-bg` | #fafafa | #111827 | #ffffff |
| `--color-surface` | #ffffff | #1f2937 | #ffffff |
| `--color-surface-elevated` | #ffffff | #374151 | #ffffff |

### Text Colors
| Token | Light | Dark | High-Contrast |
|-------|-------|------|---------------|
| `--color-text-primary` | #1f2937 | #f9fafb | #000000 |
| `--color-text-secondary` | #6b7280 | #d1d5db | #000000 |
| `--color-text-tertiary` | #9ca3af | #9ca3af | #333333 |
| `--color-text-inverse` | #ffffff | #1f2937 | #ffffff |

### State Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | #10b981 | Success states |
| `--color-warning` | #f59e0b | Warning states |
| `--color-error` | #ef4444 | Error states |
| `--color-info` | #3b82f6 | Info states |

## Typography Tokens

### Font Family
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Font Sizes
| Token | Value | Pixels |
|-------|-------|--------|
| `--font-size-xs` | 0.75rem | 12px |
| `--font-size-sm` | 0.875rem | 14px |
| `--font-size-base` | 1rem | 16px |
| `--font-size-lg` | 1.125rem | 18px |
| `--font-size-xl` | 1.25rem | 20px |
| `--font-size-2xl` | 1.5rem | 24px |
| `--font-size-3xl` | 1.875rem | 30px |
| `--font-size-4xl` | 2.25rem | 36px |

### Font Weights
| Token | Value |
|-------|-------|
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

### Line Heights
| Token | Value |
|-------|-------|
| `--line-height-tight` | 1.25 |
| `--line-height-normal` | 1.5 |
| `--line-height-relaxed` | 1.625 |

## Spacing Tokens

| Token | Value | Pixels |
|-------|-------|--------|
| `--spacing-1` | 0.25rem | 4px |
| `--spacing-2` | 0.5rem | 8px |
| `--spacing-3` | 0.75rem | 12px |
| `--spacing-4` | 1rem | 16px |
| `--spacing-5` | 1.25rem | 20px |
| `--spacing-6` | 1.5rem | 24px |
| `--spacing-8` | 2rem | 32px |
| `--spacing-10` | 2.5rem | 40px |
| `--spacing-12` | 3rem | 48px |

## Shadow Tokens

| Token | Value |
|-------|-------|
| `--shadow-xs` | 0 1px 2px rgba(0,0,0,0.05) |
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05) |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.05) |
| `--shadow-primary-md` | 0 4px 14px rgba(99,102,241,0.4) |

## Border Radius Tokens

| Token | Value | Pixels |
|-------|-------|--------|
| `--radius-sm` | 0.375rem | 6px |
| `--radius-md` | 0.5rem | 8px |
| `--radius-lg` | 0.75rem | 12px |
| `--radius-xl` | 1rem | 16px |
| `--radius-2xl` | 1.5rem | 24px |
| `--radius-full` | 9999px | - |

## Animation Tokens

### Durations
| Token | Value |
|-------|-------|
| `--duration-fast` | 150ms |
| `--duration-normal` | 300ms |
| `--duration-slow` | 400ms |

### Easings
| Token | Value |
|-------|-------|
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) |
| `--ease-bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) |

## Breakpoint Tokens

| Token | Value |
|-------|-------|
| `--breakpoint-sm` | 640px |
| `--breakpoint-md` | 768px |
| `--breakpoint-lg` | 1024px |
| `--breakpoint-xl` | 1280px |

## Z-Index Scale

| Token | Value |
|-------|-------|
| `--z-dropdown` | 100 |
| `--z-sticky` | 200 |
| `--z-drawer` | 300 |
| `--z-modal` | 400 |
| `--z-toast` | 500 |
| `--z-tooltip` | 600 |

## Usage Example

```css
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-4);
  transition: all var(--duration-normal) var(--ease-default);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
```
