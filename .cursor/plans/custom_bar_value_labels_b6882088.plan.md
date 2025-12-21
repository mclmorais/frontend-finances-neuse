---
name: Custom Bar Value Labels
overview: Customize the bar chart value labels to use the project font (Geist) and display financial formatting with dollar sign and no decimals, rounded up.
todos:
  - id: custom-label
    content: Add custom label renderer with financial formatting ($X, rounded up, Geist font)
    status: completed
---

# Custom Bar Value Labels

## Changes

Modify [`components/category-spending-bar-chart.tsx`](components/category-spending-bar-chart.tsx):

1. **Create a custom label renderer** for the Bar component's `label` prop that:

- Uses `foreignObject` to embed HTML (similar to the Y-axis tick)
- Applies `font-sans` class for Geist font
- Formats the value with `Math.ceil()` and prepends `$`

2. **Replace the current label prop** on line 60:
```tsx
// Current
label={{ position: 'right' }}

// New - custom render function
label={(props) => {
    const { x, y, width, height, value } = props;
    const formatted = `$${Math.ceil(value as number)}`;
    return (
        <text
            x={x + width + 5}
            y={y + height / 2}
            dominantBaseline="middle"
            className="font-sans text-xs fill-foreground"
        >
            {formatted}
        </text>
    );
}}


```