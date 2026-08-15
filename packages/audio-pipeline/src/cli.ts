#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { resolveProvider } from "./registry.js";
import { hashText, isUpToDate, loadManifest, saveManifest, type Manifest } from "./manifest.js";

interface QuestionLike {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  audioFile: string;
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = value;
    }
  }
  return args;
}

function answerAudioPath(audioFile: string): string {
  const lastDot = audioFile.lastIndexOf(".");
  if (lastDot === -1) return `${audioFile}-answer`;
  return `${audioFile.slice(0, lastDot)}-answer${audioFile.slice(lastDot)}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const siteDir = resolve(args.site ?? ".");
  const withAnswers = args["with-answers"] !== "false"; // on by default

  const questionsPath = join(siteDir, "questions.json");
  const questions: QuestionLike[] = JSON.parse(readFileSync(questionsPath, "utf-8"));

  const provider = resolveProvider(args.provider);
  const manifestPath = join(siteDir, ".audio-manifest.json");
  const manifest: Manifest = loadManifest(manifestPath);

  let generated = 0;
  let skipped = 0;

  for (const q of questions) {
    const correctText = q.options[q.correctAnswerIndex];
    const jobs: Array<{ key: string; text: string; relPath: string }> = [
      { key: q.id, text: q.question, relPath: q.audioFile },
    ];
    if (withAnswers) {
      jobs.push({
        key: `${q.id}-answer`,
        text: `Correct answer: ${correctText}.`,
        relPath: answerAudioPath(q.audioFile),
      });
    }

    for (const job of jobs) {
      const hash = hashText(job.text);
      if (isUpToDate(manifest, job.key, hash)) {
        skipped++;
        continue;
      }

      const outPath = join(siteDir, "public", job.relPath);
      mkdirSync(dirname(outPath), { recursive: true });
      const audio = await provider.synthesize(job.text);
      writeFileSync(outPath, audio);
      manifest[job.key] = { hash, file: job.relPath };
      generated++;
    }
  }

  saveManifest(manifestPath, manifest);
  console.log(
    `[audio-pipeline] provider=${provider.id} generated=${generated} skipped(cached)=${skipped} total_questions=${questions.length}`
  );
}

main().catch((err) => {
  console.error("[audio-pipeline] failed:", err);
  process.exit(1);
});
