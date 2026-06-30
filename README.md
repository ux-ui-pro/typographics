# typographics

Flexible and adaptive typography primitives that fluidly scale root font size between breakpoints and maintain a consistent vertical rhythm using a baseline grid.

[![npm](https://img.shields.io/npm/v/typographics.svg?colorB=brightgreen)](https://www.npmjs.com/package/typographics)
[![NPM Downloads](https://img.shields.io/npm/dm/typographics.svg?style=flat)](https://www.npmjs.com/package/typographics)

[Demo](https://codepen.io/ux-ui/pen/BavYXRz)

---

## Features

- Fluid typography between configurable viewport breakpoints
- Baseline-grid vertical rhythm with `lh`-relative spacing
- CSS custom properties for global and local scaling
- Optional per-style heading endpoints
- Utilities for lists, inline code, and code blocks

---

## Installation

```bash
npm install typographics
```

Import the packaged stylesheet in your app entry:

```js
import 'typographics';
```

Or use the deep Sass path:

```scss
@use "typographics/dist/index.css" as *;
```

---

## Quick Start

Start by defining your fluid range (breakpoints) and the body/heading size endpoints on `:root`:

```css
:root {
  /* Fluid range (px) */
  --t-font-scale-min-width: 600;
  --t-font-scale-max-width: 1440;

  /* Base fluid sizes (scales of 1rem) */
  --t-body-font-size-min-scale: 0.875;
  --t-body-font-size-max-scale: 1.125;
  --t-heading-font-size-min-scale: 1;
  --t-heading-font-size-max-scale: 1.25;
}
```

If you need “make everything smaller/bigger” without changing endpoints, use `--t-body-scale` / `--t-heading-scale` globally or per-container.

---

## Settings

The following CSS custom properties control the behavior of the system.

### Fluid range (breakpoints)

| Variable                   | Default | Description                               |
| :------------------------- | :-----: | :---------------------------------------- |
| `--t-font-scale-min-width` |  `600`  | Viewport width (px) where scaling starts. |
| `--t-font-scale-max-width` | `1440`  | Viewport width (px) where scaling stops.  |

> The library computes `--t-body-font-size-clamp` and `--t-heading-font-size-clamp` from these values to fluidly scale typography between breakpoints.
>
> Viewport units: scaling uses `100vw` by default and switches to `100lvw` in supporting browsers for more stable mobile behavior.

### Typography defaults

| Variable                  |                                       Default                                       | Description                         |
| :------------------------ | :---------------------------------------------------------------------------------: | :---------------------------------- |
| `--t-base-font-family`    | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Base font-family for body text.     |
| `--t-line-height-body`    |                                        `1.5`                                        | Default line-height for body text.  |
| `--t-line-height-heading` |                                        `1.3`                                        | Line-height for headings (unitless). |

### Base fluid sizes (body/headings)

These variables define the endpoints of the fluid range for body text and headings. They are expressed as scales of `1rem`.

| Variable                          | Default | Description                                     |
| :-------------------------------- | :-----: | :---------------------------------------------- |
| `--t-body-font-size-min-scale`    | `0.875` | Minimum body font-size scale (at min width).    |
| `--t-body-font-size-max-scale`    | `1.125` | Maximum body font-size scale (at max width).    |
| `--t-heading-font-size-min-scale` |   `1`   | Minimum heading font-size scale (at min width). |
| `--t-heading-font-size-max-scale` | `1.25`  | Maximum heading font-size scale (at max width). |

### Typography scaling (global/local)

These variables allow you to tweak overall typography sizes (for example, “everything 10% smaller”) **without copying internal `calc()` formulas**. They can be set globally on `:root` or locally on any container.

| Variable            | Default | Description                                         |
| :------------------ | :-----: | :-------------------------------------------------- |
| `--t-body-scale`    |   `1`   | Multiplier for body/paragraph/list/font-size rules. |
| `--t-heading-scale` |   `1`   | Multiplier for heading font-size rules.             |

---

## Examples

Global scale:

```css
:root {
  --t-body-scale: 0.9;
  --t-heading-scale: 0.9;
}
```

Local scale:

```css
.article {
  --t-body-scale: 0.95;
}

.hero {
  --t-heading-scale: 0.9;
}
```

### Per-style heading endpoints (optional)

By default, heading styles (`.display-*`, `.headline-*`, `.title-*`) are computed by multiplying the global fluid heading clamp by a style coefficient (for example, `--t-headline-medium`).

If you need a specific heading style to be exactly a certain size at the **start** and **end** of the fluid range, you can override its endpoints with two custom properties:

- `--t-<key>-min`: font-size at `--t-font-scale-min-width`
- `--t-<key>-max`: font-size at `--t-font-scale-max-width`

Example for `.headline-medium`:

```css
.headline-medium {
  --t-headline-medium-min: 28px;
  --t-headline-medium-max: 34px;
}
```

**Note on `--t-heading-scale`:** When you provide `--t-<key>-min/max`, you override the computed endpoints, so `--t-heading-scale` will not automatically affect that style. If you want the global scale to apply, multiply it yourself:

```css
.headline-medium {
  --t-headline-medium-min: calc(28px * var(--t-heading-scale, 1));
  --t-headline-medium-max: calc(34px * var(--t-heading-scale, 1));
}
```

Available keys:

- `display-large`, `display-medium`, `display-small`
- `headline-large`, `headline-medium`, `headline-small`
- `title-large`, `title-medium`, `title-small`

### Spacing

**Note on `lh`:** Components use `lh`-relative spacing (for example, `0.5lh`, `0.75lh`). This ties margins to the element’s computed line-height, preserving rhythm when font sizes or line-heights change, keeping a consistent vertical rhythm without additional spacing variables.

### Lists

Utilities `ul.list-*` / `ol.list-*` apply consistent padding and rhythm:

- `padding-inline-start: 2.5rem` (optically balanced bullets/numbers)
- `li { margin-block: 0.25lh; }` (compact item spacing)

A custom property is available if you need to control container padding directly:

| Variable                | Default  | Description                                       |
| :---------------------- | :------: | :------------------------------------------------ |
| `--t-list-padding-left` | `2.5rem` | Base padding if you build your own list wrappers. |

### Inline code

These properties customize inline code fragments (`code:not(pre code)`):

| Variable                        |                                    Default                                    | Description                                |
| :------------------------------ | :---------------------------------------------------------------------------: | :----------------------------------------- |
| `--t-monospace-font-family`     | `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` | Monospace stack for code.                  |
| `--t-code-inline-font-size`     |                                     `1em`                                     | Font-size relative to surrounding text.    |
| `--t-code-inline-line-height`   |                                      `1`                                      | Line-height for inline code.               |
| `--t-code-inline-bg`            |                               `rgb(0 0 0 / 5%)`                               | Background color.                          |
| `--t-code-inline-color`         |                                   `#24292f`                                   | Text color.                                |
| `--t-code-inline-border-radius` |                                    `0.3em`                                    | Corner radius.                             |
| `--t-code-inline-padding`       |                                `0.25em 0.4em`                                 | Internal padding.                          |
| `--t-code-inline-margin`        |                                  `0 0.25em`                                   | External margin.                           |
| `--t-code-inline-border-color`  |                              `rgb(0 0 0 / 10%)`                               | Outline color used by the subtle 1px ring. |

### Code block

These properties customize fenced code blocks (`pre`):

| Variable                       |    Default    | Description                        |
| :----------------------------- | :-----------: | :--------------------------------- |
| `--t-code-block-font-size`     |   `1.4rem`    | Font-size for code blocks.         |
| `--t-code-block-line-height`   |     `1.6`     | Line-height for code blocks.       |
| `--t-code-block-bg`            |   `#F5F5F5`   | Background color.                  |
| `--t-code-block-color`         |   `#24292f`   | Text color.                        |
| `--t-code-block-padding`       | `1.2rem 2rem` | Internal padding.                  |
| `--t-code-block-margin`        |   `1.3em 0`   | External margin (vertical rhythm). |
| `--t-code-block-border-radius` |   `0.6rem`    | Corner radius.                     |

---

## License

MIT
