import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Category, Question, SiteConfig } from "@citizenship-tests/quiz-engine";

export interface SiteData {
  config: SiteConfig;
  questions: Question[];
  categories: Category[];
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`[site-generator] Invalid site data: ${message}`);
}

/**
 * Build-time loader for a site's data directory. Runs in Node (Astro
 * frontmatter), never shipped to the client. Validates just enough shape
 * to fail loudly on a malformed data file rather than shipping a broken
 * page — this is the one place that enforces the schema documented in the
 * root README, so every site (UK, AU, and future countries) is held to it
 * generically.
 */
export function loadSiteData(siteDir: string): SiteData {
  const config = readJson<SiteConfig>(join(siteDir, "config.json"));
  const questions = readJson<Question[]>(join(siteDir, "questions.json"));
  const categories = readJson<Category[]>(join(siteDir, "categories.json"));

  assert(config.countryCode, "config.json is missing countryCode");
  assert(config.domain, "config.json is missing domain");
  assert(config.testFormat?.questionsPerExam > 0, "config.json testFormat.questionsPerExam must be > 0");
  assert(Array.isArray(questions) && questions.length > 0, "questions.json must be a non-empty array");
  assert(Array.isArray(categories) && categories.length > 0, "categories.json must be a non-empty array");

  const categorySlugs = new Set(categories.map((c) => c.slug));
  for (const q of questions) {
    assert(categorySlugs.has(q.categorySlug), `question ${q.id} references unknown category "${q.categorySlug}"`);
    assert(
      q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.options.length,
      `question ${q.id} has an out-of-range correctAnswerIndex`
    );
  }

  if (config.testFormat.questionsPerExam > questions.length) {
    throw new Error(
      `[site-generator] Invalid site data: testFormat.questionsPerExam (${config.testFormat.questionsPerExam}) exceeds question pool size (${questions.length})`
    );
  }

  return { config, questions, categories };
}
