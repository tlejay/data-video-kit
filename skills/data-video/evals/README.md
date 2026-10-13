# data-video skill evals

Three evaluation scenarios for the `data-video` skill. Each tests a different story shape
and stops at the **script draft** stage (no TTS, no render), so running them costs nothing
but model time.

## How to run an eval

1. **Start a fresh agent** with only the skill loaded (a new Claude Code session in the kit
   folder, or a subagent), and send:

   ```
   You are being evaluated on the /data-video skill.
   Invoke it now with the query and files below. Stop after producing the script draft:
   do NOT call tts-clip.py, do NOT render anything.

   Query: <paste "query" from eval-N.json>
   File(s): <paste "files" from eval-N.json>
   ```

   Do not show it the rubric.

2. **Grade the output** by checking each item in `expected_behavior` against the agent's
   response. Each item is a binary pass/fail. Write results as:

   ```
   eval-1  hook_timing           PASS
   eval-1  series_shape_differs  FAIL  agent used BLUF again
   ```

3. **Acceptable score**: 11/13 or better per eval (12/14 for eval-1, which adds
   `population_caveat`). Any fail on `no_voicing_before_approval`, `script_in_code_fence`,
   or `three_poster_proposals` is an automatic block (hard rules from SKILL.md steps 4 and 5).

The `series_shape_differs` and `pivot_not_but` items assume the last two rows of
`references/series-log.md` used BLUF with a "แต่" pivot (the history these evals were
written against). With a different log, grade them against your own last two rows.

## Scenarios

| File | Shape | Pivot device | Key data |
|---|---|---|---|
| eval-1.json | Ranking countdown | Rank reveal at end | korat-clinic-districts.csv |
| eval-2.json | Before/after in time | Time contrast 2562 vs 2567 | korat-tourist-monthly.csv |
| eval-3.json | Guess-then-reveal | Viewer guesses, answer in 5 s | korat-school-enrollment.csv |

## Sample data

Files under `data/` are **invented for testing only** and marked `[SAMPLE DATA]` at the top
of each CSV. Do not use them in real content. A good run notices the label and says so.

| File | What it contains | Key computed values |
|---|---|---|
| korat-clinic-districts.csv | 16 districts, population, health center count | วังน้ำเขียว worst: 45,000÷3 = **15,000 people/center**; โนนไทย best: 52,000÷7 = **7,429** |
| korat-tourist-monthly.csv | Monthly visitors + revenue, 2562 and 2567 (Buddhist era) | 2562 total: **2,101,000**; 2567 total: **1,982,000**; change: **−119,000 (−5.7%)** |
| korat-school-enrollment.csv | Annual enrollment by level 2558–2567 | Total 2558: **265,000**; 2567: **225,500** (−15%); vocational **+30%**; primary **−23%** |

## Rubric categories

| Category | Items | Notes |
|---|---|---|
| **Hard blocks** | `no_voicing_before_approval`, `script_in_code_fence`, `three_poster_proposals` | Any fail = reject the run |
| **Series rotation** | `series_shape_differs`, `pivot_not_but` | Variety across a series |
| **Hook rules** | `hook_timing`, `question_answered_in_5s`, `hook_is_a_guess_prompt` | First-3-s contract, SKILL.md step 4 |
| **Number discipline** | `hero_number_count` | ≤ 3 hero numbers/min, SKILL.md step 5 |
| **Fact accuracy** | `*_correct` items | Recomputed from CSV; exact ranges given |
| **Evidence discipline** | `claims_inside_evidence` | No causes asserted without data |

## Run log

| Date | eval-1 | eval-2 | eval-3 | Notes |
|---|---|---|---|---|
| 2026-10-12 | 10/11 graded (3 ratio items n/a, ratio rightly declined) | 12/12 | 13/13 | Fresh top-model agents, rubric unseen. All three caught the SAMPLE label and flagged it. eval-1: line 1 was a contrast with no verdict (hook_timing FAIL); wrote 2 hooks instead of 5 and skipped the 3 written angles. The lint gave a false "บก" match across words (fixed) and underestimated length. Rubric fixed after this run: shape items no longer force one shape, posters may come after the script ok, eval-1 ratio items conditional. |
