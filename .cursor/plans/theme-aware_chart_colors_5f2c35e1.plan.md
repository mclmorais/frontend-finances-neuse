---
name: Theme-aware chart colors
overview: Use the existing ChartConfig theme system to make the bar chart fill color adapt to light/dark themes automatically.
todos:
  - id: add-chart-config
    content: Add ChartConfig with theme-aware expensesSum color definition
    status: pending
  - id: update-cell-fill
    content: Update Cell fill prop to use var(--color-expensesSum) instead of hardcoded hex
    status: pending
---

# Use Theme-Aware Colors in Bar Chart

The [`components/ui/chart.tsx`](components/ui/chart.tsx) already includes a `ChartConfig` type that supports per-theme colors. This is the cleanest approach since it's built into your existing setup.

## How It Works

The `ChartStyle` component generates CSS variables like `--color-{key}` based on the config. You can then reference these with `var(--color-{key})` in your chart fills.

## Implementation

In [`components/category-spending-bar-chart.tsx`](components/category-spending-bar-chart.tsx):

1. Define a `ChartConfig` with theme-aware colors:
```typescript
const chartConfig: ChartConfig = {
  expensesSum: {
    label: "Expenses",
    theme: {
      light: "#D0D0D0",  // Light gray for light mode
      dark: "#505050"    // Darker gray for dark mode
    }
  }
}
```




2. Pass the config to `ChartContainer`:
```tsx
<ChartContainer config={chartConfig}>
```




3. Use the CSS variable in the Cell fill:
```tsx
<Cell key={`category-${i}`} fill="var(--color-expensesSum)" />
```




## Alternative: Use Existing Theme Variables

If you prefer using the existing CSS variables from your theme (like `--muted`), you can reference them directly since Recharts SVG elements can resolve CSS variables:

```tsx
<Cell key={`category-${i}`} fill="hsl(var(--muted))" />
```

However, your theme uses `oklch()` color format (not `hsl()`), so you'd need to use:

```tsx
<Cell key={`category-${i}`} fill="var(--muted)" />




```