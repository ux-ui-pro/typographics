import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const css = readFileSync(new URL('../dist/index.css', import.meta.url), 'utf8');
const widths = [320, 600, 1024, 1440];
const tableVariants = [
  { className: 'table-text', bodyClass: 'body-large' },
  { className: 'table-text-large', bodyClass: 'body-large' },
  { className: 'table-text-medium', bodyClass: 'body-medium' },
  { className: 'table-text-small', bodyClass: 'body-small' },
];
let browser;
let page;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  page = await browser.newPage();
});

after(async () => {
  await browser?.close();
});

function sampleTable(id, { className = 'table-text', attributes = '', body = '' } = {}) {
  return `<table data-probe="${id}" class="${className}" ${attributes}>
    <caption data-probe="${id}-caption"><p data-probe="${id}-caption-p">Caption</p></caption>
    <thead data-probe="${id}-head"><tr><th data-probe="${id}-head-th" scope="col">
      <p data-probe="${id}-head-p">Heading</p></th><th scope="col">Value</th></tr></thead>
    <tbody data-probe="${id}-body">${body || `<tr><th data-probe="${id}-row-th" scope="row">
      <p data-probe="${id}-row-p">Row</p></th><td data-probe="${id}-cell" style="--t-body-scale:3">
      <p data-probe="${id}-cell-p">Cell</p></td></tr>`}</tbody>
    <tfoot data-probe="${id}-foot"><tr><th data-probe="${id}-foot-th" scope="row">
      <p data-probe="${id}-foot-th-p">Total</p></th><td data-probe="${id}-foot-td">
      <p data-probe="${id}-foot-td-p">Value</p></td></tr></tfoot>
  </table>`;
}

async function render(markup, { width = 1024, extraCss = '' } = {}) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${css}</style>
    <style>body { margin:0; } ${extraCss}</style></head><body>${markup}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-probe]')].map(element => {
    const style = getComputedStyle(element);
    const properties = [
      'fontWeight', 'fontFamily', 'color', 'textAlign', 'direction', 'display',
      'paddingBlockStart', 'paddingInlineStart', 'borderTopWidth', 'borderTopStyle',
      'borderCollapse', 'borderSpacing', 'tableLayout', 'inlineSize', 'whiteSpace',
      'overflowWrap', 'overflowX', 'verticalAlign', 'captionSide',
    ];
    return [element.dataset.probe, {
      ...Object.fromEntries(properties.map(property => [property, style[property]])),
      fontSize: parseFloat(style.fontSize),
      lineHeight: parseFloat(style.lineHeight),
      marginStart: parseFloat(style.marginBlockStart),
      marginEnd: parseFloat(style.marginBlockEnd),
    }];
  })));
}

function near(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) <= 0.08,
    `${message}: expected ${expected}px, received ${actual}px`);
}

function inheritedParagraph(styles, parent, paragraph) {
  near(styles[paragraph].fontSize, styles[parent].fontSize, `${paragraph}: inherited font size`);
  near(styles[paragraph].lineHeight, styles[parent].lineHeight, `${paragraph}: inherited line height`);
  assert.equal(styles[paragraph].fontWeight, styles[parent].fontWeight, `${paragraph}: inherited weight`);
}

function inheritedTableParagraphs(styles, id) {
  for (const [parent, paragraph] of [
    ['caption', 'caption-p'], ['head-th', 'head-p'], ['row-th', 'row-p'],
    ['cell', 'cell-p'], ['foot-th', 'foot-th-p'], ['foot-td', 'foot-td-p'],
  ]) inheritedParagraph(styles, `${id}-${parent}`, `${id}-${paragraph}`);
}

test('opted-in table text follows fluid body sizes and local scales at four viewport widths', async () => {
  const scales = [0.75, 1, 1.25];
  const markup = '<p data-probe="body-reference">Body text</p>' + scales.map((scale, index) =>
    `<article style="--t-body-scale:${scale}">
      ${['body-large', 'body-medium', 'body-small'].map(bodyClass =>
        `<p data-probe="reference-${index}-${bodyClass}" class="${bodyClass}">Reference</p>`).join('')}
      ${tableVariants.map(({ className }) => sampleTable(`${index}-${className}`, { className })).join('')}
    </article>`).join('');
  for (const width of widths) {
    const styles = await render(markup, { width, extraCss: ':root { --t-line-height-body:2; }' });
    const baseSize = styles['body-reference'].fontSize;
    if (width <= 600) near(baseSize, 14, `${width}px: lower fluid endpoint`);
    if (width === 1440) near(baseSize, 18, 'upper fluid endpoint');
    if (width === 1024) assert.ok(baseSize > 14 && baseSize < 18, 'middle viewport interpolates');
    for (const [index, scale] of scales.entries()) {
      near(styles[`reference-${index}-body-large`].fontSize, baseSize * scale, `${width}px: reference container scale`);
      for (const { className, bodyClass } of tableVariants) {
        const id = `${index}-${className}`;
        const reference = styles[`reference-${index}-${bodyClass}`];
        near(styles[id].fontSize, reference.fontSize, `${width}px ${id}: matching body utility size`);
        near(styles[id].lineHeight, className === 'table-text' ? reference.fontSize * 2 : reference.lineHeight,
          `${width}px ${id}: base uses body token; presets use their body utility line height`);
        inheritedTableParagraphs(styles, id);
      }
    }
  }
});

test('table tokens inherit from root and container, with element values taking precedence', async () => {
  const markup = tableVariants.map(({ className }, index) => {
    const table = (name, attributes = '') => sampleTable(`${index}-${name}`, { className, attributes });
    return [
      table('root'),
      `<article style="--t-table-font-size:17px;--t-table-line-height:32px">${table('local')}</article>`,
      `<article style="font-size:20px;--t-body-scale:2;--t-table-font-size:40px">
        ${table('element', 'style="--t-table-font-size:1.2em;--t-table-line-height:1.1"')}</article>`,
      `<article style="--t-table-font-size:19px">${table('ancestor-font-only')}</article>`,
      `<article style="--t-table-line-height:31px">${table('ancestor-line-only')}</article>`,
      table('element-font-only', 'style="--t-table-font-size:24px"'),
      table('element-line-only', 'style="--t-table-line-height:32px"'),
    ].join('');
  }).join('');
  const styles = await render(markup, {
    extraCss: ':root { --t-table-font-size:22px; --t-table-line-height:1.8; }',
  });
  for (const [index] of tableVariants.entries()) {
    for (const [name, fontSize, lineHeight] of [
      ['root', 22, 39.6], ['local', 17, 32], ['element', 24, 26.4],
      ['ancestor-font-only', 19, 34.2], ['ancestor-line-only', 22, 31],
      ['element-font-only', 24, 43.2], ['element-line-only', 22, 32],
    ]) {
      const id = `${index}-${name}`;
      near(styles[id].fontSize, fontSize, `${id}: font-size token`);
      near(styles[id].lineHeight, lineHeight, `${id}: line-height token`);
      inheritedTableParagraphs(styles, id);
    }
  }
  const fallback = await render(sampleTable('body-line-height'), {
    extraCss: ':root { --t-line-height-body:1.7; }',
  });
  near(fallback['body-line-height'].lineHeight, fallback['body-line-height'].fontSize * 1.7,
    'existing body line-height token controls the table fallback');
});

test('body and label paragraph utilities retain their own typography inside table cells', async () => {
  const utilities = ['body', 'label'].flatMap(group => ['large', 'medium', 'small'].map(size => `${group}-${size}`));
  const references = `<article style="--t-body-scale:2">${utilities.map(className =>
    `<p data-probe="reference-${className}" class="${className}">Reference</p>`).join('')}</article>`;
  const tables = tableVariants.map(({ className }, index) => sampleTable(`utility-table-${index}`, {
    className, attributes: 'style="--t-table-font-size:27px;--t-table-line-height:1.9"',
    body: utilities.map(utility => `<tr>
      <th style="--t-body-scale:2" scope="row"><p data-probe="${index}-header-${utility}" class="${utility}">Label</p></th>
      <td style="--t-body-scale:2"><p data-probe="${index}-cell-${utility}" class="${utility}">Value</p></td>
    </tr>`).join(''),
  })).join('');
  const styles = await render(references + tables);
  for (const [index] of tableVariants.entries()) {
    for (const className of utilities) {
      for (const prefix of ['header', 'cell']) {
        const actual = styles[`${index}-${prefix}-${className}`];
        const reference = styles[`reference-${className}`];
        near(actual.fontSize, reference.fontSize, `${index} ${prefix} ${className}: utility size`);
        near(actual.lineHeight, reference.lineHeight, `${index} ${prefix} ${className}: utility line height`);
        assert.equal(actual.fontWeight, reference.fontWeight, `${index} ${prefix} ${className}: utility weight`);
      }
    }
  }
});

test('ordinary tables and non-table widgets do not opt in through tokens or the class name alone', async () => {
  const styles = await render([
    '<p data-probe="outside-p">Outside paragraph</p>',
    sampleTable('bare', {
      className: 'application-table',
      attributes: 'style="--t-table-font-size:99px;--t-table-line-height:4"',
    }),
    tableVariants.map(({ className }, index) =>
      `<div data-probe="widget-${index}" class="${className}" style="--t-table-font-size:99px;--t-table-line-height:4">
        <p data-probe="widget-${index}-p">Widget paragraph</p></div>`).join(''),
  ].join(''), {
    extraCss: `@layer reset {
      .application-table { font-size:23px; line-height:31px; }
      div[class^="table-text"] { font-size:21px; line-height:29px; }
    }`,
  });
  near(styles.bare.fontSize, 23, 'bare application table size');
  near(styles.bare.lineHeight, 31, 'bare application table line height');
  for (const [index] of tableVariants.entries()) {
    near(styles[`widget-${index}`].fontSize, 21, 'non-table widget size');
    near(styles[`widget-${index}`].lineHeight, 29, 'non-table widget line height');
  }
  for (const id of ['bare-caption-p', 'bare-head-p', ...tableVariants.map((_, index) => `widget-${index}-p`)]) {
    near(styles[id].fontSize, styles['outside-p'].fontSize, `${id}: ordinary paragraph size`);
    near(styles[id].lineHeight, styles['outside-p'].lineHeight, `${id}: ordinary paragraph line height`);
    assert.equal(styles[id].fontWeight, '400', `${id}: ordinary paragraph weight`);
  }
});

test('paragraph inheritance stays inside each opted-in table and its directly owned cells', async () => {
  for (const [index, { className }] of tableVariants.entries()) {
    const nestedClass = tableVariants[(index + 1) % tableVariants.length].className;
    const innerBare = sampleTable('inner-bare', { className: 'inner-bare' });
    const innerOpted = sampleTable('inner-opted', {
      className: nestedClass, attributes: 'style="--t-table-font-size:21px;--t-table-line-height:1.2"',
    });
    const styles = await render('<p data-probe="outside-p">Outside text</p>' + sampleTable('outer', {
      className, attributes: 'style="--t-table-font-size:28px;--t-table-line-height:2"',
      body: `<tr><td data-probe="outer-cell"><p data-probe="outer-direct-p">Direct text</p>
        <div class="${nestedClass} custom-widget"><p data-probe="nested-widget-p">Widget text</p></div>
        ${innerBare}${innerOpted}</td></tr>`,
    }), {
      extraCss: `@layer reset {
        .inner-bare { font-size:19px; line-height:31px; }
        .custom-widget { font-size:31px; line-height:44px; font-weight:500; }
      }`,
    });
    inheritedParagraph(styles, 'outer-cell', 'outer-direct-p');
    near(styles['inner-bare'].fontSize, 19, 'nested bare table keeps application typography');
    for (const id of ['nested-widget-p', 'inner-bare-caption-p', 'inner-bare-head-p', 'inner-bare-foot-td-p']) {
      near(styles[id].fontSize, styles['outside-p'].fontSize, `${id}: no outer paragraph reset`);
      near(styles[id].lineHeight, styles['outside-p'].lineHeight, `${id}: no outer line-height reset`);
      assert.equal(styles[id].fontWeight, '400', `${id}: no outer weight reset`);
    }
    near(styles['inner-opted'].fontSize, 21, 'nested opted-in table uses its own token');
    near(styles['inner-opted'].lineHeight, 25.2, 'nested opted-in table uses its own line height');
    inheritedTableParagraphs(styles, 'inner-opted');
  }
  const fallback = await render(`<article style="--t-body-scale:1.25">
    <p data-probe="large-reference" class="body-large">Large</p><p data-probe="small-reference" class="body-small">Small</p>
    ${sampleTable('outer-fallback', { className: 'table-text-small', body: `<tr><td data-probe="outer-fallback-cell">
      <p data-probe="outer-fallback-p">Outer text</p>${sampleTable('inner-fallback', { className: 'table-text-large' })}</td></tr>` })}
    </article>`);
  for (const [id, reference] of [['outer-fallback', 'small-reference'], ['inner-fallback', 'large-reference']]) {
    near(fallback[id].fontSize, fallback[reference].fontSize, `${id}: independent nested preset size`);
    near(fallback[id].lineHeight, fallback[reference].lineHeight, `${id}: independent nested preset line height`);
  }
  inheritedParagraph(fallback, 'outer-fallback-cell', 'outer-fallback-p');
  inheritedTableParagraphs(fallback, 'inner-fallback');
});

test('native header weight, alignment, family and color survive opt-in in RTL content', async () => {
  const styles = await render(`<article dir="rtl" class="rtl-context">
    ${tableVariants.map(({ className }, index) => sampleTable(`opted-${index}`, { className })).join('')}
    ${sampleTable('control', { className: '' })}</article>`, {
    extraCss: '.rtl-context { font-family:monospace; color:rgb(11,22,33); font-weight:500; text-align:end; }',
  });
  for (const [index] of tableVariants.entries()) {
    const id = `opted-${index}`;
    for (const suffix of ['', '-caption', '-head-th', '-row-th', '-cell']) {
      const opted = styles[`${id}${suffix}`];
      const control = styles[`control${suffix}`];
      for (const property of ['fontWeight', 'textAlign', 'fontFamily', 'color', 'direction', 'display']) {
        assert.equal(opted[property], control[property], `${id}${suffix}: native ${property}`);
      }
    }
    assert.equal(styles[`${id}-head-th`].fontWeight, '700', 'native column header remains bold');
    assert.equal(styles[`${id}-row-th`].fontWeight, '700', 'native row header remains bold');
    assert.equal(styles[`${id}-cell`].fontWeight, '500', 'data cell retains inherited application weight');
    inheritedTableParagraphs(styles, id);
  }
});

test('application CSS can override table and paragraph typography inside typography and later layers', async () => {
  for (const layer of ['typography', 'components', 'utilities', null]) {
    const overrides = `table { font-size:31px; line-height:2; }
      p { font-size:19px; line-height:1.1; font-weight:500; }`;
    const styles = await render(tableVariants.map(({ className }, index) => sampleTable(`custom-${index}`, { className })).join(''), {
      extraCss: ':root { --t-table-font-size:41px; --t-table-line-height:3; }'
        + (layer ? `@layer ${layer} { ${overrides} }` : overrides),
    });
    for (const [index] of tableVariants.entries()) {
      near(styles[`custom-${index}`].fontSize, 31, `${layer || 'unlayered'}: table size override`);
      near(styles[`custom-${index}`].lineHeight, 62, `${layer || 'unlayered'}: table line-height override`);
      for (const suffix of ['caption-p', 'head-p', 'cell-p']) {
        const id = `custom-${index}-${suffix}`;
        near(styles[id].fontSize, 19, `${layer || 'unlayered'} ${id}: paragraph override`);
        near(styles[id].lineHeight, 20.9, `${layer || 'unlayered'} ${id}: paragraph line-height override`);
        assert.equal(styles[id].fontWeight, '500', `${layer || 'unlayered'} ${id}: weight override`);
      }
    }
  }
  const independent = await render(tableVariants.map(({ className }, index) => [
    sampleTable(`${index}-baseline`, { className }),
    sampleTable(`${index}-font-only`, { className: `${className} font-only` }),
    sampleTable(`${index}-line-only`, { className: `${className} line-only` }),
  ].join('')).join(''), {
    extraCss: '@layer typography { .font-only { font-size:29px; } .line-only { line-height:40px; } }',
  });
  for (const [index] of tableVariants.entries()) {
    const baseline = independent[`${index}-baseline`];
    near(independent[`${index}-font-only`].fontSize, 29, 'independent CSS font-size override');
    near(independent[`${index}-font-only`].lineHeight, 29 * baseline.lineHeight / baseline.fontSize,
      'font-size override retains the variant line-height fallback');
    near(independent[`${index}-line-only`].fontSize, baseline.fontSize, 'line-height override retains the variant font-size fallback');
    near(independent[`${index}-line-only`].lineHeight, 40, 'independent CSS line-height override');
  }
  const inline = await render(tableVariants.map(({ className }, index) => sampleTable(`inline-${index}`, {
    className, attributes: 'style="font-size:33px;line-height:44px"',
    body: `<tr><td><p data-probe="inline-${index}-p" style="font-size:20px;line-height:25px;font-weight:600">Text</p></td></tr>`,
  })).join(''));
  for (const [index] of tableVariants.entries()) {
    near(inline[`inline-${index}`].fontSize, 33, 'inline table font size');
    near(inline[`inline-${index}`].lineHeight, 44, 'inline table line height');
    near(inline[`inline-${index}-p`].fontSize, 20, 'inline paragraph font size');
    near(inline[`inline-${index}-p`].lineHeight, 25, 'inline paragraph line height');
    assert.equal(inline[`inline-${index}-p`].fontWeight, '600', 'inline paragraph weight');
  }
});

test('table opt-in leaves application layout and equal-metric paragraph margins intact', async () => {
  const body = id => `<tr><td><p data-probe="${id}-first-p">First</p>
    <p data-probe="${id}-second-p">Second</p><span>Tail</span></td>
    <td><p data-probe="${id}-sole-p">Sole paragraph</p></td></tr>`;
  const styles = await render([
    sampleTable('control', { className: 'designed', body: body('control') }),
    tableVariants.map(({ className }, index) => '<h2>Section heading</h2>'
      + sampleTable(`layout-${index}`, { className: `${className} designed`, body: body(`layout-${index}`) })).join(''),
  ].join(''), {
    extraCss: `:root { --t-body-font-size-min:16px; --t-body-font-size-max:16px; --t-line-height-body:1.45;
        --t-table-font-size:16px; --t-table-line-height:1.45; }
      @layer reset {
        .designed { inline-size:280px; margin-block:17px 19px; padding:3px;
          border:3px solid black; border-collapse:separate; border-spacing:7px 11px;
          table-layout:fixed; text-align:end; white-space:nowrap; overflow-wrap:normal; overflow:visible; }
        .designed th, .designed td { padding:9px 13px; border:2px dashed black; vertical-align:bottom; }
        .designed caption { caption-side:bottom; text-align:start; }
      }`,
  });
  for (const [index] of tableVariants.entries()) {
    const id = `layout-${index}`;
    for (const property of [
      'marginStart', 'marginEnd', 'paddingBlockStart', 'paddingInlineStart', 'borderTopWidth', 'borderTopStyle',
      'borderCollapse', 'borderSpacing', 'tableLayout', 'inlineSize', 'textAlign', 'whiteSpace', 'overflowWrap', 'overflowX',
    ]) assert.equal(styles[id][property], styles.control[property], `application table ${property}`);
    near(styles[id].marginStart, 17, 'heading before the table does not change its start margin');
    near(styles[id].marginEnd, 19, 'last table retains the application end margin');
    for (const suffix of ['-head-th', '-caption']) {
      for (const property of ['paddingBlockStart', 'paddingInlineStart', 'borderTopWidth', 'verticalAlign', 'captionSide', 'textAlign']) {
        assert.equal(styles[`${id}${suffix}`][property], styles[`control${suffix}`][property], `${suffix}: application ${property}`);
      }
    }
    for (const suffix of ['first-p', 'second-p', 'sole-p']) {
      near(styles[`${id}-${suffix}`].lineHeight, styles[`control-${suffix}`].lineHeight, 'fixtures have equal line metrics');
      near(styles[`${id}-${suffix}`].marginStart, styles[`control-${suffix}`].marginStart, `${suffix}: existing start margin`);
      near(styles[`${id}-${suffix}`].marginEnd, styles[`control-${suffix}`].marginEnd, `${suffix}: existing end margin`);
    }
    near(styles[`${id}-first-p`].marginEnd, 0.75 * styles[`${id}-first-p`].lineHeight, 'nonfinal paragraph retains lh spacing');
    near(styles[`${id}-sole-p`].marginEnd, 0, 'sole paragraph retains existing last-child trim');
  }
});
