// Combining diacritical marks grouped by where they render relative to the base
// character. This above/mid/below split is what makes the three-slider intensity
// control possible — see PLAN.md §2.2 claim #1.
//
// "Mid" marks (strikethrough/overlay style) are the ones most likely to render as a
// tofu box on older systems — see renderability.ts, which is why they get their own
// independent control instead of being folded into "above".

// U+030A (ring above), U+0333 (double low line) and U+033F (double overline) are
// deliberately left out: Telegram replaces exactly these three with a plain space,
// which splits the word (tested 2026-11-03, see
// https://fontglitch.com/guides/zalgo-text-discord-telegram-whatsapp-slack-test).

export const MARKS_ABOVE = [
  '̍', '̎', '̄', '̅', '̑', '̆', '̐',
  '͒', '͗', '͑', '̇', '̈', '͂', '̓',
  '̈́', '͊', '͋', '͌', '̃', '̂', '̌', '͐',
  '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽',
  '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ',
  'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛',
  '͆', '̚',
];

export const MARKS_BELOW = [
  '̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟',
  '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬',
  '̭', '̮', '̯', '̰', '̱', '̲', '̹',
  '̺', '̻', '̼', 'ͅ', '͇', '͈', '͉', '͍',
  '͎', '͓', '͔', '͕', '͖', '͙', '͚', '̣',
];

export const MARKS_MID = [
  '̕', '̛', '̀', '́', '͘', '̡', '̢', '̧',
  '̨', '̴', '̵', '̶', '͜', '͝', '͞', '͟',
  '͠', '͢', '̸', '̷', '͡', '҉',
];

export const MAX_MARKS_PER_ZONE = 14;
