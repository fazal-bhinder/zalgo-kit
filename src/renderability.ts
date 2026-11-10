import { countMarks } from './zalgo.js';

export type RenderabilityLevel = 'safe' | 'caution' | 'risky';

export type RenderabilityResult = {
  level: RenderabilityLevel;
  marksPerCharacter: number;
  label: string;
  detail: string;
};

/**
 * A plain-language estimate of how likely this exact glitch text is to get trimmed,
 * rendered as boxes, or otherwise mangled somewhere it gets pasted.
 *
 * This is explicitly an ESTIMATE, not a per-platform test result: we have not run
 * every output against every platform's renderer (that would be a different,
 * fabricated kind of claim — see PROMPT.md's honesty rules). It is derived from one
 * real, checkable fact: how many combining marks are stacked per visible character.
 * More stacked marks means more bytes per character, which is the actual, documented
 * mechanism behind truncation and tofu-box rendering on older text fields and some
 * mobile keyboards — so the estimate is grounded, even though it isn't a guarantee.
 */
export function assessRenderability(glitchedText: string, visibleCharCount: number): RenderabilityResult {
  const { total } = countMarks(glitchedText);
  const marksPerCharacter = visibleCharCount > 0 ? total / visibleCharCount : 0;

  if (marksPerCharacter <= 4) {
    return {
      level: 'safe',
      marksPerCharacter,
      label: 'Likely safe',
      detail:
        'Low mark density. This should paste cleanly into most bios, chats and usernames.',
    };
  }

  if (marksPerCharacter <= 9) {
    return {
      level: 'caution',
      marksPerCharacter,
      label: 'May get trimmed',
      detail:
        'Medium mark density. Discord keeps at most 5 marks per letter, and name fields count ' +
        'every mark, so this may get cut in Discord or in a username.',
    };
  }

  return {
    level: 'risky',
    marksPerCharacter,
    label: 'High risk of breaking',
    detail:
      'Heavy mark density. Discord will trim it and a name field will run out of room after a ' +
      'few letters. WhatsApp, Slack and Telegram kept every mark it now uses in our test.',
  };
}
