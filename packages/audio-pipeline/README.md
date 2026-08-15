# @citizenship-tests/audio-pipeline

Build-time script that turns each site's `questions.json` into static audio
files under that site's `public/audio/<country>/` directory, referenced by
each question's `audioFile` field.

## Usage

```bash
# from repo root, after `pnpm install` — each site exposes a thin wrapper
pnpm --filter @citizenship-tests/site-uk run audio
```

or invoke the CLI directly with an absolute `--site` path:

```bash
pnpm --filter @citizenship-tests/audio-pipeline run generate -- --site "$(pwd)/sites/uk"
```

Runs with the bundled `silence` provider by default (no credentials
required) — useful for verifying the pipeline runs end-to-end (file
generation, hashing, caching) and for local page-speed testing. **It is not
production audio**: it writes a valid, silent **WAV** file to the `.mp3`
path declared in `questions.json`'s `audioFile` field, so it will not
actually play back correctly in a browser — swap in a real provider (below)
before relying on in-browser playback. This tradeoff is deliberate: a
byte-accurate hand-rolled silent MP3 encoder isn't worth building for a
dev-only placeholder, and TTS provider choice is itself an open question
(see the root README).

For a real voice, set a provider and its credentials as build-time
environment variables (never commit these, never expose them to client
code):

```bash
TTS_PROVIDER=elevenlabs ELEVENLABS_API_KEY=... \
  pnpm --filter @citizenship-tests/audio-pipeline run generate -- --site "$(pwd)/sites/uk"
```

## Caching

A `.audio-manifest.json` file (not deployed — lives next to `questions.json`,
outside `public/`) records a hash of each question's text. Re-running the
script only regenerates audio for questions whose text changed since the
last run.

## Adding a provider

Implement `TtsProvider` (see `src/provider.ts`) in a new file under
`src/providers/`, register it in `src/registry.ts`. See
`src/providers/elevenlabs.ts` for a worked example. Provider choice (cost,
voice quality, redistribution licensing) is an open question — see the root
README.
