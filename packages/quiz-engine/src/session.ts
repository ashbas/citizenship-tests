import type { ExamSession, Question, TestFormat } from "./types.js";

export function createExamSession(questions: Question[], testFormat: TestFormat): ExamSession {
  return {
    questionIds: questions.map((q) => q.id),
    answers: Object.fromEntries(questions.map((q) => [q.id, null])),
    startedAt: Date.now(),
    timeLimitMinutes: testFormat.timeLimitMinutes,
  };
}

export function answerQuestion(
  session: ExamSession,
  questionId: string,
  selectedIndex: number
): ExamSession {
  return {
    ...session,
    answers: { ...session.answers, [questionId]: selectedIndex },
  };
}

export function remainingSeconds(session: ExamSession, now: number = Date.now()): number {
  const elapsedSeconds = (now - session.startedAt) / 1000;
  const limitSeconds = session.timeLimitMinutes * 60;
  return Math.max(0, Math.round(limitSeconds - elapsedSeconds));
}

export function isTimeExpired(session: ExamSession, now: number = Date.now()): boolean {
  return remainingSeconds(session, now) <= 0;
}

export function answeredCount(session: ExamSession): number {
  return Object.values(session.answers).filter((v) => v !== null).length;
}
