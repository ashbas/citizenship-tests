#!/usr/bin/env bash
# Builds every site under /sites that has its own package.json (i.e. is
# actually implemented — placeholder country folders like /sites/australia
# in early phases are skipped automatically).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

built=()
skipped=()

for site_dir in sites/*/; do
  slug="$(basename "$site_dir")"
  if [ ! -f "${site_dir}package.json" ]; then
    skipped+=("$slug")
    continue
  fi

  pkg_name="$(node -p "require('./${site_dir}package.json').name")"
  echo "==> Building $slug ($pkg_name)"
  pnpm --filter "$pkg_name" build
  built+=("$slug")
done

echo
echo "Built: ${built[*]:-none}"
echo "Skipped (no package.json yet): ${skipped[*]:-none}"
