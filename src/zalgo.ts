import { MARKS_ABOVE, MARKS_BELOW, MARKS_MID, MAX_MARKS_PER_ZONE } from './zalgoMarks.js';

export type ZalgoIntensity = {
  /** 0-100: density of marks-above (accents, carons, rings). */
  above: number;
  /** 0-100: density of marks-through (strikethrough/overlay marks — the ones most
   * likely to render as a tofu box on older systems, see renderability.ts). */
  mid: number;
  /** 0-100: density of marks-below (cedillas, macrons-below, dots-below). */
  below: number;
};

export const DEFAULT_INTENSITY: ZalgoIntensity = { above: 45, mid: 15, below: 45 };

/** Heavier preset used where "zalgo" framing specifically wants the classic, more
 * extreme look — the homepage default and the shared example generator both read
 * from this instead of duplicating the numbers. */
export const ZALGO_HEAVY_INTENSITY: ZalgoIntensity = { above: 65, mid: 25, below: 65 };

/** Deterministic PRNG (mulberry32) so the same input+intensity+seed always produces
 * the same output — needed for stable examples on marketing pages and for the
 * engine test suite's fixtures. The live tool uses Math.random (no seed passed). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function marksForZone(pool: string[], intensity: number, rng: () => number): string {
  const maxCount = Math.round((clamp01to100(intensity) / 100) * MAX_MARKS_PER_ZONE);
  if (maxCount <= 0) return '';
  const count = 1 + Math.floor(rng() * maxCount);
  let out = '';
  for (let i = 0; i < count; i++) {
    out += pool[Math.floor(rng() * pool.length)];
  }
  return out;
}

function clamp01to100(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/** Turns plain text into glitch/zalgo text by stacking combining marks on every
 * non-whitespace character. Whitespace is left untouched — glitching spaces produces
 * invisible mark buildup that inflates length without a visible effect, which is
 * exactly the kind of unverifiable "more glitch" that fails PROMPT.md's honesty bar. */
export function glitchify(text: string, intensity: ZalgoIntensity, seed?: number): string {
  const rng = seed === undefined ? Math.random : mulberry32(seed);
  let result = '';
  for (const ch of Array.from(text)) {
    result += ch;
    if (/\s/.test(ch)) continue;
    result += marksForZone(MARKS_ABOVE, intensity.above, rng);
    result += marksForZone(MARKS_MID, intensity.mid, rng);
    result += marksForZone(MARKS_BELOW, intensity.below, rng);
  }
  return result;
}

/** Counts combining marks actually present in a string, per zone. Used both by the
 * renderability signal and by the independent verification in test/run.ts (which
 * re-derives this from the Unicode category of each code point rather than trusting
 * the generator's own bookkeeping). */
export function countMarks(text: string): { above: number; mid: number; below: number; total: number } {
  const aboveSet = new Set(MARKS_ABOVE);
  const midSet = new Set(MARKS_MID);
  const belowSet = new Set(MARKS_BELOW);
  let above = 0;
  let mid = 0;
  let below = 0;
  for (const ch of Array.from(text)) {
    if (aboveSet.has(ch)) above++;
    else if (midSet.has(ch)) mid++;
    else if (belowSet.has(ch)) below++;
  }
  return { above, mid, below, total: above + mid + below };
}
