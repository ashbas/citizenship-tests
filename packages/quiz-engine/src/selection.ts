import type { Question, ScoringRules, TestFormat } from "./types.js";

function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selects the question set for a mock exam. Reads scoringRules generically:
 * a "mustPassSubset" config guarantees every question in the required
 * subset category is included (matching real exams like Australia's, where
 * all 5 "values" questions always appear), with the remainder filled
 * randomly from the rest of the pool. Any other scoring type falls back to
 * a plain random sample. No country-specific branching.
 */
export function selectExamQuestions(
  questions: Question[],
  testFormat: TestFormat,
  scoringRules: ScoringRules,
  rng: () => number = Math.random
): Question[] {
  const total = testFormat.questionsPerExam;

  if (scoringRules.type === "mustPassSubset") {
    const subset = questions.filter(
      (q) => q.categorySlug === scoringRules.subsetCategorySlug
    );
    const rest = questions.filter(
      (q) => q.categorySlug !== scoringRules.subsetCategorySlug
    );
    const remainingCount = Math.max(0, total - subset.length);
    const chosenRest = shuffle(rest, rng).slice(0, remainingCount);
    return shuffle([...subset, ...chosenRest], rng);
  }

  return shuffle(questions, rng).slice(0, total);
}
