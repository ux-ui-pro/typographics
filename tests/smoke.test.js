import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const expectedArtifacts = ['dist/index.css'];

test('dist artifacts exist', () => {
  for (const artifact of expectedArtifacts) {
    assert.equal(existsSync(artifact), true, `${artifact} should exist`);
  }
});

test('code blocks use the fluid body font size by default', () => {
  const css = readFileSync('dist/index.css', 'utf8');

  assert.ok(css.includes('--t-code-block-scale:1'));
  assert.ok(css.includes('font-size:var(--t-code-block-font-size,calc(var(--t-body-font-size-clamp)*var(--t-body-scale,1)*var(--t-code-block-scale,1)))'));
});
