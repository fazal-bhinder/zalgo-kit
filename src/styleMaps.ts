// Unicode alphabet-substitution styles: each maps plain ASCII letters/digits to
// look-alike code points from the Mathematical Alphanumeric Symbols block (and a
// handful of older blocks for circled/small-caps/superscript). This is a genuinely
// different mechanic from zalgo.ts (substitution, not combining marks) — see
// PLAN.md Part 0 for why both live in one engine.
//
// Unicode leaves deliberate gaps in several of these blocks (to avoid duplicating
// pre-existing "letterlike symbol" code points). Where a gap exists we either map to
// that pre-existing symbol (documented as `exceptions` below) or, where no visually
// matching code point exists anywhere in Unicode, leave the character unchanged. That
// second case is a real, honest limitation — not a bug — and callers should not treat
// an unmapped character as an error.

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DIGITS = '0123456789'.split('');

function range(base: string[], start: number, exceptions: Record<string, number> = {}): Record<string, string> {
  const map: Record<string, string> = {};
  base.forEach((ch, i) => {
    map[ch] = String.fromCodePoint(exceptions[ch] ?? start + i);
  });
  return map;
}

function merge(...maps: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, ...maps);
}

// --- Mathematical Alphanumeric Symbols block (contiguous per-style, with documented
// holes filled from the Letterlike Symbols block per the Unicode standard). ---

const BOLD = merge(
  range(UPPER, 0x1d400),
  range(LOWER, 0x1d41a),
  range(DIGITS, 0x1d7ce),
);

const ITALIC = merge(
  range(UPPER, 0x1d434),
  range(LOWER, 0x1d44e, { h: 0x210e }), // planck constant fills the italic small-h hole
);

const BOLD_ITALIC = merge(
  range(UPPER, 0x1d468),
  range(LOWER, 0x1d482),
);

const SCRIPT = merge(
  range(UPPER, 0x1d49c, {
    B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b,
  }),
  range(LOWER, 0x1d4b6, { e: 0x212f, g: 0x210a, o: 0x2134 }),
);

const BOLD_SCRIPT = merge(
  range(UPPER, 0x1d4d0),
  range(LOWER, 0x1d4ea),
);

const FRAKTUR = merge(
  range(UPPER, 0x1d504, { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 }),
  range(LOWER, 0x1d51e),
);

const DOUBLE_STRUCK = merge(
  range(UPPER, 0x1d538, {
    C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124,
  }),
  range(LOWER, 0x1d552),
  range(DIGITS, 0x1d7d8),
);

const SANS = merge(
  range(UPPER, 0x1d5a0),
  range(LOWER, 0x1d5ba),
  range(DIGITS, 0x1d7e2),
);

const SANS_BOLD = merge(
  range(UPPER, 0x1d5d4),
  range(LOWER, 0x1d5ee),
  range(DIGITS, 0x1d7ec),
);

const MONOSPACE = merge(
  range(UPPER, 0x1d670),
  range(LOWER, 0x1d68a),
  range(DIGITS, 0x1d7f6),
);

// --- Enclosed Alphanumerics / older blocks (not part of the Mathematical block, but
// the standard source for "bubble text" and "small caps" generators). ---

const CIRCLED: Record<string, string> = merge(
  range(UPPER, 0x24b6),
  range(LOWER, 0x24d0),
  range('123456789'.split(''), 0x2460),
  { '0': '⓪' },
);

const SQUARED_UPPER: Record<string, string> = range(UPPER, 0x1f130);
const SQUARED: Record<string, string> = merge(
  SQUARED_UPPER,
  Object.fromEntries(LOWER.map((c, i) => [c, SQUARED_UPPER[UPPER[i]]])),
);

// Small caps has no dedicated code point for lowercase q or x anywhere in Unicode —
// both fall through unchanged. Uppercase input is left as-is (it is already "caps").
const SMALL_CAPS: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ',
  i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ',
  q: 'ꞯ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ',
};

// Superscript ("tiny text"). Several letters have no superscript code point in any
// Unicode block; they fall through unchanged rather than being silently dropped.
const SUPERSCRIPT: Record<string, string> = {
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ',
  i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ',
  q: 'q', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ',
  y: 'ʸ', z: 'ᶻ',
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

const FULLWIDTH: Record<string, string> = merge(
  range(UPPER, 0xff21),
  range(LOWER, 0xff41),
  range(DIGITS, 0xff10),
  { ' ': '　' },
);

export type TextStyleId =
  | 'bold' | 'italic' | 'bold-italic' | 'script' | 'bold-script' | 'fraktur'
  | 'double-struck' | 'sans' | 'sans-bold' | 'monospace' | 'circled' | 'squared'
  | 'small-caps' | 'superscript' | 'fullwidth' | 'strikethrough' | 'underline';

export type TextStyle = {
  id: TextStyleId;
  label: string;
  category: 'classic' | 'bubble' | 'decorated';
  transform: (text: string) => string;
};

function substitute(map: Record<string, string>) {
  return (text: string) =>
    Array.from(text)
      .map((ch) => map[ch] ?? ch)
      .join('');
}

function overlay(mark: string) {
  return (text: string) =>
    Array.from(text)
      .map((ch) => (/\s/.test(ch) ? ch : ch + mark))
      .join('');
}

export const TEXT_STYLES: TextStyle[] = [
  { id: 'bold', label: 'Bold', category: 'classic', transform: substitute(BOLD) },
  { id: 'italic', label: 'Italic', category: 'classic', transform: substitute(ITALIC) },
  { id: 'bold-italic', label: 'Bold italic', category: 'classic', transform: substitute(BOLD_ITALIC) },
  { id: 'script', label: 'Cursive', category: 'classic', transform: substitute(SCRIPT) },
  { id: 'bold-script', label: 'Bold cursive', category: 'classic', transform: substitute(BOLD_SCRIPT) },
  { id: 'fraktur', label: 'Gothic', category: 'decorated', transform: substitute(FRAKTUR) },
  { id: 'double-struck', label: 'Outline', category: 'decorated', transform: substitute(DOUBLE_STRUCK) },
  { id: 'sans', label: 'Sans-serif', category: 'classic', transform: substitute(SANS) },
  { id: 'sans-bold', label: 'Sans-serif bold', category: 'classic', transform: substitute(SANS_BOLD) },
  { id: 'monospace', label: 'Monospace', category: 'classic', transform: substitute(MONOSPACE) },
  { id: 'circled', label: 'Bubble', category: 'bubble', transform: substitute(CIRCLED) },
  { id: 'squared', label: 'Squared', category: 'bubble', transform: substitute(SQUARED) },
  { id: 'small-caps', label: 'Small caps', category: 'decorated', transform: substitute(SMALL_CAPS) },
  { id: 'superscript', label: 'Small text', category: 'decorated', transform: substitute(SUPERSCRIPT) },
  { id: 'fullwidth', label: 'Wide', category: 'decorated', transform: substitute(FULLWIDTH) },
  { id: 'strikethrough', label: 'Strikethrough', category: 'decorated', transform: overlay('̶') },
  { id: 'underline', label: 'Underline', category: 'decorated', transform: overlay('̲') },
];

export function getStyle(id: TextStyleId): TextStyle {
  const style = TEXT_STYLES.find((s) => s.id === id);
  if (!style) throw new Error(`Unknown text style: ${id}`);
  return style;
}
