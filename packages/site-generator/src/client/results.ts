import {
  scoreExam,
  weakCategorySlugs,
  type Category,
  type Question,
  type ScoringRules,
  type TestFormat,
} from "@citizenship-tests/quiz-engine";
import { renderReviewQuestion } from "./renderQuestion.js";
import { EXAM_RESULT_STORAGE_KEY, type StoredExamResult } from "./exam.js";

interface ResultsPayload {
  questions: Question[];
  categories: Category[];
  testFormat: TestFormat;
  scoringRules: ScoringRules;
}

export function initResults(): void {
  const dataEl = document.getElementById("results-data");
  const summaryEl = document.querySelector<HTMLElement>("[data-results-summary]");
  const emptyEl = document.querySelector<HTMLElement>("[data-results-empty]");
  if (!dataEl || !summaryEl || !emptyEl) return;

  const stored = sessionStorage.getItem(EXAM_RESULT_STORAGE_KEY);
  if (!stored) {
    emptyEl.hidden = false;
    return;
  }

  const result: StoredExamResult = JSON.parse(stored);
  const payload: ResultsPayload = JSON.parse(dataEl.textContent ?? "{}");

  const byId = new Map(payload.questions.map((q) => [q.id, q]));
  const examQuestions = result.questionIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));

  if (examQuestions.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  const score = scoreExam(examQuestions, result.answers, payload.testFormat, payload.scoringRules);

  summaryEl.hidden = false;

  const badge = summaryEl.querySelector<HTMLElement>("[data-results-pass-badge]");
  if (badge) {
    badge.textContent = score.passed ? "PASS" : "FAIL";
    badge.classList.toggle("badge-success", score.passed);
    badge.classList.toggle("badge-danger", !score.passed);
  }
  const scoreEl = summaryEl.querySelector("[data-results-score]");
  const totalEl = summaryEl.querySelector("[data-results-total]");
  const percentEl = summaryEl.querySelector("[data-results-percent]");
  const passMarkEl = summaryEl.querySelector("[data-results-pass-mark]");
  if (scoreEl) scoreEl.textContent = String(score.correctCount);
  if (totalEl) totalEl.textContent = String(score.totalCount);
  if (percentEl) percentEl.textContent = String(score.percent);
  if (passMarkEl) {
    passMarkEl.textContent = `Pass mark: ${payload.testFormat.passMarkCorrectCount}/${payload.testFormat.questionsPerExam} (${payload.testFormat.passMarkPercent}%)`;
  }

  const subsetBlock = summaryEl.querySelector<HTMLElement>("[data-results-subset]");
  if (subsetBlock && score.subsetResult) {
    subsetBlock.hidden = false;
    subsetBlock.dataset.passed = String(score.subsetResult.passed);
    const headline = subsetBlock.querySelector("[data-results-subset-headline]");
    const detail = subsetBlock.querySelector("[data-results-subset-detail]");
    if (headline) {
      headline.textContent = score.subsetResult.passed
        ? `You answered all ${score.subsetResult.requiredCorrectCount} required "${score.subsetResult.categorySlug}" questions correctly.`
        : `You only answered ${score.subsetResult.correctCount}/${score.subsetResult.totalCount} "${score.subsetResult.categorySlug}" questions correctly.`;
    }
    if (detail && score.subsetResult.isDecisive) {
      detail.textContent = `The real exam requires all ${score.subsetResult.requiredCorrectCount} of these correct regardless of your overall score — so this attempt would be a FAIL under the real test rules.`;
    }
  }

  // Topics to review.
  const weakSlugs = weakCategorySlugs(score.categoryBreakdown);
  const weakSection = document.querySelector<HTMLElement>("[data-results-weak-categories]");
  const weakList = document.querySelector<HTMLElement>("[data-results-weak-list]");
  if (weakSlugs.length > 0 && weakSection && weakList) {
    weakSection.hidden = false;
    const categoriesBySlug = new Map(payload.categories.map((c) => [c.slug, c]));
    weakSlugs.forEach((slug) => {
      const category = categoriesBySlug.get(slug);
      if (!category) return;
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `/categories/${slug}`;
      link.textContent = `Review ${category.name} questions →`;
      li.appendChild(link);
      weakList.appendChild(li);
    });
  }

  // Full answer review, in the order the exam was taken.
  const reviewList = document.querySelector<HTMLElement>("[data-results-review]");
  if (reviewList) {
    examQuestions.forEach((q) => {
      const selected = result.answers[q.id] ?? null;
      reviewList.appendChild(renderReviewQuestion(q, selected, `/categories/${q.categorySlug}`));
    });
  }
}
