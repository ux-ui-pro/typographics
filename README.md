<p align="center"><strong>typographics</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/typographics.svg?colorB=brightgreen)](https://www.npmjs.com/package/typographics)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/typographics.svg)](https://github.com/ux-ui-pro/typographics)
[![NPM Downloads](https://img.shields.io/npm/dm/typographics.svg?style=flat)](https://www.npmjs.org/package/typographics)

</div>

<p align="center">typographics provides flexible and adaptive typography primitives. It fluidly scales root font size between breakpoints and maintains a consistent vertical rhythm using a baseline grid.</p>
<p align="center"><a href="https://codepen.io/ux-ui/pen/BavYXRz">Demo</a></p>
<br>

&#10148; **Install**

```console
$ yarn add typographics
```
<br>

&#10148; **Import**

```javascript
import 'typographics/dist/index.css';
```
<sub>or</sub>
```scss
@import "typographics/dist/index.css";
```
<br>

## Settings

The following CSS Custom Properties control the behavior of the system.

### Core scale

| Variable                        |  Default  | Description                                          |
|:--------------------------------|:---------:|:-----------------------------------------------------|
| `--t-base-font-family`          | `"Inter"` | Base font-family for body text.                      |
| `--t-font-size-min-scale`       |  `0.75`   | Minimum root font-size scale (start of fluid range). |
| `--t-font-size-max-scale`       |    `1`    | Maximum root font-size scale (end of fluid range).   |
| `--t-font-scale-min-width`      |   `600`   | Viewport width (px) where scaling starts.            |
| `--t-font-scale-max-width`      |  `1440`   | Viewport width (px) where scaling stops.             |
| `--t-line-height-body`          |   `1.5`   | Default line-height for body text.                   |
| `--t-line-height-heading`       |   `1.3`   | Line-height for headings (unitless).                 |

> The library computes `--t-font-size-clamp` from these values to fluidly scale the root font size.

### Baseline & spacing

| Variable               |            Default            | Description                                    |
|:-----------------------|:-----------------------------:|:-----------------------------------------------|
| `--t-baseline`         |           `0.8rem`            | Base unit for vertical rhythm (baseline grid). |
| `--t-half-baseline`    | `calc(var(--t-baseline) / 2)` | Half-step used for compact spacing.            |

**Note on `lh`:** Components use `lh`-relative spacing (e.g., `0.5lh`, `0.75lh`). This ties margins to the element’s computed line-height, preserving rhythm when font sizes or line-heights change.

### Lists

Utilities `ul.list-*` / `ol.list-*` apply consistent padding and rhythm:

- `padding-inline-start: 2.5rem` (optically balanced bullets/numbers)
- `li { margin-block: 0.25lh; }` (compact item spacing)

A custom property is available if you need to control container padding directly:

| Variable                | Default | Description                                               |
|:------------------------|:-------:|:----------------------------------------------------------|
| `--t-list-padding-left` |   `0`   | Base padding if you build your own list wrappers.         |

### Inline code

These properties customize inline code fragments (`code:not(pre code)`):

| Variable                       |                                    Default                                    | Description                                |
|:-------------------------------|:-----------------------------------------------------------------------------:|:-------------------------------------------|
| `--t-monospace-font-family`    | `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` | Monospace stack for code.                  |
| `--t-code-inline-font-size`    |                                     `1em`                                     | Font-size relative to surrounding text.    |
| `--t-code-inline-line-height`  |                                      `1`                                      | Line-height for inline code.               |
| `--t-code-inline-bg`           |                               `rgb(0 0 0 / 5%)`                               | Background color.                          |
| `--t-code-inline-color`        |                                   `#24292f`                                   | Text color.                                |
| `--t-code-inline-border-radius`|                                    `0.3em`                                    | Corner radius.                             |
| `--t-code-inline-padding`      |                                `0.25em 0.4em`                                 | Internal padding.                          |
| `--t-code-inline-margin`       |                                  `0 0.4em`                                    | External margin.                           |
| `--t-code-inline-border-color` |                              `rgb(0 0 0 / 10%)`                               | Outline color used by the subtle 1px ring. |

### Code block

These properties customize fenced code blocks (`pre`):

| Variable                       |    Default    | Description                        |
|:-------------------------------|:-------------:|:-----------------------------------|
| `--t-code-block-font-size`     |   `1.4rem`    | Font-size for code blocks.         |
| `--t-code-block-line-height`   |     `1.6`     | Line-height for code blocks.       |
| `--t-code-block-bg`            |   `#F5F5F5`   | Background color.                  |
| `--t-code-block-color`         |   `#24292f`   | Text color.                        |
| `--t-code-block-padding`       | `1.2rem 2rem` | Internal padding.                  |
| `--t-code-block-margin`        |   `1.3em 0`   | External margin (vertical rhythm). |
| `--t-code-block-border-radius` |   `0.6rem`    | Corner radius.                     |
<br>

## License

typographics is released under the MIT license.
