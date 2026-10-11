import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const css = readFileSync(new URL('../dist/index.css', import.meta.url), 'utf8');
const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const headingClasses = ['display', 'headline', 'title'].flatMap(group =>
  ['large', 'medium', 'small'].map(size => `${group}-${size}`));
const headings = [
  ...headingTags.map(tag => ({ tag, className: '' })),
  ...headingClasses.map(className => ({ tag: 'div', className })),
];
const bodies = [
  { tag: 'p', className: '' },
  ...['large', 'medium', 'small'].map(size => ({ tag: 'div', className: `body-${size}` })),
];
const viewports = [600, 1024, 1440];
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

function node(tag, className = '', text = 'Sample text', attributes = '') {
  return `<${tag} data-child class="${className}" ${attributes}>${text}</${tag}>`;
}

function heading(descriptor, text = 'Heading', attributes = '') {
  return node(descriptor.tag, descriptor.className, text, attributes);
}

function fixture(id, children, { layout = 'flow', gap = 0, style = '', className = '' } = {}) {
  return `<section data-fixture="${id}" data-gap="${gap}" class="fixture ${layout} ${className}"
    style="gap:${gap}px;${style}">${children.join('')}</section>`;
}

async function render(markup, { width = 1024, extraCss = '' } = {}) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${css}</style><style>
    body { margin: 0; }
    .fixture { border: 1px solid transparent; margin: 0; }
    .flex { display: flex; flex-direction: column; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr); }
    ${extraCss}
    </style></head><body>${markup}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => [...document.querySelectorAll('[data-fixture]')].map(parent => ({
    id: parent.dataset.fixture,
    gap: Number(parent.dataset.gap),
    children: [...parent.querySelectorAll(':scope > [data-child]')].map(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        start: parseFloat(style.marginBlockStart),
        end: parseFloat(style.marginBlockEnd),
      };
    }),
  })));
}

// Browsers round used lengths to subpixels; compare layout, not CSS serialization.
function near(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) <= 0.08,
    `${message}: expected ${expected}px, received ${actual}px`);
}

function assertHeadingChain(row) {
  const [first] = row.children;
  near(first.start, 1.25 * first.lineHeight, `${row.id}: ordinary leading heading space`);
  for (let index = 0; index < row.children.length - 1; index++) {
    const current = row.children[index];
    const next = row.children[index + 1];
    near(current.end, 0.5 * current.lineHeight, `${row.id}: heading ${index} outgoing space`);
    near(next.start, 0, `${row.id}: following element ${index + 1} leading space`);
    near(next.top - current.bottom, current.end + row.gap,
      `${row.id}: actual gap after heading ${index}`);
  }
}

test('all semantic heading pairs, utility pairs and mixed headings have one outgoing margin', async () => {
  const fixtures = [];
  for (const first of headingTags) {
    for (const second of headingTags) {
      fixtures.push(fixture(`${first}-${second}`, [node(first), node(second), node('p')]));
    }
  }
  for (const first of headingClasses) {
    for (const second of headingClasses) {
      fixtures.push(fixture(`${first}-${second}`, [node('div', first), node('div', second), node('p')]));
    }
    fixtures.push(fixture(`semantic-to-${first}`, [node('h2'), node('div', first), node('p')]));
    fixtures.push(fixture(`${first}-to-semantic`, [node('div', first), node('h3'), node('p')]));
  }
  fixtures.push(fixture('same-tag-utilities', [node('p', 'headline-large'), node('p', 'title-small'), node('p', 'body-medium')]));
  fixtures.push(fixture('three-heading-chain', [node('h2'), node('h3'), node('h4'), node('p')]));

  for (const width of viewports) {
    const rows = await render(fixtures.join(''), { width });
    for (const row of rows) {
      assertHeadingChain({ ...row, id: `${width}px ${row.id}` });
      near(row.children.at(-1).end, 0, `${row.id}: final paragraph is trimmed`);
    }
  }
});

test('all heading styles clear leading space on paragraphs and body utilities', async () => {
  const fixtures = [];
  for (const first of headings) {
    for (const body of [...bodies, { tag: 'p', className: 'label-medium' }]) {
      fixtures.push(fixture(`${first.tag}.${first.className}-to-${body.tag}.${body.className}`,
        [heading(first), node(body.tag, body.className)]));
    }
  }
  const rows = await render(fixtures.join(''), {
    extraCss: '@layer reset { .body-large, .body-medium, .body-small { margin-block-start: 19px; } }',
  });
  for (const row of rows) assertHeadingChain(row);
});

test('a small custom heading still owns the heading-to-paragraph gap', async () => {
  const rows = await render(fixture('small-heading', [node('h2'), node('p')]), {
    extraCss: `:root {
      --t-headline-large-min: 12px;
      --t-headline-large-max: 12px;
      --t-body-font-size-min: 16px;
      --t-body-font-size-max: 16px;
    }`,
  });
  const [row] = rows;
  near(row.children[0].fontSize, 12, 'custom heading size');
  near(row.children[1].fontSize, 16, 'custom body size');
  assertHeadingChain(row);
});

test('multiline chains keep their spacing in block, flex and grid layouts, including container gap', async () => {
  const fixtures = [];
  for (const layout of ['flow', 'flex', 'grid']) {
    for (const gap of layout === 'flow' ? [0] : [0, 12]) {
      fixtures.push(fixture(`${layout}-gap-${gap}`, [
        node('h2', '', 'A heading long enough to occupy several lines in this narrow column'),
        node('h3', '', 'A second heading that also wraps to several lines'),
        node('h4', '', 'A smaller heading that wraps as well'),
        node('p', '', 'Paragraph after the chain of headings.'),
      ], { layout, gap, style: 'width:220px' }));
    }
  }
  for (const width of viewports) {
    const rows = await render(fixtures.join(''), { width });
    for (const row of rows) {
      for (const current of row.children.slice(0, 3)) {
        assert.ok(current.height >= 2 * current.lineHeight - 0.08, `${row.id}: heading should wrap`);
      }
      assertHeadingChain({ ...row, id: `${width}px ${row.id}` });
    }
  }
});

test('trimming follows the actual last child, including sole children, rather than the last tag of each type', async () => {
  const fixtures = [
    fixture('repeated-h3-before-text', [node('h3'), node('p'), node('h3'), node('p')]),
    fixture('heading-last-child', [node('h3'), node('h3')]),
    fixture('paragraph-before-last-heading', [node('p'), node('h3'), node('p'), node('h3')]),
  ];
  for (const descriptor of [...headings, ...bodies,
    ...['large', 'medium', 'small'].map(size => ({ tag: 'div', className: `label-${size}` }))]) {
    fixtures.push(fixture(`sole-${descriptor.tag}.${descriptor.className}`, [heading(descriptor)]));
  }
  const rows = await render(fixtures.join(''));
  for (const row of rows) near(row.children.at(-1).end, 0, `${row.id}: actual last child margin`);
  const repeated = rows.find(row => row.id === 'repeated-h3-before-text');
  for (const index of [0, 2]) {
    near(repeated.children[index].end, 0.5 * repeated.children[index].lineHeight,
      `repeated h3 ${index}: margin survives before text`);
  }
  const paragraphs = rows.find(row => row.id === 'paragraph-before-last-heading');
  for (const index of [0, 2]) {
    near(paragraphs.children[index].end, 0.75 * paragraphs.children[index].lineHeight,
      `paragraph ${index}: margin survives before last heading`);
  }
});

test('custom components, labels, lists and code blocks retain their own leading space', async () => {
  const rows = await render([
    fixture('custom-component', [node('h2'), node('div', 'custom-component')]),
    fixture('label-component', [node('h2'), node('div', 'label-medium')]),
    fixture('list', [node('h2'), node('ul', 'list-medium', '<li>List item</li>')]),
    fixture('code', [node('h2'), node('pre', '', '<code>code sample</code>')],
      { style: '--t-code-block-margin:21px 0' }),
    fixture('intervening-component', [node('h2'), node('div', 'custom-component'), node('h3')]),
    fixture('wrapper', [node('h2'), node('div', 'wrapper',
      '<h3 data-nested-heading>Nested heading</h3><p data-nested-paragraph>Nested paragraph</p>')]),
  ].join(''), {
    extraCss: `@layer reset { .custom-component, .label-medium { margin-block-start: 19px; } }
      .wrapper { border: 1px solid transparent; }`,
  });
  for (const id of ['custom-component', 'label-component']) {
    const row = rows.find(row => row.id === id);
    near(row.children[1].start, 19, `${id}: component leading margin`);
  }
  const list = rows.find(row => row.id === 'list');
  near(list.children[1].start, 0.5 * list.children[1].lineHeight, 'list leading margin');
  near(rows.find(row => row.id === 'code').children[1].start, 21, 'code leading margin');
  const intervening = rows.find(row => row.id === 'intervening-component').children[2];
  near(intervening.start, 1.25 * intervening.lineHeight, 'nonadjacent heading keeps ordinary leading space');
  const nested = await page.locator('[data-nested-heading]').evaluate(element => {
    const style = getComputedStyle(element);
    return { start: parseFloat(style.marginBlockStart), lineHeight: parseFloat(style.lineHeight) };
  });
  near(nested.start, 1.25 * nested.lineHeight, 'wrapper prevents heading adjacency');
});

test('paragraph-to-paragraph spacing and text-to-heading leading space remain intact', async () => {
  const rows = await render([
    fixture('paragraphs', [node('p'), node('p'), node('p')]),
    fixture('text-to-heading', [node('p'), node('h3'), node('p')]),
  ].join(''));
  const paragraphs = rows[0];
  for (let index = 0; index < 2; index++) {
    const current = paragraphs.children[index];
    const next = paragraphs.children[index + 1];
    near(current.end, 0.75 * current.lineHeight, `paragraph ${index}: outgoing space`);
    near(next.start, next.fontSize, `paragraph ${index + 1}: native leading margin`);
    near(next.top - current.bottom, Math.max(current.end, next.start), 'paragraph margins collapse normally');
  }
  const textToHeading = rows[1].children[1];
  near(textToHeading.start, 1.25 * textToHeading.lineHeight, 'heading after text keeps ordinary leading space');
});

test('spacing tokens inherit from root, container and element and resolve lh against each heading', async () => {
  await render('');
  const defaults = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return ['--t-heading-space-before', '--t-heading-space-after'].map(name => style.getPropertyValue(name).trim());
  });
  assert.deepEqual(defaults.map(value => parseFloat(value)), [1.25, 0.5]);
  assert.ok(defaults.every(value => value.endsWith('lh')), 'default tokens use the receiving heading line height');

  const rows = await render([
    fixture('root-tokens', [node('h2'), node('h3'), node('p')]),
    fixture('container-tokens', [node('h2'), node('h3'), node('p')], {
      style: '--t-heading-space-before:1.5lh;--t-heading-space-after:0.25lh;line-height:100px',
    }),
    fixture('element-tokens', [node('h2', '', 'Heading',
      'style="--t-heading-space-before:17px;--t-heading-space-after:11px"'), node('p')], {
      style: '--t-heading-space-before:30px;--t-heading-space-after:20px',
    }),
  ].join(''), {
    extraCss: ':root { --t-heading-space-before:2lh; --t-heading-space-after:0.75lh; }',
  });
  for (const [id, beforeFactor, afterFactor] of [['root-tokens', 2, 0.75], ['container-tokens', 1.5, 0.25]]) {
    const row = rows.find(row => row.id === id);
    near(row.children[0].start, beforeFactor * row.children[0].lineHeight, `${id}: inherited before token`);
    for (let index = 0; index < 2; index++) {
      const current = row.children[index];
      const next = row.children[index + 1];
      near(current.end, afterFactor * current.lineHeight, `${id}: after token uses heading ${index} lh`);
      near(next.start, 0, `${id}: adjacency still clears leading space`);
      near(next.top - current.bottom, current.end, `${id}: actual token gap`);
    }
  }
  const element = rows.find(row => row.id === 'element-tokens').children;
  near(element[0].start, 17, 'element before token');
  near(element[0].end, 11, 'element after token');
  near(element[1].top - element[0].bottom, 11, 'element token determines actual gap');
});

test('unlayered styles and later components and utilities layers can override adjacency and end trimming', async () => {
  for (const layer of [null, 'components', 'utilities']) {
    const overrides = `.override h3 { margin-block-start:21px; margin-block-end:13px; }
      .override p { margin-block-start:17px; margin-block-end:25px; }`;
    const rows = await render([
      fixture('heading-end', [node('h2'), node('h3')], { className: 'override', layout: 'flex' }),
      fixture('paragraph-end', [node('h2'), node('h3'), node('p')], { className: 'override', layout: 'flex' }),
    ].join(''), { extraCss: layer ? `@layer ${layer} { ${overrides} }` : overrides });
    for (const row of rows) {
      const [first, second, paragraph] = row.children;
      near(second.start, 21, `${layer || 'unlayered'}: adjacency override`);
      near(second.end, 13, `${layer || 'unlayered'}: heading end override`);
      near(second.top - first.bottom, first.end + 21, `${layer || 'unlayered'}: actual custom heading gap`);
      if (paragraph) {
        near(paragraph.start, 17, `${layer || 'unlayered'}: paragraph adjacency override`);
        near(paragraph.end, 25, `${layer || 'unlayered'}: last-child trim override`);
        near(paragraph.top - second.bottom, 13 + 17, `${layer || 'unlayered'}: actual custom paragraph gap`);
      }
    }
  }
});
