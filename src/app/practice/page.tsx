"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SideChat } from "@/components/SideChat";
import { VoiceMenu } from "@/components/VoiceMenu";
import { useOnboardingStore } from "@/lib/hooks";
import { questionsForExam } from "@/lib/questions";
import { addXp, bumpStreak } from "@/lib/storage";
import type { ExamId, PracticeQuestion } from "@/lib/types";

function PracticeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const examParam = params.get("exam") as ExamId | null;
  const profile = useOnboardingStore();
  const examId = examParam ?? profile.examId ?? "sat";

  const questions = useMemo(() => questionsForExam(examId), [examId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showWhy, setShowWhy] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streak, setStreak] = useState(1);

  const question: PracticeQuestion | undefined = questions[index];
  const selected = answers[index] ?? null;
  const answered = selected !== null;
  const isCorrect =
    selected !== null &&
    question !== undefined &&
    selected === question.correctIndex;
  const correctCount = questions.reduce((count, item, i) => {
    return answers[i] === item.correctIndex ? count + 1 : count;
  }, 0);
  const progressPct = ((index + (answered ? 1 : 0.35)) / questions.length) * 100;
  const isLast = index >= questions.length - 1;

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [index]: optionIndex }));
  }

  function handleBack() {
    if (index <= 0) return;
    setIndex((value) => value - 1);
    setShowWhy(false);
  }

  function handleNext() {
    if (!answered) return;

    if (isLast) {
      const sessionXp = Math.max(10, correctCount * 10 + 10);
      addXp(sessionXp);
      setEarnedXp(sessionXp);
      setStreak(bumpStreak());
      setDone(true);
      return;
    }

    setIndex((value) => value + 1);
    setShowWhy(false);
  }

  if (done) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[linear-gradient(180deg,#f7f3f5_0%,#f0f6ef_100%)]">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="animate-float mb-8 grid h-28 w-28 place-items-center rounded-[2rem] bg-[#ce82ff]">
            <div className="h-14 w-5 rounded-full bg-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
            Practice complete!
          </h1>
          <p className="mt-3 text-xl font-bold text-[var(--muted)]">
            Nice — let&apos;s keep the momentum going
          </p>
          <div className="mt-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em]">Total XP</p>
            <p className="mt-2 text-6xl font-black">
              {earnedXp}
              <span className="ml-2 text-[var(--brand)]">✦</span>
            </p>
            <p className="mt-3 font-bold text-[var(--muted)]">
              {correctCount}/{questions.length} correct · {streak}-day streak
            </p>
          </div>
        </div>
        <div className="border-t border-[#eadfe6] bg-white/90 px-6 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-3xl justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setAnswers({});
                setDone(false);
              }}
              className="min-h-14 min-w-40 rounded-full bg-[#f3eef1] px-8 text-lg font-extrabold"
            >
              Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="min-h-14 min-w-56 rounded-full bg-[var(--brand)] px-10 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f7f3f5] font-bold text-[var(--muted)]">
        Loading practice…
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[linear-gradient(165deg,#f8f4f6_0%,#f2f7f0_48%,#f6f1f4_100%)]">
      <header className="shrink-0 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            aria-label="Close practice"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eadfe6] bg-white/80 px-4 text-sm font-extrabold text-[var(--muted)] shadow-sm backdrop-blur transition hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/70 shadow-inner">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-3 text-base font-extrabold">
            <span className="flex items-center gap-1 text-[#afafaf]">
              <span className="text-[var(--ink)]">{correctCount * 10}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[var(--amber)]">
                <path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.3L5.8 21l1.2-7-5-4.9 7.1-1z" />
              </svg>
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#ff9600]">
              <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
            </svg>
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              aria-label={chatOpen ? "Close chat" : "Open chat"}
              aria-pressed={chatOpen}
              className={`grid h-9 w-9 place-items-center rounded-full transition md:hidden ${
                chatOpen
                  ? "bg-[#eaf7ff] text-[var(--sky)]"
                  : "bg-white/80 text-[#afafaf] hover:text-[var(--ink)]"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 gap-3 px-3 pb-3 sm:px-5 lg:px-6">
        <div
          className={`relative hidden h-full shrink-0 transition-all duration-300 ease-out md:flex ${
            chatOpen ? "w-[300px] lg:w-[320px] xl:w-[360px]" : "w-14"
          }`}
        >
          {chatOpen ? (
            <SideChat
              question={question}
              checked={answered}
              isCorrect={answered ? isCorrect : null}
              open
              onClose={() => setChatOpen(false)}
              className="w-full"
            />
          ) : (
            <button
              type="button"
              aria-label="Open side chat"
              onClick={() => setChatOpen(true)}
              className="flex h-full w-full flex-col items-center gap-3 rounded-[1.75rem] border border-[#eadfe6] bg-white/80 py-5 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-[0_3px_0_var(--brand-deep)]">
                <span className="text-lg font-black">D</span>
              </span>
              <span
                className="text-xs font-extrabold tracking-wide text-[var(--muted)]"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                Tutor
              </span>
            </button>
          )}
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-[#eadfe6] bg-white shadow-[0_10px_40px_rgba(60,40,50,0.06)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-6 sm:px-10 sm:pt-8 lg:px-14">
            {!chatOpen && (
              <div className="mb-4 flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Flag question"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#c4c4c4] hover:bg-[var(--surface)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
                  </svg>
                </button>
                <VoiceMenu iconClassName="hover:bg-[var(--surface)]" />
              </div>
            )}

            <div className="mx-auto w-full max-w-3xl flex-1">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#b0a7ad]">
                {question.topic}
              </p>
              <h1 className="mt-3 text-[1.65rem] font-extrabold leading-snug tracking-tight text-[#3f3a42] sm:text-3xl">
                {question.prompt}
              </h1>

              <div className="mt-8 space-y-3 sm:mt-9">
                {question.choices.map((choice, i) => {
                  let state: "correct" | "wrong" | undefined;
                  if (answered) {
                    if (i === question.correctIndex) state = "correct";
                    else if (i === selected) state = "wrong";
                  }
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={answered}
                      data-selected={!answered && selected === i ? "true" : "false"}
                      data-state={state}
                      onClick={() => handleSelect(i)}
                      className="mcq-option relative flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f7f2f4] text-sm font-extrabold text-[#8a8188]">
                        {letter}
                      </span>
                      <span className="flex-1 text-lg font-bold sm:text-xl">{choice}</span>
                      {state === "correct" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--brand)] bg-white text-[var(--brand)]">
                          ✓
                        </span>
                      )}
                      {state === "wrong" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#ff6b7a] bg-white text-[#ff6b7a]">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="mt-6 rounded-[1.35rem] border border-[#eadfe6] bg-[#faf7f8] p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b0a7ad]">
                    Explanation
                  </p>
                  <p className="mt-2 text-base font-semibold leading-relaxed text-[#5c5560]">
                    {question.explanation}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["I still have questions", "Go deeper", "Simplify"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setChatOpen(true);
                          setShowWhy(label === "I still have questions");
                        }}
                        className="rounded-full border border-[#eadfe6] bg-white px-3.5 py-2 text-sm font-extrabold text-[#6b646c] transition hover:bg-white"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-[#f0e8ec] bg-white/95 px-4 py-4 sm:px-6">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
              <button
                type="button"
                aria-label="Back"
                disabled={index <= 0}
                onClick={handleBack}
                className={`grid h-12 w-12 place-items-center rounded-full border ${
                  index <= 0
                    ? "cursor-not-allowed border-[#eee7eb] bg-[#f7f2f4] text-[#cfc6cc]"
                    : "border-[#eadfe6] bg-white text-[#6b646c] hover:bg-[#faf7f8]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={chatOpen ? "Hide tutor" : "Show tutor"}
                  onClick={() => setChatOpen((v) => !v)}
                  className={`grid h-12 w-12 place-items-center rounded-full border ${
                    chatOpen
                      ? "border-[#cfe9ff] bg-[#eaf7ff] text-[var(--sky)]"
                      : "border-[#eadfe6] bg-white text-[#6b646c]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Why?"
                  disabled={!answered}
                  onClick={() => setShowWhy(true)}
                  className={`grid h-12 w-12 place-items-center rounded-full border ${
                    answered
                      ? "border-[#eadfe6] bg-white text-[#6b646c] hover:bg-[#faf7f8]"
                      : "cursor-not-allowed border-[#eee7eb] bg-[#f7f2f4] text-[#cfc6cc]"
                  }`}
                >
                  <span className="text-lg font-black">?</span>
                </button>
                <button
                  type="button"
                  aria-label={isLast ? "Finish" : "Next"}
                  disabled={!answered}
                  onClick={handleNext}
                  className={`grid h-12 min-w-14 place-items-center rounded-full px-4 ${
                    !answered
                      ? "cursor-not-allowed bg-[#eee7eb] text-[#cfc6cc]"
                      : "bg-[#ff7a8a] text-white shadow-[0_4px_0_#e85d6d]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.75">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>

        {chatOpen && (
          <div className="absolute inset-0 z-30 flex md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/25"
              aria-label="Dismiss chat"
              onClick={() => setChatOpen(false)}
            />
            <div className="relative z-10 h-full w-[min(100%,360px)] overflow-hidden p-3">
              <SideChat
                question={question}
                checked={answered}
                isCorrect={answered ? isCorrect : null}
                open
                onClose={() => setChatOpen(false)}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </div>

      {showWhy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <div className="animate-rise w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold">Explanation</h2>
              <button
                type="button"
                onClick={() => setShowWhy(false)}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface)]"
              >
                ✕
              </button>
            </div>
            <div className="rounded-[1.25rem] border border-[#eadfe6] bg-[#faf7f8] p-5">
              <p className="font-bold">{question.prompt}</p>
              <p className="mt-4 inline-flex rounded-full bg-[var(--ok-soft)] px-4 py-2 font-extrabold text-[var(--brand-deep)]">
                {question.choices[question.correctIndex]}
              </p>
              <p className="mt-4 font-semibold text-[var(--muted)]">{question.explanation}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="mt-5 min-h-14 w-full rounded-full bg-[var(--brand)] text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-[#f7f3f5] font-bold text-[var(--muted)]">
          Loading practice…
        </div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
