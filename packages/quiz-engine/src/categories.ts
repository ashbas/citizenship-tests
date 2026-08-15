import type { Category, Question } from "./types.js";

export interface CategoryWithCount extends Category {
  questionCount: number;
}

export function withQuestionCounts(
  categories: Category[],
  questions: Question[]
): CategoryWithCount[] {
  const counts = new Map<string, number>();
  for (const q of questions) {
    counts.set(q.categorySlug, (counts.get(q.categorySlug) ?? 0) + 1);
  }
  return categories.map((c) => ({ ...c, questionCount: counts.get(c.slug) ?? 0 }));
}

export function questionsForCategory(questions: Question[], categorySlug: string): Question[] {
  return questions.filter((q) => q.categorySlug === categorySlug);
}

/**
 * Category slugs where the learner scored below `threshold` — used by the
 * results page to link back to "review these topics" (Section 7: internal
 * linking from results to missed categories).
 */
export function weakCategorySlugs(
  breakdown: { categorySlug: string; correctCount: number; totalCount: number }[],
  threshold = 0.6
): string[] {
  return breakdown
    .filter((b) => b.totalCount > 0 && b.correctCount / b.totalCount < threshold)
    .map((b) => b.categorySlug);
}
