<br>
<p align="center"><strong>typographics</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/typographics.svg?colorB=brightgreen)](https://www.npmjs.com/package/typographics)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/typographics.svg)](https://github.com/ux-ui-pro/typographics)
[![NPM Downloads](https://img.shields.io/npm/dm/typographics.svg?style=flat)](https://www.npmjs.org/package/typographics)

</div>

<p align="center">typographics provides flexible and adaptive styles for typography on web pages. This package allows you to automate the resizing of fonts based on screen width, ensuring good readability on any device.</p>
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
```SCSS
@import "typographics/dist/index.css";
```
<br>

&#10148; **Settings**

| Variable                   |  Default  | Description                                                                    |
|:---------------------------|:---------:|:-------------------------------------------------------------------------------|
| `--t-base-font-family`     | `"Inter"` | Sets the default font family.                                                  |
| `--t-font-size-min-scale`  |  `0.75`   | Sets the minimum font size from which scaling starts.                          |
| `--t-font-size-max-scale`  |    `1`    | Sets the maximum font size at which scaling ends.                              |
| `--t-font-scale-min-width` |   `600`   | Sets the minimum viewport width in pixels from which font size scaling starts. |
| `--t-font-scale-max-width` |  `1440`   | Sets the maximum viewport width in pixels at which font size scaling ends.     |
| `--t-line-height-body`     |   `1.5`   | Sets the default line height.                                                  |
| `--t-line-height-heading`  |  `1.3em`  | Sets the line height for headings.                                             |
<br>

&#10148; **License**

typographics is released under MIT license
