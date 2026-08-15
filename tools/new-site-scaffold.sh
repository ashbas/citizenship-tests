#!/usr/bin/env bash
# Scaffolds a new /sites/<slug> from the UK site's reusable structure.
#
# The UK site's src/pages/*.astro files are already fully generic — they
# load data via @citizenship-tests/site-generator and render shared
# layouts/components, with no UK-specific logic. So the reference site
# doubles as the scaffold template: this script copies its structural
# files verbatim and replaces only config.json/categories.json/
# questions.json with minimal stubs plus a couple of obviously
# country-specific strings, per the monorepo's design rule that adding a
# country should be primarily a data/config task.
#
# Usage: tools/new-site-scaffold.sh <slug> <countryCode> "<Site Name>" <domain>
# Example: tools/new-site-scaffold.sh australia AU "Australian Citizenship Test Practice" https://example-au-domain.com
set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <slug> <countryCode> \"<Site Name>\" <domain>" >&2
  exit 1
fi

SLUG="$1"
COUNTRY_CODE="$2"
SITE_NAME="$3"
DOMAIN="$4"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_SITE="$ROOT_DIR/sites/uk"
DEST_SITE="$ROOT_DIR/sites/$SLUG"

if [ -e "$DEST_SITE" ]; then
  echo "sites/$SLUG already exists — aborting." >&2
  exit 1
fi

mkdir -p "$DEST_SITE"

# Copy structural (non-content) files: package.json, astro config/tsconfig,
# and the entirely generic src/ tree — but not the UK's data files or
# content notes. Uses `git ls-files` (rather than a recursive copy with
# manual excludes) so build artifacts and node_modules — already
# gitignored — are never considered in the first place.
cd "$SRC_SITE"
git ls-files \
  | grep -v -E '^(config\.json|categories\.json|questions\.json)$' \
  | grep -v '^content/' \
  | while read -r file; do
      mkdir -p "$DEST_SITE/$(dirname "$file")"
      cp "$file" "$DEST_SITE/$file"
    done
cd "$ROOT_DIR"

# Package name + reference to the new site.
node -e "
  const fs = require('fs');
  const path = '$DEST_SITE/package.json';
  const pkg = JSON.parse(fs.readFileSync(path, 'utf-8'));
  pkg.name = '@citizenship-tests/site-$SLUG';
  pkg.scripts.audio = pkg.scripts.audio.replace(/sites\/uk/g, 'sites/$SLUG');
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
"

mkdir -p "$DEST_SITE/content"
cat > "$DEST_SITE/content/README.md" <<EOF
Reserved for long-form supporting content specific to this site. See
sites/uk/content/README.md for the pattern used there.
EOF

cat > "$DEST_SITE/config.json" <<EOF
{
  "countryCode": "$COUNTRY_CODE",
  "siteName": "$SITE_NAME",
  "domain": "$DOMAIN",
  "officialSource": {
    "name": "TODO: official government source name",
    "url": "https://example.gov/TODO",
    "handbookName": "TODO: official handbook/guide name, if any"
  },
  "testFormat": {
    "totalQuestionsInPool": null,
    "questionsPerExam": 1,
    "timeLimitMinutes": 45,
    "passMarkPercent": 100,
    "passMarkCorrectCount": 1
  },
  "scoringRules": {
    "type": "standard"
  },
  "disclaimer": "This is an independent, unofficial practice resource. Always verify against the official source before your test.",
  "adsensePublisherId": "pub-0000000000000000"
}
EOF

cat > "$DEST_SITE/categories.json" <<EOF
[
  {
    "slug": "example-category",
    "name": "TODO: Example Category",
    "description": "TODO: short description of this topic area.",
    "sourceChapter": "TODO: chapter/section reference"
  }
]
EOF

cat > "$DEST_SITE/questions.json" <<EOF
[
  {
    "id": "$SLUG-001",
    "categorySlug": "example-category",
    "question": "TODO: write an original practice question here.",
    "options": ["TODO option A", "TODO option B", "TODO option C", "TODO option D"],
    "correctAnswerIndex": 0,
    "explanation": "TODO: explain why the correct answer is correct.",
    "sourceReference": "TODO: chapter/section reference",
    "audioFile": "/audio/$SLUG/$SLUG-001.mp3"
  }
]
EOF

# The homepage copy is the one genuinely site-specific string left in the
# generic page templates — flag it rather than guess at good marketing copy.
grep -rl "Life in the UK" "$DEST_SITE/src" | while read -r file; do
  echo "TODO: review site-specific copy in ${file#"$ROOT_DIR"/}"
done

cat <<EOF

Scaffolded sites/$SLUG.

Next steps (a data/config task, not a code task — see design rule in the root README):
  1. Add "sites/$SLUG" as a workspace member automatically picked up by pnpm-workspace.yaml (no action needed).
  2. Fill in sites/$SLUG/config.json, categories.json, and questions.json with real content.
  3. Replace the placeholder homepage copy in sites/$SLUG/src/pages/index.astro.
  4. Run: pnpm install && pnpm --filter @citizenship-tests/site-$SLUG build
  5. Run: pnpm --filter @citizenship-tests/site-$SLUG run audio
EOF
