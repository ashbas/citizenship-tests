import type { Question } from "@citizenship-tests/quiz-engine";

/**
 * FAQPage JSON-LD for a category page: each question/explanation pair
 * becomes one Q&A entry. Supports rich-result eligibility (Section 7).
 */
export function buildFaqPageSchema(questions: Question[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${q.options[q.correctAnswerIndex]}. ${q.explanation}`,
      },
    })),
  };
}

/**
 * Quiz JSON-LD (schema.org Quiz, via the LearningResource extension) for
 * the mock exam landing page.
 */
export function buildQuizSchema(params: {
  name: string;
  description: string;
  url: string;
  questionCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: params.name,
    description: params.description,
    url: params.url,
    about: { "@type": "Thing", name: "Citizenship test practice" },
    numberOfQuestions: params.questionCount,
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
