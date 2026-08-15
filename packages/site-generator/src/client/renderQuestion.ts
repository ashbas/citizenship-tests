import type { Question } from "@citizenship-tests/quiz-engine";

/** Builds an <audio> element identical in markup/behavior to ui-components/AudioPlayer.astro. */
function renderAudio(question: Question): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "question-card__audio";
  const audio = document.createElement("audio");
  audio.className = "audio-player";
  audio.controls = true;
  audio.preload = "none";
  audio.setAttribute("aria-label", "Listen to this question");
  const source = document.createElement("source");
  source.src = question.audioFile;
  audio.appendChild(source);
  wrap.appendChild(audio);
  return wrap;
}

function renderOptions(question: Question): { list: HTMLElement; buttons: HTMLButtonElement[] } {
  const list = document.createElement("div");
  list.className = "question-card__options";
  const buttons: HTMLButtonElement[] = [];

  question.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.dataset.optionIndex = String(index);
    btn.setAttribute("aria-pressed", "false");

    const marker = document.createElement("span");
    marker.className = "option-btn__marker";
    marker.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent = option;

    btn.append(marker, label);
    list.appendChild(btn);
    buttons.push(btn);
  });

  return { list, buttons };
}

/**
 * Renders one exam-mode question: selectable options, no immediate
 * correctness reveal. Dispatches a bubbling "question-answered" event
 * (matching QuestionCard.astro's contract) on selection so a surrounding
 * controller can track answers without this module knowing about exam
 * state itself.
 */
export function renderExamQuestion(question: Question, position: number): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "question-card";
  li.dataset.questionId = question.id;

  const head = document.createElement("div");
  head.className = "question-card__head";
  const number = document.createElement("span");
  number.className = "question-card__number";
  number.textContent = `Q${position}`;
  const text = document.createElement("p");
  text.className = "question-card__text";
  text.textContent = question.question;
  head.append(number, text);

  const { list, buttons } = renderOptions(question);
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      li.dispatchEvent(
        new CustomEvent("question-answered", {
          bubbles: true,
          detail: { questionId: question.id, selectedIndex: index },
        })
      );
    });
  });

  li.append(head, list, renderAudio(question));
  return li;
}

/**
 * Renders one review-mode question for the results page: shows the user's
 * answer, the correct answer, and the explanation — no interaction.
 */
export function renderReviewQuestion(
  question: Question,
  selectedIndex: number | null,
  categoryHref: string
): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "question-card";

  const head = document.createElement("div");
  head.className = "question-card__head";
  const text = document.createElement("p");
  text.className = "question-card__text";
  text.textContent = question.question;
  head.appendChild(text);

  const { list, buttons } = renderOptions(question);
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === question.correctAnswerIndex) btn.classList.add("is-correct");
    if (index === selectedIndex && selectedIndex !== question.correctAnswerIndex) {
      btn.classList.add("is-incorrect");
    }
    if (index === selectedIndex) btn.setAttribute("aria-pressed", "true");
  });

  const feedback = document.createElement("div");
  feedback.className = "question-card__feedback";

  const resultText = document.createElement("p");
  resultText.className = "question-card__result";
  resultText.textContent =
    selectedIndex === null
      ? "You didn't answer this question."
      : selectedIndex === question.correctAnswerIndex
        ? "Correct!"
        : `Not quite — the correct answer is: ${question.options[question.correctAnswerIndex]}`;

  const explanation = document.createElement("p");
  explanation.className = "question-card__explanation";
  explanation.textContent = question.explanation;

  const source = document.createElement("p");
  source.className = "muted question-card__source";
  const sourceLabel = document.createTextNode(`Source: ${question.sourceReference} · `);
  const link = document.createElement("a");
  link.href = categoryHref;
  link.textContent = "Review this category";
  source.append(sourceLabel, link);

  feedback.append(resultText, explanation, source);
  li.append(head, list, feedback, renderAudio(question));
  return li;
}
