
# Theme Color Adjustment - Lighter Background

## Issue
The current background colors are too dark. The theme is using:
- Background: `240 10% 4%` (which translates to approximately `#0a0a0f` - nearly black)
- Card: `240 10% 7%` (`#101018`)
- Surface variants: `7%`, `10%`, `13%` lightness

This creates an "ink black" appearance that feels too dark.

## Solution
Adjust the lightness values to create a more balanced dark theme while maintaining the premium feel. The cyan accent color and all other design elements stay exactly the same.

### Color Changes (src/index.css)

| Variable | Current Value | New Value | Result |
|----------|--------------|-----------|--------|
| `--background` | `240 10% 4%` | `240 10% 9%` | Slightly lighter main background |
| `--card` | `240 10% 7%` | `240 10% 11%` | Cards stand out from background |
| `--popover` | `240 10% 8%` | `240 10% 12%` | Popovers visible |
| `--surface-1` | `240 10% 7%` | `240 10% 11%` | Consistent with card |
| `--surface-2` | `240 8% 10%` | `240 8% 14%` | Mid-surface level |
| `--surface-3` | `240 7% 13%` | `240 7% 17%` | Elevated surfaces |
| `--sidebar-background` | `240 10% 5%` | `240 10% 7%` | Sidebar slightly darker than main |
| `--glass-bg` | `240 10% 8% / 0.8` | `240 10% 12% / 0.8` | Glass effect aligned |

### What Stays The Same
- Primary color: `187 82% 53%` (cyan accent)
- All status colors (success, warning, destructive)
- Border, muted, accent colors
- Text colors
- All animations and effects
- Premium glassmorphism and glow effects

## Technical Details

The adjustment increases the lightness (L value in HSL) by approximately 4-5 percentage points across all dark surfaces. This creates:
- A softer dark gray instead of near-black
- Better contrast between surface layers
- More readable and less fatiguing on the eyes
- Still maintains the dark, premium aesthetic

**File to modify:** `src/index.css` (lines 8, 11, 14, 45-47, 55, 65, 72)
