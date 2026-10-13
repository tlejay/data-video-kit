# Understanding and pairing the data

Detail for SKILL.md steps 1 and 2. Fetch recipes: `data-sources.md`.

## Understand the data before having ideas

- Get it into a file (export a private sheet as CSV, or download a public one). Note where
  the header really starts, the collection date, and the source.
- Clean and check: duplicates, missing fields, ids, totals that match the brief. **Every
  number said on screen is recomputed by you**, never copied from the brief. When the brief
  and the data disagree (a tie the brief missed, a point outside its stated area), ask the
  editor before writing, with options for the choices.
- Find the shape: top N and how concentrated it is (top 2 = 52.6% is a story), the long
  tail (five districts with 1 store each), ties, outliers, a geographic or time pattern,
  anything that lines up with something viewers already know (a highway, a season, a
  holiday, a price).

## Pair it with a second dataset (the default axis)

[rule] A single data source is rarely interesting on its own: tie it to a second one (often
population or another public dataset) and use that as the axis, with the caveat below.
One dataset says **where/how much**; a second one lets the video say **why** and **per what**.
Before choosing the angle, ask what public dataset turns the counts into a ratio or a
comparison, fetch it, join it, and look again:

| Raw data is about | Pair with |
|---|---|
| places (stores, clinics, schools, events) | roads and junctions (OSM), land use, other services, tourist arrivals; registered population only as rough context, never as a per-head ratio |
| money (sales, budgets, prices) | population, income, inflation, the same period last year |
| time (tickets, visits, posts) | calendar: holidays, weather, school terms, paydays |
| people (members, applicants) | the population they come from (age, province) |

**Check the second dataset measures what the story claims.** Stores-per-head was rejected in
the store-network video: the Thai population figures (DOPA) count *registered* residents
(house registration), not where people actually live or spend the day. Commuters, students,
migrant workers and tourists are missing, and people registered in their home village are
counted where they do not live. Dividing store counts by that would mislead, so the
dimension was dropped. Before pairing, ask "does this number count the thing my sentence is
about?"; if it only approximates it, do not build a ratio on it. Prefer datasets that
measure presence or activity directly (roads and traffic, land use, schools and hospitals,
tourist arrivals, night-time lights) or keep the claim qualitative ("อาจสะท้อน", may reflect).

Rules: say exactly what the second dataset counts and put that on screen; join on codes,
not names, where you can; check the joined total against the source's own total; show the
editor the joined findings with their caveat before writing them into a script.

Fetch recipes (Thai sources: DOPA, Overpass, MHESI, NSO, CKAN, MOC CPI): `data-sources.md`.
