# citizenship-tests

Monorepo for free, AdSense-monetized citizenship/civics test practice sites — a
shared static-site engine plus one deployable site per country. Revenue is
exclusively via Google AdSense: no accounts, no paywalls, no subscriptions.

Canada (`canadacitizenshiptestpractice.ca`) already exists as a standalone
site and is **out of scope** — nothing here touches it.

**Status: Phase 1 and Phase 2 complete (shared engine + UK site + Australia
site).** US and NZ are deferred to later phases, per the phase plan.

## Repo structure

```
/packages
  /quiz-engine       Framework-agnostic exam logic: question selection, scoring
                      (registry-based — "standard" and "mustPassSubset"), exam
                      session state, category helpers. No DOM, no country logic.
  /seo-utils         Sitemap/robots.txt/ads.txt builders, JSON-LD (FAQPage/Quiz/
                      Breadcrumb) builders, meta tag builder.
  /audio-pipeline    Build-time TTS script: questions.json -> static audio files,
                      with a pluggable provider interface and hash-based caching.
  /ui-components     Shared Astro components: Header, Footer, QuestionCard,
                      ResultsSummary, CategoryNav, ProgressIndicator, AudioPlayer,
                      OfficialSourceCallout, CookieConsentBanner, AdSlot.
  /site-generator    Shared Astro layouts (category index/page, mock exam,
                      results) + build-time data loader/validator + the
                      client-side controllers that drive the exam/results flow.
/sites
  /uk                Live: config.json, categories.json, questions.json (42
                      original questions across 7 categories), content/, and a
                      thin Astro app that wires the shared packages together.
                      Uses "standard" scoring.
  /australia         Live: 25 original questions across 5 categories, using
                      "mustPassSubset" scoring (see below) — the site that
                      validated the Phase 1 abstraction. Required zero
                      changes to /packages to build.
/tools
  build-all.sh         Builds every /sites/* project that has its own package.json.
  new-site-scaffold.sh Scaffolds a new /sites/<country> from the UK site's
                        (fully generic) structural files.
```

**Design rule:** nothing country-specific lives in `/packages`. If a future
country needs a `/packages` change beyond adding generic, config-driven
behavior, that's a signal the abstraction is wrong and should be fixed before
adding more countries. This was validated, not just asserted: building the
Australia site (`mustPassSubset` scoring — 5 of 20 "values" questions must
*all* be correct, regardless of overall score) touched zero files under
`/packages`. One real bug surfaced along the way and was fixed generically
rather than special-cased: the results page originally showed the raw
category slug (`"australian-values"`) in the subset callout instead of its
display name — fixed in `site-generator/src/client/results.ts` by looking up
the category name from the already-available category list, which benefits
any future `mustPassSubset` site equally.

## Tech stack

- **Astro** (static output, islands architecture) — chosen over an SPA
  framework so non-interactive pages (category/reference pages) ship as
  crawlable HTML with ~zero client JS, while the mock exam is a small
  vanilla-JS island (no React/Vue runtime shipped).
- **Plain CSS** (`packages/ui-components/src/styles/base.css`), not Tailwind.
  The spec allows either; plain CSS was chosen to keep the dependency
  footprint and build pipeline minimal — this is a judgment call, easy to
  revisit if a future site wants Tailwind's authoring speed.
- **pnpm workspaces** for the monorepo.
- Audio: pre-generated static files only, produced by `audio-pipeline` at
  build time. No runtime TTS calls, no API keys anywhere near client code.

## Data schema

Each site owns three JSON files at its root — see `sites/uk/*.json` for a
populated example, or run `tools/new-site-scaffold.sh` for stub versions:

- `config.json` — domain, official source links, exam format, scoring rules,
  disclaimer, AdSense publisher ID.
- `categories.json` — topic list with slug/name/description/source chapter.
- `questions.json` — the question bank. Every question has an original
  written explanation and a `sourceReference`, not just a bare answer key
  (this is both an AdSense thin-content mitigation and the site's actual
  value-add over a bare question dump).

`packages/site-generator`'s `loadSiteData()` validates this shape at build
time (unknown category references, out-of-range `correctAnswerIndex`, an
exam size larger than the question pool, etc. all fail the build loudly
rather than shipping a broken page).

### Scoring rules are data, not code

```json
"scoringRules": { "type": "standard" }
```

or, for a test with a mandatory subset (like Australia's):

```json
"scoringRules": {
  "type": "mustPassSubset",
  "subsetCategorySlug": "australian-values",
  "subsetRequiredCorrectCount": 5,
  "subsetTotalCount": 5
}
```

`quiz-engine`'s scoring registry (`packages/quiz-engine/src/scoring.ts`)
picks the right strategy by `type` at runtime — no per-country branching
anywhere else in the codebase.

## Running a site

```bash
pnpm install
pnpm --filter @citizenship-tests/site-uk dev              # local dev server
pnpm --filter @citizenship-tests/site-uk build             # static build -> sites/uk/dist
pnpm --filter @citizenship-tests/site-uk run audio         # generate static audio files

pnpm --filter @citizenship-tests/site-australia dev        # same commands, any site
pnpm --filter @citizenship-tests/site-australia build
pnpm --filter @citizenship-tests/site-australia run audio
```

Or, from the root: `pnpm build:uk`, `pnpm dev:uk`, `bash tools/build-all.sh`
(builds every site under `/sites` that has a `package.json` — a future
placeholder country is skipped automatically until it's scaffolded, the way
Australia was during Phase 1).

Typecheck everything with `pnpm -r --if-present typecheck` (runs `tsc
--noEmit` in each package and `astro check` in each site).

### How the mock exam works without a server

The site is fully static — no server, no database. The mock exam page
embeds the full question bank as JSON, randomizes a question set client-side
(`selectExamQuestions`), and on submit stores just the question IDs + answers
in `sessionStorage` before navigating to `/results`, which re-scores from the
same embedded data. Nothing is ever sent off-device. `localStorage`-based
"resume my exam" was flagged in the spec as a nice-to-have and was **not**
built in Phase 1 — the current session-storage handoff only survives a
same-tab navigation, not a closed tab.

## Adding a new country

```bash
tools/new-site-scaffold.sh <slug> <countryCode> "<Site Name>" <domain>
# e.g. tools/new-site-scaffold.sh newzealand NZ "NZ Citizenship Test Practice" https://example-nz-domain.com
```

This copies the UK site's structural files (all genuinely generic — no
UK-specific logic lives in `sites/uk/src/`) and writes stub
`config.json`/`categories.json`/`questions.json`. What's left is a
data/config task: fill in real categories and original questions, review the
one or two spots of site-specific homepage copy the script flags, then
`pnpm install && pnpm --filter @citizenship-tests/site-<slug> build`. This is
exactly how `sites/australia` was built in Phase 2 — see its `config.json`
for a populated `mustPassSubset` example.

## Known limitations / open questions

Carried over from the original spec, plus decisions made while building
Phase 1 and Phase 2:

- **TTS provider**: unresolved. `audio-pipeline` ships a zero-cost `silence`
  placeholder provider (silent WAV files, so the pipeline, caching, and
  wiring are fully testable without credentials) and a worked
  `elevenlabs`-based example provider behind an env var. **The bundled
  placeholder is not production audio** — see
  `packages/audio-pipeline/README.md` for the specific caveat (it writes to
  the `.mp3` path `questions.json` declares, since that's what a real
  provider will produce, so placeholder audio won't play back correctly in
  a browser until a real provider is configured). Evaluate cost/voice
  quality/redistribution licensing before launch.
- **Domain names**: both sites' `config.json` `domain` fields are placeholders
  (`https://example-uk-domain.com`, `https://example-au-domain.com`), as is
  `adsensePublisherId` (`pub-0000000000000000`) on both. These need to be
  swapped for real values before launch — everything (canonical URLs,
  sitemap, robots.txt, ads.txt) is generated from `config.json`, so this is
  a one-line change per site.
- **Cookie consent**: implemented as a small custom banner
  (`ui-components/CookieConsentBanner.astro`) rather than a third-party CMP
  script, to avoid a render-blocking third-party dependency. Revisit if a
  target market's compliance needs outgrow it.
- **Question bank size**: UK ships 42 original questions across 7 categories
  (6 each); Australia ships 25 across 5 categories (5 each, including the
  full mandatory "Australian Values" set). Both are Phase-appropriate seed
  sets — enough to validate the full pipeline (category browsing, weighted
  mock exam sampling, audio, scoring) end to end, but smaller than a
  production-ready bank should be before real launch/AdSense review.

## Verification performed

- `pnpm -r --if-present typecheck` — clean across all packages and both
  sites (`astro check`: 0 errors/warnings/hints each).
- `pnpm --filter @citizenship-tests/site-uk build` and
  `pnpm --filter @citizenship-tests/site-australia build` — both succeed;
  `bash tools/build-all.sh` builds both from the root in one pass.
- End-to-end browser tests (Playwright):
  - UK: practice-mode reveal on a category page, a full 24-question mock
    exam run (mixed correct/incorrect answers), submit, and results-page
    scoring/review — reported score matches the expected count exactly, all
    24 answers render in the review, zero console errors.
  - Australia: confirmed all 5 "Australian Values" questions are included
    in every generated exam (not just a random subset); confirmed a
    20/20-but-one-values-question-wrong attempt is correctly reported as a
    **FAIL** with the decisive-subset callout, and a fully-correct attempt
    as a **PASS** — this is the scenario the spec calls out as a genuine
    differentiator (section 6.3), verified end to end rather than assumed.
- Lighthouse (performance category only, local `astro preview`): 100/100 on
  a UK category page (LCP 0.7s), the UK mock exam page (LCP 1.0s), and an
  AU category page (LCP 0.7s) — comfortably under the spec's <1.5s LCP
  target.
- `tools/new-site-scaffold.sh` and `tools/build-all.sh` were exercised twice:
  once against a throwaway scaffolded site (confirming a fresh scaffold
  builds out of the box and `build-all.sh` skips unimplemented
  placeholders), and once for real to produce the actual Australia site.
