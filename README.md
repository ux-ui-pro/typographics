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

<sub>CSS</sub>
```css
@import "typographics/dist";
```

<sub>SCSS</sub>
```css
@import "typographics/src";
```
<br>

&#10148; **Settings**

| Variable                |  Default  | Description                                                                    |
|:------------------------|:---------:|:-------------------------------------------------------------------------------|
| `--min-fs`              |   `.75`   | Sets the minimum font size from which scaling starts.                          |
| `--max-fs`              |    `1`    | Sets the maximum font size at which scaling ends.                              |
| `--min-vw`              |   `600`   | Sets the minimum viewport width in pixels from which font size scaling starts. |
| `--max-vw`              |  `1440`   | Sets the maximum viewport width in pixels at which font size scaling ends.     |
| `--font-family-base`    | `"Inter"` | Sets the default font family.                                                  |
| `--line-height-base`    |   `1.5`   | Sets the default line height.                                                  |
| `--line-height-heading` |  `1.3em`  | Sets the line height for headings.                                             |
<br>

&#10148; **License**

typographics is released under MIT license
