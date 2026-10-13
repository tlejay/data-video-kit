# ElevenLabs audio tags (cheat sheet)

Source: https://elevenlabs.io/blog/elevenlabs-audio-tags-list
Works on **eleven_v4**, eleven_v4_turbo and eleven_v3, in the app and through the API.

## How to use them
- **Square brackets only**: `[laughs]`. Parentheses or braces get read out loud.
- **Put the tag before the words it affects.** An emotion carries on until the next tag.
- **One tag per clause.** Two contrasting tags on the same words blur the read.
- **Combine with a comma inside one bracket** for nuance: `[whispering, playful]`.
- **Plain-language directions work too**: `[like a sports commentator, speeding up]`,
  `[starting calm, then losing patience]`, `[out of breath after running up the stairs]`.
- **Punctuation is part of the direction.** `...`, commas and `!` change pacing; pair them with tags.
- **Give the whole scene in one call** (up to 10,000 chars) rather than line by line: the model
  acts better with context. One clip cannot span two keys, so check `scripts/tts-quota.py` first.
- **If a tag misses, swap it for a neighbouring tag before rewriting the line**, then regenerate.
- Tags are English even inside Thai text (tested: `[laughs]` and `[whispers]` in a Thai line
  rendered correctly on both v3 and v4).
- The kit's default settings (stability 0.25, style 0.75) are on the expressive side, which
  is what tags need. Raising stability makes tags weaker.

## The list
**High energy:** [excited] [playful] [amazed] [powerful] [proud] [optimistic] [startled]
**Heated:** [mad] [aggressive] [bitter] [critical] [repelled]
**Tense:** [anxious] [stressed] [scared] [threatened] [vulnerable] [confused] [busy]
**Low energy:** [tired] [bored] [distant] [despair] [let down]
**Calm, reflective:** [peaceful] [content] [curious] [thoughtful] [trusting]
**Delivery, volume:** [whispers] [shouts] [softly] [quietly] [low, threatening] [hushed] [barely audible] [booming] [disbelief]
**Pacing:** [slowly] [rushed] [pause] [drawn out] [snappy] [long pause] [speedy]
**Human reactions:** [laughs] [sighs] [gasps] [clears throat] [crying] [starts crying]
**Accents, character:** [British accent] [French accent] [Australian accent] [pirate voice]
**Sound effects:** [thunder rumbling] [footsteps] [door creaking] [clapping] [owl hooting] [twig snapping] [many footsteps] [zipper opening] [dog barking]

## Defaults that fit a narrated data video
- Opening question: `[curious]`. Before the payoff: `[thoughtful]` or `[pause]`. Good news: `[optimistic]`.
  Closing line to the viewer: `[warmly]`.
- Bad news: a plain-language direction such as `[serious, a bit worried]`, never laughing.
- One tag per clip at most in a data video; the facts carry it. Sound-effect tags only when
  the video is meant to have them (the mixer adds SFX separately).
- Do not overdo it: more than one or two tags per sentence sounds like a radio skit.
