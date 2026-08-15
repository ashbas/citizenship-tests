/**
 * Shared data shapes. These mirror the JSON files each site authors under
 * /sites/<country>/{config,questions,categories}.json — see root README.
 */

export interface Question {
  id: string;
  categorySlug: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceReference: string;
  audioFile: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  sourceChapter: string;
}

export interface OfficialSource {
  name: string;
  url: string;
  handbookName?: string;
}

export interface TestFormat {
  totalQuestionsInPool: number | null;
  questionsPerExam: number;
  timeLimitMinutes: number;
  passMarkPercent: number;
  passMarkCorrectCount: number;
}

export type ScoringRules =
  | { type: "standard" }
  | {
      type: "mustPassSubset";
      subsetCategorySlug: string;
      subsetRequiredCorrectCount: number;
      subsetTotalCount: number;
      note?: string;
    };

export interface SiteConfig {
  countryCode: string;
  siteName: string;
  domain: string;
  officialSource: OfficialSource;
  testFormat: TestFormat;
  scoringRules: ScoringRules;
  regionalVariants?: string[];
  disclaimer: string;
  /** Google AdSense publisher ID (e.g. "pub-1234567890123456"), used to generate ads.txt at build time. */
  adsensePublisherId?: string;
}

export interface Answer {
  questionId: string;
  selectedIndex: number | null;
}

export interface ExamSession {
  questionIds: string[];
  answers: Record<string, number | null>;
  startedAt: number;
  timeLimitMinutes: number;
}
