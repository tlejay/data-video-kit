# Review checklist for stills

Detail for SKILL.md step 7. Paste into every visuals prompt, and check every still against
it before the editor sees it (lessons from the first videos in brackets).

1. **Nothing cut off at rest.** When the camera rests on an element, all of it fits inside the
   safe-area box (`visual-craft.md`) (economy v1: "343,51", "2 ล้าน" clipped). Zoom per
   keyframe = from the element's bbox.
2. **Captions readable:** ~46 px bold, dark pill, subtitle band, outside the camera.
3. **No empty or near-black frames**; a mood change still shows its number clearly.
4. **Zoom-outs stay readable** (key numbers >= 40 px), then hold the closing line large.
5. **Only numbers from the script/spec** on screen (economy v1 invented a rent bar for another province).
6. **Counters land on the exact value** before the scene changes, timed to when it is spoken
   (store video v2: the counter stopped at 429, not 430).
7. **No overlaps** between labels and values (a tie note over "17"; a counter over "32 อำเภอ").
8. **No middle dot or em dash** in on-screen text.
9. **Same look across a series** (store video v2 first came back in a different dark theme).
10. **Real geometry only:** roads and borders from a cited source; if the fetch fails, retry
    other mirrors before accepting "could not load".
11. **Frame 1 alone tells what the video is about** (the full-bleed thesis poster picked from
    the A/B/C stills), not after a draw-in.
12. Run `scripts/mv-safezone.py` on every still and read the overlay, not just the plain still.
13. **Motion variety:** no transition used twice in a row, strong moves only at turns, one
    counter at most, quantity units drawn as relevant icons.

**Backgrounds ([rule], the editor called this very important):** put the scene stills side
by side. If two scenes share the same background treatment with only the colour changed, it
fails (the social-security video's first build re-coloured the same light rays in every
scene). Each scene needs its own background idea tied to its content (desk paper, interior
hall, contour map, halftone field, blueprint grid, tiled pattern, ...); consistency comes
from the palette family, the accent glow, the object language and the type, not from
repeating one backdrop.
