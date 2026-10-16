import { describe, expect, test } from '@jest/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { applyCornerDefaults, cornerProperties, cornerSizes, cornerStyles, createCornerProperties } from './corners.js';

describe('shared corner configuration', () => {
  test('a single scale changes every role and the onboarding drawings', () => {
    const full = createCornerProperties(cornerSizes, 1);
    const half = createCornerProperties(cornerSizes, 0.5);
    for (const name of Object.keys(full)) {
      // Preview units are rounded to two decimal places for the illustrations.
      expect(parseFloat(half[name])).toBeCloseTo(parseFloat(full[name]) / 2, name.includes('preview') ? 1 : 5);
    }
  });

  test('changing one role also updates its illustration without changing other roles', () => {
    const before = createCornerProperties(cornerSizes, 1);
    const after = createCornerProperties({ ...cornerSizes, popup: cornerSizes.popup * 2 }, 1);
    expect(after['--lovely-default-radius-popup']).not.toBe(before['--lovely-default-radius-popup']);
    expect(after['--lovely-default-preview-radius-popup']).not.toBe(before['--lovely-default-preview-radius-popup']);
    for (const name of Object.keys(before).filter(name => !name.endsWith('-popup'))) {
      expect(after[name]).toBe(before[name]);
    }
  });

  test('shadow roots and body-mounted elements use the same private defaults', () => {
    const inlineProperties = {};
    applyCornerDefaults({ style: { setProperty(name, value) { inlineProperties[name] = value; } } });
    expect(inlineProperties).toEqual(cornerProperties);
    for (const [name, value] of Object.entries(cornerProperties)) {
      expect(cornerStyles).toContain(`${name}: ${value};`);
    }
    // Theme and per-component public variables must remain inherited.
    expect(cornerStyles).not.toMatch(/--lovely-radius(?:-[a-z]+)?\s*:/);
    expect(cornerStyles).not.toMatch(/:root|html|body/);
  });

  test('component styles cannot reintroduce literal corner sizes', () => {
    const root = fileURLToPath(new URL('../', import.meta.url));
    const violations = [];
    function scan(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) { scan(path); continue; }
        if (!/\.(css|js)$/.test(path) || path.endsWith('.test.js') || path.endsWith('/styles/corners.js')) continue;
        const source = readFileSync(path, 'utf8');
        const declarations = source.matchAll(/(?:border(?:-[a-z]+)*-radius|borderRadius|--mdc-shape-(?:small|medium|large))\s*:\s*([^;\n]+)/g);
        for (const match of declarations) {
          if (/(?<![\w.-])(?:[1-9]\d*(?:\.\d+)?|0\.\d+)(?:px|cqw|%)/.test(match[1])) violations.push(`${path}: ${match[0]}`);
        }
        if (/--lovely-radius[^\n;]+,\s*\d+(?:\.\d+)?(?:px|cqw)/.test(source)) violations.push(`${path}: numeric corner fallback`);
      }
    }
    scan(root);
    expect(violations).toEqual([]);
  });
});
