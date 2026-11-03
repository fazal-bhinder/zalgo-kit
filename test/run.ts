// Engine test suite. Run with: npx tsx test/run.ts
//
// Includes an INDEPENDENT verification pass (the countMarks vs \p{Mn} test) that does not
// use our own zalgoMarks.ts pool at all — it re-derives "is this a combining mark"
// from the Unicode general-category property via a native regex, so a typo in our
// hand-picked pool (e.g. accidentally including a spacing character) would be caught
// by a mechanism that doesn't share the bug.

import assert from 'node:assert/strict';
import { glitchify, countMarks, TEXT_STYLES, getStyle, assessRenderability } from '../src/index.ts';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL  ${name}`);
    console.error(err instanceof Error ? err.message : err);
  }
}

// --- zalgo engine ---

test('glitchify is a no-op at zero intensity', () => {
  const out = glitchify('hello world', { above: 0, mid: 0, below: 0 });
  assert.equal(out, 'hello world');
});

test('glitchify with a seed is deterministic', () => {
  const a = glitchify('glitch', { above: 60, mid: 20, below: 60 }, 42);
  const b = glitchify('glitch', { above: 60, mid: 20, below: 60 }, 42);
  assert.equal(a, b);
});

test('glitchify with different seeds diverges', () => {
  const a = glitchify('glitch', { above: 60, mid: 20, below: 60 }, 1);
  const b = glitchify('glitch', { above: 60, mid: 20, below: 60 }, 2);
  assert.notEqual(a, b);
});

test('glitchify never adds marks to whitespace', () => {
  const out = glitchify('a b', { above: 100, mid: 100, below: 100 }, 7);
  // Split back into visible chars via base-letter search: whitespace runs in the
  // output must be exactly single spaces, never a space followed by a combining mark.
  assert.ok(!/\s\p{M}/u.test(out), 'expected no combining mark to follow a space');
});

test('glitchify never emits the three marks Telegram turns into spaces', () => {
  const telegramBroken = /[\u030A\u0333\u033F]/u;
  for (let seed = 1; seed <= 200; seed++) {
    const out = glitchify('the quick brown fox', { above: 100, mid: 100, below: 100 }, seed);
    assert.ok(!telegramBroken.test(out), `seed ${seed} emitted a Telegram-broken mark`);
  }
});

test('countMarks matches an independently-derived Unicode Mn count', () => {
  const out = glitchify('abcdef', { above: 80, mid: 40, below: 80 }, 11);
  const ours = countMarks(out).total;
  // Independent check: Unicode property escape \p{Mn} = "Mark, Nonspacing" — a
  // completely separate source of truth from our hand-picked pool arrays.
  const independent = (out.match(/\p{Mn}/gu) || []).length;
  assert.equal(ours, independent, `our count (${ours}) vs \\p{Mn} count (${independent})`);
});

test('higher intensity produces more marks on average, across a batch', () => {
  const sample = (intensity: number) => {
    let total = 0;
    for (let seed = 0; seed < 30; seed++) {
      total += countMarks(glitchify('sample text', { above: intensity, mid: intensity, below: intensity }, seed)).total;
    }
    return total / 30;
  };
  const low = sample(10);
  const high = sample(90);
  assert.ok(high > low, `expected high-intensity average (${high}) > low (${low})`);
});

// --- renderability ---

test('renderability is "safe" for plain text', () => {
  const result = assessRenderability('hello world', 11);
  assert.equal(result.level, 'safe');
});

test('renderability escalates with mark density', () => {
  const heavy = glitchify('x', { above: 100, mid: 100, below: 100 }, 3);
  const result = assessRenderability(heavy, 1);
  assert.notEqual(result.level, 'safe');
});

// --- style maps ---

test('every style transform is defined and callable', () => {
  for (const style of TEXT_STYLES) {
    const out = style.transform('Test 123');
    assert.equal(typeof out, 'string');
    assert.ok(out.length > 0, `${style.id} produced empty output`);
  }
});

test('bold style maps known letters to the documented Mathematical Bold code points', () => {
  const out = getStyle('bold').transform('A');
  assert.equal(out.codePointAt(0), 0x1d400);
});

test('italic style fills the lowercase-h hole with the Planck constant symbol', () => {
  const out = getStyle('italic').transform('h');
  assert.equal(out, 'ℎ');
});

test('double-struck style fills documented holes (C, H, N, P, Q, R, Z)', () => {
  const map: Record<string, number> = { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 };
  for (const [letter, codePoint] of Object.entries(map)) {
    const out = getStyle('double-struck').transform(letter);
    assert.equal(out.codePointAt(0), codePoint, `double-struck ${letter}`);
  }
});

test('no two distinct plain letters collide onto the same glyph within one style', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  // 'squared' deliberately collapses lowercase onto the uppercase glyph — Unicode has
  // no separate squared-lowercase block, so this collision is a documented design
  // choice (see styleMaps.ts), not a data-entry bug.
  const allowCaseCollapse = new Set(['squared']);
  for (const style of TEXT_STYLES) {
    if (allowCaseCollapse.has(style.id)) continue;
    const seen = new Map<string, string>();
    for (const letter of letters) {
      const glyph = style.transform(letter);
      if (glyph === letter) continue; // unmapped fallback — allowed, not a collision
      const prior = seen.get(glyph);
      assert.ok(!prior, `${style.id}: both "${prior}" and "${letter}" map to "${glyph}"`);
      seen.set(glyph, letter);
    }
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
