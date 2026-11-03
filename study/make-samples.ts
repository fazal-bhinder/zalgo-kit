// Generates the fixed, seeded test strings for the platform study.
// Run: npx tsx study/make-samples.ts  -> study/samples/*.txt + samples.json
import { writeFileSync } from 'node:fs';
import { glitchify, countMarks } from '../src/index.js';

const TEXT = 'zalgo test';
const SEED = 20261103;
export const LEVELS = [
  { id: 'subtle', label: 'Subtle (15/0/15)', i: { above: 15, mid: 0, below: 15 } },
  { id: 'default', label: 'Default (45/15/45)', i: { above: 45, mid: 15, below: 45 } },
  { id: 'heavy', label: 'Heavy (65/25/65)', i: { above: 65, mid: 25, below: 65 } },
  { id: 'max', label: 'Max (100/100/100)', i: { above: 100, mid: 100, below: 100 } },
];

export function stats(s: string) {
  const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const graphemes = [...seg.segment(s)].map((g) => g.segment);
  const perChar = graphemes.filter((g) => g.trim()).map((g) => [...g].length - 1);
  return {
    codePoints: [...s].length,
    utf16: s.length,
    utf8Bytes: Buffer.byteLength(s, 'utf8'),
    graphemes: graphemes.length,
    marks: countMarks(s).total,
    maxMarksOnOneChar: Math.max(0, ...perChar),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = LEVELS.map((l) => {
    const text = glitchify(TEXT, l.i, SEED);
    writeFileSync(`study/samples/${l.id}.txt`, text);
    return { id: l.id, label: l.label, text, ...stats(text) };
  });
  writeFileSync('study/samples/samples.json', JSON.stringify(out, null, 2));
  console.table(out.map(({ text, ...r }) => r));
}
