"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SideChat } from "@/components/SideChat";
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
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  // Closed by default = full question card (image 3); open = side chat (image 2)
  const [chatOpen, setChatOpen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streak, setStreak] = useState(1);

  const question: PracticeQuestion | undefined = questions[index];
  const isCorrect =
    selected !== null &&
    question !== undefined &&
    selected === question.correctIndex;
  const progressPct = ((index + (checked ? 1 : 0.35)) / questions.length) * 100;
  const remainingDots = Math.max(0, questions.length - index - 1);

  function handleCheck() {
    if (selected === null || !question) return;
    setChecked(true);
    if (selected === question.correctIndex) {
      setCorrectCount((count) => count + 1);
    }
  }

  function handleContinue() {
    if (!checked) {
      handleCheck();
      return;
    }

    if (index >= questions.length - 1) {
      const sessionXp = Math.max(10, correctCount * 10 + 10);
      addXp(sessionXp);
      setEarnedXp(sessionXp);
      setStreak(bumpStreak());
      setDone(true);
      return;
    }

    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
    setShowWhy(false);
  }

  if (done) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#f7f7f7]">
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
          </div>
        </div>
        <div className="border-t border-[var(--line)] bg-white px-6 py-5">
          <div className="mx-auto flex max-w-3xl justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setSelected(null);
                setChecked(false);
                setCorrectCount(0);
                setDone(false);
              }}
              className="min-h-14 min-w-40 rounded-2xl bg-[var(--surface)] px-8 text-lg font-extrabold"
            >
              Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="min-h-14 min-w-56 rounded-2xl bg-[var(--brand)] px-10 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
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
      <div className="grid min-h-dvh place-items-center bg-[#f7f7f7] font-bold text-[var(--muted)]">
        Loading practice…
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f7f7f7]">
      {/* Top bar */}
      <header className="shrink-0 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            aria-label="Close practice"
            className="grid h-10 w-10 shrink-0 place-items-center text-[#afafaf] transition hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </Link>

          <div className="flex flex-1 items-center gap-2">
            <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-[#e5e5e5]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              {Array.from({ length: Math.min(4, remainingDots) }).map((_, i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-base font-extrabold">
            <span className="flex items-center gap-1 text-[#afafaf]">
              <span className="text-[var(--ink)]">{correctCount * 10}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[var(--amber)]">
                <path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.3L5.8 21l1.2-7-5-4.9 7.1-1z" />
              </svg>
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[var(--amber)]">
              <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 px-3 pb-3 sm:px-5 lg:px-6">
        {/* Side chat — open state (image 2) */}
        <div
          className={`relative hidden h-full shrink-0 transition-all duration-300 ease-out lg:flex ${
            chatOpen ? "mr-3 w-[300px] xl:w-[340px]" : "w-0 overflow-hidden"
          }`}
        >
          {chatOpen && (
            <>
              <SideChat
                question={question}
                checked={checked}
                isCorrect={checked ? isCorrect : null}
                open
                onClose={() => setChatOpen(false)}
                className="w-full rounded-3xl"
              />
              <button
                type="button"
                aria-label="Close side chat"
                onClick={() => setChatOpen(false)}
                className="absolute top-1/2 -right-2 z-20 h-10 w-3 -translate-y-1/2 rounded-full bg-[#d9d9d9] hover:bg-[#c4c4c4]"
              />
            </>
          )}
        </div>

        {/* Question card — expands when chat closed (image 3) */}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-[#e5e5e5] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all duration-300 ${
            chatOpen ? "" : "mx-auto max-w-5xl"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-28 pt-5 sm:px-10 sm:pt-8">
            {!chatOpen && (
              <div className="mb-4 flex gap-1">
                <button
                  type="button"
                  aria-label="Flag question"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#c4c4c4] hover:bg-[var(--surface)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Read aloud"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#c4c4c4] hover:bg-[var(--surface)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
                    <path d="M15.5 8.5a4 4 0 010 7" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            <div className="mx-auto w-full max-w-2xl flex-1">
              <p className="text-center text-sm font-bold uppercase tracking-wide text-[var(--muted)] sm:text-left">
                {question.topic}
              </p>
              <h1 className="mt-3 text-center text-2xl font-extrabold leading-snug tracking-tight text-[var(--ink)] sm:text-left sm:text-3xl">
                {question.prompt}
              </h1>

              <div className="mt-8 space-y-3 sm:mt-10">
                {question.choices.map((choice, i) => {
                  let state: "correct" | "wrong" | undefined;
                  if (checked) {
                    if (i === question.correctIndex) state = "correct";
                    else if (i === selected) state = "wrong";
                  }
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={checked}
                      data-selected={!checked && selected === i ? "true" : "false"}
                      data-state={state}
                      onClick={() => setSelected(i)}
                      className="mcq-option relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left sm:px-5 sm:py-5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-sm font-extrabold text-[var(--muted)]">
                        {letter}
                      </span>
                      <span className="flex-1 text-lg font-bold sm:text-xl">{choice}</span>
                      {state === "correct" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-white">
                          ✓
                        </span>
                      )}
                      {state === "wrong" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--warn)] text-white">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* In-card footer actions when chat closed feel more Duolingo */}
          <div
            className={`shrink-0 border-t px-4 py-4 sm:px-6 ${
              !checked
                ? "border-[var(--line)] bg-white"
                : isCorrect
                  ? "border-transparent bg-[var(--ok-soft)]"
                  : "border-transparent bg-[var(--warn-soft)]"
            }`}
          >
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--brand)] shadow-[0_3px_0_var(--brand-deep)]"
                >
                  <span className="h-3.5 w-3.5 rounded-sm bg-[var(--ink)]" />
                </span>
                <button
                  type="button"
                  onClick={() => setChatOpen((v) => !v)}
                  aria-label={chatOpen ? "Close chat" : "Open chat"}
                  aria-pressed={chatOpen}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                    chatOpen
                      ? "border-[var(--sky)] bg-[#eaf7ff] text-[var(--sky)]"
                      : "border-[var(--line)] bg-white text-[#afafaf] hover:bg-[var(--surface)]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Voice"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[#afafaf] hover:bg-[var(--surface)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0014 0M12 18v3" strokeLinecap="round" />
                  </svg>
                </button>
                {checked && (
                  <p
                    className={`ml-2 hidden text-xl font-extrabold sm:block ${
                      isCorrect ? "text-[var(--brand-deep)]" : "text-[var(--warn)]"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {checked && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowWhy(true);
                      setChatOpen(true);
                    }}
                    className="min-h-12 rounded-2xl border-2 border-b-4 border-[#e5e5e5] bg-white px-5 text-base font-extrabold text-[var(--muted)]"
                  >
                    Why?
                  </button>
                )}
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleContinue}
                  className={`min-h-12 min-w-36 rounded-2xl px-10 text-lg font-extrabold sm:min-w-48 ${
                    selected === null
                      ? "cursor-not-allowed bg-[#e5e5e5] text-[#afafaf]"
                      : checked
                        ? isCorrect
                          ? "bg-[var(--brand)] text-white shadow-[0_4px_0_var(--brand-deep)]"
                          : "bg-[var(--warn)] text-white shadow-[0_4px_0_#ea2b2b]"
                        : "bg-[var(--brand)] text-white shadow-[0_4px_0_var(--brand-deep)]"
                  }`}
                >
                  {checked
                    ? index >= questions.length - 1
                      ? "Finish"
                      : "Continue"
                    : "Check"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile chat drawer */}
        {chatOpen && (
          <div className="absolute inset-0 z-30 flex lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/25"
              aria-label="Dismiss chat"
              onClick={() => setChatOpen(false)}
            />
            <div className="relative z-10 h-full w-[min(100%,340px)] overflow-hidden rounded-r-3xl bg-[#f7f7f7] shadow-2xl">
              <SideChat
                question={question}
                checked={checked}
                isCorrect={checked ? isCorrect : null}
                open
                onClose={() => setChatOpen(false)}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </div>

      {showWhy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="animate-rise w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
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
            <div className="rounded-2xl border-2 border-[var(--line)] p-5">
              <p className="font-bold">{question.prompt}</p>
              <p className="mt-4 inline-flex rounded-2xl bg-[var(--ok-soft)] px-4 py-2 font-extrabold text-[var(--brand-deep)]">
                {question.choices[question.correctIndex]}
              </p>
              <p className="mt-4 font-semibold text-[var(--muted)]">{question.explanation}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="mt-5 min-h-14 w-full rounded-2xl bg-[var(--brand)] text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
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
        <div className="grid min-h-dvh place-items-center bg-[#f7f7f7] font-bold text-[var(--muted)]">
          Loading practice…
        </div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
