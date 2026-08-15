import {
  answerQuestion,
  createExamSession,
  isTimeExpired,
  remainingSeconds,
  selectExamQuestions,
  type Question,
  type ScoringRules,
  type TestFormat,
} from "@citizenship-tests/quiz-engine";
import { renderExamQuestion } from "./renderQuestion.js";
import { withBase } from "@citizenship-tests/ui-components/base";

export const EXAM_RESULT_STORAGE_KEY = "citizenship-test:last-exam-result";

export interface StoredExamResult {
  questionIds: string[];
  answers: Record<string, number | null>;
  completedAt: number;
  timedOut: boolean;
}

interface ExamPayload {
  questions: Question[];
  testFormat: TestFormat;
  scoringRules: ScoringRules;
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function initMockExam(): void {
  const dataEl = document.getElementById("exam-data");
  const introEl = document.querySelector<HTMLElement>("[data-exam-intro]");
  const rootEl = document.querySelector<HTMLElement>("[data-exam-root]");
  const startBtn = document.querySelector<HTMLButtonElement>("[data-exam-start]");
  const submitBtn = document.querySelector<HTMLButtonElement>("[data-exam-submit]");
  const questionsEl = document.querySelector<HTMLElement>("[data-exam-questions]");
  const timerEl = document.querySelector<HTMLElement>("[data-exam-timer]");
  const progressFill = document.querySelector<HTMLElement>("[data-progress-fill]");
  const progressLabel = document.querySelector<HTMLElement>("[data-progress-label]");

  if (!dataEl || !introEl || !rootEl || !startBtn || !submitBtn || !questionsEl) return;

  const payload: ExamPayload = JSON.parse(dataEl.textContent ?? "{}");
  let session = createExamSession([], payload.testFormat);
  let examQuestions: Question[] = [];
  let timerInterval: ReturnType<typeof setInterval> | undefined;

  const updateProgress = () => {
    const answered = Object.values(session.answers).filter((v) => v !== null).length;
    const total = examQuestions.length;
    if (progressFill) progressFill.style.width = `${(answered / total) * 100}%`;
    if (progressLabel) progressLabel.textContent = `${answered} of ${total} answered`;
    submitBtn.disabled = answered < total;
  };

  const submit = (timedOut: boolean) => {
    if (timerInterval) clearInterval(timerInterval);
    const result: StoredExamResult = {
      questionIds: examQuestions.map((q) => q.id),
      answers: session.answers,
      completedAt: Date.now(),
      timedOut,
    };
    sessionStorage.setItem(EXAM_RESULT_STORAGE_KEY, JSON.stringify(result));
    window.location.href = withBase("/results");
  };

  const updateTimer = () => {
    const remaining = remainingSeconds(session);
    if (timerEl) timerEl.textContent = `Time remaining: ${formatSeconds(remaining)}`;
    if (isTimeExpired(session)) {
      submit(true);
    }
  };

  startBtn.addEventListener("click", () => {
    examQuestions = selectExamQuestions(payload.questions, payload.testFormat, payload.scoringRules);
    session = createExamSession(examQuestions, payload.testFormat);

    questionsEl.innerHTML = "";
    examQuestions.forEach((q, index) => {
      questionsEl.appendChild(renderExamQuestion(q, index + 1));
    });

    introEl.hidden = true;
    rootEl.hidden = false;
    updateProgress();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  });

  questionsEl.addEventListener("question-answered", (event) => {
    const { questionId, selectedIndex } = (event as CustomEvent).detail;
    session = answerQuestion(session, questionId, selectedIndex);
    updateProgress();
  });

  submitBtn.addEventListener("click", () => submit(false));
}
