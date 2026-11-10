# zalgo-kit

Zalgo (glitch) text that you can control. Combining marks are stacked above the letters, through them, and below them, and each of the three zones has its own intensity. Pass a seed to get the same output every time. The kit also includes a renderability estimate, which warns when text is likely to get cut off after it is pasted (Discord keeps 5 marks per letter; name fields count every mark), and 17 Unicode "fancy font" converters (bold, cursive, gothic, bubble, small caps, wide and more). It is pure TypeScript with zero dependencies and no DOM.

Powers https://fontglitch.com

## Use

```
npm install zalgo-kit
```

### Glitch text

```ts
import { glitchify, DEFAULT_INTENSITY, ZALGO_HEAVY_INTENSITY } from 'zalgo-kit';

glitchify('hello', DEFAULT_INTENSITY);                       // random each call
glitchify('hello', { above: 60, mid: 20, below: 60 }, 42);   // seeded: same output every time
glitchify('hello', ZALGO_HEAVY_INTENSITY);                   // the classic heavy look
```

Each zone takes a value from 0 to 100. At 100, a zone can stack up to 14 marks on each character. `mid` (strikethrough and overlay marks) crosses the letters and makes text hardest to read, which is why it has its own control. Whitespace is never glitched. Seeded output comes from mulberry32, so it is stable across runtimes.

### Will it survive being pasted?

```ts
import { glitchify, assessRenderability, countMarks } from 'zalgo-kit';

const text = 'hello';
const out = glitchify(text, { above: 45, mid: 15, below: 45 }, 42);

assessRenderability(out, [...text].length);
// { level: 'caution', marksPerCharacter: 8.4, label: 'May get trimmed', detail: '...' }

countMarks(out);   // { above, mid, below, total }
```

The score is based on the number of marks per visible character: up to 4 is `safe`, up to 9 is `caution`, and anything higher is `risky`. It is an estimate, not a test against each platform. It is grounded in the real reason glitch text breaks: some apps limit fields by bytes rather than characters, and some fonts have no glyph for stacked marks.

### Unicode text styles

```ts
import { getStyle, TEXT_STYLES } from 'zalgo-kit';

getStyle('bold').transform('Hello 123');   // '𝐇𝐞𝐥𝐥𝐨 𝟏𝟐𝟑'
getStyle('script').transform('Hello');     // 'ℋℯ𝓁𝓁ℴ'
getStyle('fraktur').transform('Hello');    // 'ℌ𝔢𝔩𝔩𝔬'
getStyle('circled').transform('Hello');    // 'Ⓗⓔⓛⓛⓞ'
getStyle('small-caps').transform('hello'); // 'ʜᴇʟʟᴏ'

for (const s of TEXT_STYLES) console.log(s.id, s.label, s.transform('Glitch'));
```

The style IDs are `bold`, `italic`, `bold-italic`, `script`, `bold-script`, `fraktur`, `double-struck`, `sans`, `sans-bold`, `monospace`, `circled`, `squared`, `small-caps`, `superscript`, `fullwidth`, `strikethrough` and `underline`.

Most styles come from the Mathematical Alphanumeric Symbols block. Unicode leaves gaps in that block, and those gaps are filled from the Letterlike Symbols block, for example the italic `h` becomes `ℎ`. A character with no look-alike anywhere in Unicode, such as the superscript `q`, is passed through unchanged rather than dropped. `squared` maps lowercase letters to the uppercase glyphs, because Unicode has no squared lowercase letters.

## API

| Export | What it does |
|---|---|
| `glitchify(text, intensity, seed?)` | Adds combining marks to every non-space character |
| `DEFAULT_INTENSITY`, `ZALGO_HEAVY_INTENSITY` | Presets: `{45,15,45}` and `{65,25,65}` |
| `countMarks(text)` | Counts the marks from each zone in a string |
| `assessRenderability(text, visibleChars)` | Returns `safe`, `caution` or `risky`, with label and detail text |
| `TEXT_STYLES`, `getStyle(id)` | The 17 styles, as `{ id, label, category, transform }` |
| `MARKS_ABOVE`, `MARKS_MID`, `MARKS_BELOW`, `MAX_MARKS_PER_ZONE` | The raw mark pools |

Types: `ZalgoIntensity`, `RenderabilityLevel`, `RenderabilityResult`, `TextStyle`, `TextStyleId`.

## Tests

```
npm test   # 13 engine checks, including an independent check of the mark count against Unicode's \p{Mn} property
```

## License

MIT
