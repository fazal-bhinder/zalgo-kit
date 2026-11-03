# Zalgo text on Discord, Telegram, WhatsApp and Slack (3 November 2026)

Write-up: https://fontglitch.com/guides/zalgo-text-discord-telegram-whatsapp-slack-test

## Method

- `make-samples.ts` generates "zalgo test" at four intensities with this library's `glitchify` and a fixed seed (20261103), so `samples/*.txt` are reproducible: subtle 15/0/15, default 45/15/45, heavy 65/25/65, max 100/100/100.
- Controlled strings, generated in the page: letters with exactly N marks each (N = 4, 5, 6, 8, 20; above marks from U+0300, below marks from U+0316), 20-letter strings with 3 and 5 marks per letter, and `allmarks` ('a' + each of U+0300..U+036F and U+0489).
- Each string was pasted into the web client and sent to the tester's own chat: a private Discord server, Telegram Saved Messages, WhatsApp "Message yourself" and a Slack DM to self. The browser was Brave on macOS.
- The received text was read back from the DOM and compared code point by code point. On Discord and Telegram the sent message was also opened in edit mode, which showed the stored text matched what was displayed.

## Results

| App | Result |
|---|---|
| Discord | At most **5 combining marks per letter** (it keeps the first 5 in order). Long messages are trimmed further: whole runs of letters lose every mark. The composer held the full string; the stored message is trimmed. |
| Telegram Web | No mark limit. Exactly 3 of 113 marks are replaced by U+0020: **U+030A, U+0333, U+033F**. |
| WhatsApp Web | Byte-identical for every test, including 20 marks per letter. |
| Slack | Converted to **NFC**: the text is canonically equivalent and every mark is kept. |

Raw data is in `results/*.json`.

## Limits

Web clients only, one day, one account per app. Mobile apps weren't tested. The rules can change without notice.
