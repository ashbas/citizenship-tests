# Australia site — Phase 2 (not yet built)

Per the phase plan, Phase 1 delivers the shared engine plus the UK site only.
This directory is a placeholder so the monorepo's intended shape (`/sites/uk`,
`/sites/australia`, ...) is visible, and so Phase 2 has an obvious place to
start — but it deliberately contains no code or content yet.

## What Phase 2 actually involves

The Australian citizenship test's scoring rule — you must answer all 5 of the
20 "Australian values" questions correctly, regardless of your overall score,
or the attempt fails — is exactly the case the shared packages were designed
around from the start:

- `@citizenship-tests/quiz-engine`'s scoring registry (`packages/quiz-engine/src/scoring.ts`)
  already implements a generic `"mustPassSubset"` strategy, driven entirely by
  `config.json`'s `scoringRules` block (see the example in the root README).
  No AU-specific code exists anywhere in `/packages`.
- `selectExamQuestions` (`packages/quiz-engine/src/selection.ts`) already
  guarantees every question in a `mustPassSubset` category is included in
  the generated exam, generically.

So Phase 2 should, per the repo's design rule, be achievable as:

```bash
tools/new-site-scaffold.sh australia AU "Australian Citizenship Test Practice" https://example-au-domain.com
```

...followed by populating `sites/australia/config.json` (with
`scoringRules.type: "mustPassSubset"`), `categories.json`, and an original
`questions.json` covering the official "Our Common Bond" test content —
i.e. a data/config task, not a `/packages` code change. If it turns out to
need more than that, that's the signal (per the root README's design rule)
that the packages/site-generator abstraction needs fixing before Phase 3.
