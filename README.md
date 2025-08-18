<p align="center"><strong>typographics</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/typographics.svg?colorB=brightgreen)](https://www.npmjs.com/package/typographics)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/typographics.svg)](https://github.com/ux-ui-pro/typographics)
[![NPM Downloads](https://img.shields.io/npm/dm/typographics.svg?style=flat)](https://www.npmjs.org/package/typographics)

</div>

<p align="center">typographics provides flexible and adaptive styles for typography on web pages. This package allows you to automate the resizing of fonts based on screen width and maintain a consistent vertical rhythm, ensuring great readability on any device.</p>
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

The following CSS Custom Properties control the behavior and look of the system.

### Core scale

| Variable                        |  Default  | Description                                          |
|:--------------------------------|:---------:|:-----------------------------------------------------|
| `--t-base-font-family`          | `"Inter"` | Base font-family for body text.                      |
| `--t-font-size-min-scale`       |  `0.75`   | Minimum root font-size scale (start of fluid range). |
| `--t-font-size-max-scale`       |    `1`    | Maximum root font-size scale (end of fluid range).   |
| `--t-font-scale-min-width`      |   `600`   | Viewport width (px) where scaling starts.            |
| `--t-font-scale-max-width`      |  `1440`   | Viewport width (px) where scaling stops.             |
| `--t-line-height-body`          |   `1.5`   | Default line-height for body text.                   |
| `--t-line-height-heading`       |  `1.3em`  | Line-height for headings.                            |

> The library computes `--t-font-size-clamp` from these values to fluidly scale the root font size.

### Baseline & spacing (new)

| Variable               |            Default            | Description                                    |
|:-----------------------|:-----------------------------:|:-----------------------------------------------|
| `--t-baseline`         |           `0.8rem`            | Base unit for vertical rhythm (baseline grid). |
| `--t-half-baseline`    | `calc(var(--t-baseline) / 2)` | Half-step used for compact spacing.            |

These variables are used to drive margins for paragraphs, lists, and related components to keep consistent rhythm across sizes.

### Lists (new)

| Variable                  | Default | Description                                                                                         |
|:--------------------------|:-------:|:----------------------------------------------------------------------------------------------------|
| `--t-list-padding-left`   |   `0`   | Left padding for ordered and unordered lists created via `ul.list-*` / `ol.list-*` utility classes. |

### Inline code (new)

These properties customize the appearance of inline code fragments (`code:not(pre code)`):

| Variable                         |                                    Default                                    | Description                                |
|:---------------------------------|:-----------------------------------------------------------------------------:|:-------------------------------------------|
| `--t-monospace-font-family`      | `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` | Monospace stack for code.                  |
| `--t-code-inline-font-size`      |                                     `1em`                                     | Font-size relative to surrounding text.    |
| `--t-code-inline-line-height`    |                                      `1`                                      | Line-height for inline code.               |
| `--t-code-inline-bg`             |                               `rgb(0 0 0 / 5%)`                               | Background color.                          |
| `--t-code-inline-color`          |                                   `#24292f`                                   | Text color.                                |
| `--t-code-inline-border-radius`  |                                    `0.3em`                                    | Corner radius.                             |
| `--t-code-inline-padding`        |                                `0.25em 0.4em`                                 | Internal padding.                          |
| `--t-code-inline-margin`         |                                  `0 0.25em`                                   | External margin.                           |
| `--t-code-inline-border-color`   |                              `rgb(0 0 0 / 10%)`                               | Outline color used by the subtle 1px ring. |

### Code block (new)

These properties customize the appearance of fenced code blocks (`pre`):

| Variable                         |    Default    | Description                        |
|:---------------------------------|:-------------:|:-----------------------------------|
| `--t-code-block-font-size`       |   `1.6rem`    | Font-size for code blocks.         |
| `--t-code-block-line-height`     |     `1.6`     | Line-height for code blocks.       |
| `--t-code-block-bg`              |   `#F5F5F5`   | Background color.                  |
| `--t-code-block-color`           |   `#24292f`   | Text color.                        |
| `--t-code-block-padding`         | `1.2rem 2rem` | Internal padding.                  |
| `--t-code-block-margin`          |   `1.3em 0`   | External margin (vertical rhythm). |
| `--t-code-block-border-radius`   |   `0.6rem`    | Corner radius.                     |

### Notes

- `body { font-family: var(--t-base-font-family, system-ui, ...); }` now falls back to a robust system stack by default. Override `--t-base-font-family` to enforce a custom face.
- Inputs, buttons, selects, and textareas inherit the body typography by default: `font: inherit; line-height: inherit;` for consistent UI text.
- Utility classes are available for headings (`.display-*`, `.headline-*`, `.title-*`), labels (`.label-*`), body copy (`.body-*`), and lists (`ul.list-*/ol.list-*`) tuned to the baseline grid.
<br>

## Usage hints

- Tweak `--t-font-size-min-scale`/`--t-font-size-max-scale` to adjust overall density while preserving relationships between components.
- Set `--t-baseline` to match your design system’s spacing unit (e.g., 4px/8px scale) for seamless integration.
- Use the inline/code block variables to align code styling with light/dark themes of your site.
<br>

## License

typographics is released under the MIT license.
