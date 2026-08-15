import type { Question, ScoringRules, TestFormat } from "./types.js";

export interface CategoryBreakdown {
  categorySlug: string;
  correctCount: number;
  totalCount: number;
}

export interface ScoreResult {
  correctCount: number;
  totalCount: number;
  percent: number;
  passed: boolean;
  categoryBreakdown: CategoryBreakdown[];
  /** Present only when scoringRules.type === "mustPassSubset". */
  subsetResult?: {
    categorySlug: string;
    correctCount: number;
    requiredCorrectCount: number;
    totalCount: number;
    passed: boolean;
    /** True when the subset failure is what caused an otherwise-passing score to fail. */
    isDecisive: boolean;
  };
}

function isCorrect(question: Question, selectedIndex: number | null): boolean {
  return selectedIndex !== null && selectedIndex === question.correctAnswerIndex;
}

function buildCategoryBreakdown(
  questions: Question[],
  answers: Record<string, number | null>
): CategoryBreakdown[] {
  const bySlug = new Map<string, CategoryBreakdown>();
  for (const q of questions) {
    const entry = bySlug.get(q.categorySlug) ?? {
      categorySlug: q.categorySlug,
      correctCount: 0,
      totalCount: 0,
    };
    entry.totalCount += 1;
    if (isCorrect(q, answers[q.id] ?? null)) entry.correctCount += 1;
    bySlug.set(q.categorySlug, entry);
  }
  return [...bySlug.values()];
}

type Scorer = (
  questions: Question[],
  answers: Record<string, number | null>,
  testFormat: TestFormat,
  scoringRules: ScoringRules
) => ScoreResult;

const standardScorer: Scorer = (questions, answers, testFormat) => {
  const correctCount = questions.filter((q) => isCorrect(q, answers[q.id] ?? null)).length;
  const totalCount = questions.length;
  const percent = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  return {
    correctCount,
    totalCount,
    percent,
    passed: correctCount >= testFormat.passMarkCorrectCount,
    categoryBreakdown: buildCategoryBreakdown(questions, answers),
  };
};

const mustPassSubsetScorer: Scorer = (questions, answers, testFormat, scoringRules) => {
  const base = standardScorer(questions, answers, testFormat, scoringRules);
  if (scoringRules.type !== "mustPassSubset") return base;

  const subsetQuestions = questions.filter(
    (q) => q.categorySlug === scoringRules.subsetCategorySlug
  );
  const subsetCorrect = subsetQuestions.filter((q) => isCorrect(q, answers[q.id] ?? null)).length;
  const subsetPassed = subsetCorrect >= scoringRules.subsetRequiredCorrectCount;

  return {
    ...base,
    passed: base.passed && subsetPassed,
    subsetResult: {
      categorySlug: scoringRules.subsetCategorySlug,
      correctCount: subsetCorrect,
      requiredCorrectCount: scoringRules.subsetRequiredCorrectCount,
      totalCount: subsetQuestions.length,
      passed: subsetPassed,
      isDecisive: base.passed && !subsetPassed,
    },
  };
};

/**
 * Registry of scoring strategies keyed by ScoringRules.type. Adding a new
 * exam-scoring rule for a future country is a matter of adding an entry
 * here and a matching config.json — never a country-specific branch
 * elsewhere in site-generator or the UI layer.
 */
const SCORERS: Record<ScoringRules["type"], Scorer> = {
  standard: standardScorer,
  mustPassSubset: mustPassSubsetScorer,
};

export function scoreExam(
  questions: Question[],
  answers: Record<string, number | null>,
  testFormat: TestFormat,
  scoringRules: ScoringRules
): ScoreResult {
  const scorer = SCORERS[scoringRules.type];
  return scorer(questions, answers, testFormat, scoringRules);
}
