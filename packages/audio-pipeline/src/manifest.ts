import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface ManifestEntry {
  hash: string;
  file: string;
}

export type Manifest = Record<string, ManifestEntry>;

export function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function loadManifest(path: string): Manifest {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as Manifest;
  } catch {
    return {};
  }
}

export function saveManifest(path: string, manifest: Manifest): void {
  writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

/** True when the cached entry for this id already matches the current text hash. */
export function isUpToDate(manifest: Manifest, id: string, currentHash: string): boolean {
  return manifest[id]?.hash === currentHash;
}
