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
  const [chatOpen, setChatOpen] = useState(true);
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

  function handleCheck() {
    if (selected === null || !question) return;
    setChecked(true);
    if (selected === question.correctIndex) {
      setCorrectCount((count) => count + 1);
    }
    setChatOpen(true);
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
      <div className="flex min-h-dvh w-full flex-col bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="animate-float mb-8 grid h-28 w-28 place-items-center rounded-[2rem] bg-[#ce82ff]">
            <div className="h-14 w-5 rounded-full bg-white" />
          </div>
          <h1 className="animate-rise text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
            Practice complete!
          </h1>
          <p className="mt-3 text-xl font-bold text-[var(--muted)]">
            Nice — let&apos;s keep the momentum going
          </p>
          <div className="mt-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--ink)]">
              Total XP
            </p>
            <p className="mt-2 text-6xl font-black text-[var(--ink)]">
              {earnedXp}
              <span className="ml-2 text-[var(--brand)]">✦</span>
            </p>
            <p className="mt-3 font-bold text-[var(--muted)]">
              {correctCount}/{questions.length} correct · {streak}-day streak
            </p>
          </div>
        </div>
        <div className="border-t border-[var(--line)] px-6 py-5">
          <div className="mx-auto flex w-full max-w-3xl justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setSelected(null);
                setChecked(false);
                setShowWhy(false);
                setCorrectCount(0);
                setDone(false);
              }}
              className="min-h-14 min-w-40 rounded-2xl bg-[var(--surface)] px-8 text-lg font-extrabold text-[var(--ink)]"
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
      <div className="grid min-h-dvh place-items-center bg-white font-bold text-[var(--muted)]">
        Loading practice…
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-white">
      {/* Top bar — full web width */}
      <header className="shrink-0 border-b border-[var(--line)] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            aria-label="Close practice"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[#777] transition hover:bg-[#ececec]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </Link>

          <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--track)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-3 text-base font-extrabold">
            <span className="flex items-center gap-1 text-[var(--amber)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.3L5.8 21l1.2-7-5-4.9 7.1-1z" />
              </svg>
              {correctCount * 10}
            </span>
            <span className="flex items-center text-[var(--brand)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" />
              </svg>
            </span>
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              className="ml-1 hidden h-10 items-center gap-2 rounded-2xl border border-[var(--line)] px-3 text-sm font-extrabold text-[var(--muted)] hover:bg-[var(--surface)] lg:inline-flex"
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface)] lg:hidden"
              aria-label="Open tutor chat"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Body: side chat + MCQ workspace */}
      <div className="relative flex min-h-0 flex-1">
        {/* Desktop side chat */}
        <div
          className={`hidden h-full shrink-0 border-r border-[var(--line)] transition-all duration-300 lg:flex ${
            chatOpen ? "w-[340px] xl:w-[380px]" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          <SideChat
            question={question}
            checked={checked}
            isCorrect={checked ? isCorrect : null}
            open={chatOpen}
            className="w-full"
          />
        </div>

        {/* Resize handle visual */}
        {chatOpen && (
          <div className="relative z-10 hidden w-0 lg:block">
            <span className="absolute top-1/2 -left-2.5 h-10 w-2.5 -translate-y-1/2 rounded-full border border-[var(--line)] bg-[var(--surface)]" />
          </div>
        )}

        {/* Main MCQ stage */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-5 pb-36 pt-8 sm:px-10">
            <div className="animate-rise flex flex-1 flex-col">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
                {question.topic}
              </p>
              <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
                {question.prompt}
              </h1>

              <div className="mt-10 space-y-3">
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
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-sm font-extrabold text-[var(--muted)]">
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
        </main>

        {/* Mobile chat drawer */}
        {chatOpen && (
          <div className="absolute inset-0 z-30 flex lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Dismiss chat"
              onClick={() => setChatOpen(false)}
            />
            <div className="relative z-10 h-full w-[min(100%,360px)] shadow-2xl">
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

      {/* Footer */}
      <footer
        className={`shrink-0 border-t px-4 py-4 sm:px-6 lg:px-8 ${
          !checked
            ? "border-[var(--line)] bg-white"
            : isCorrect
              ? "border-transparent bg-[var(--ok-soft)]"
              : "border-transparent bg-[var(--warn-soft)]"
        }`}
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand)] text-white lg:hidden"
              aria-label="Open chat"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-h-10 font-extrabold">
              {checked ? (
                <p
                  className={`text-2xl ${
                    isCorrect ? "text-[var(--brand-deep)]" : "text-[var(--warn)]"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
              ) : (
                <p className="text-lg text-[var(--muted)]">Select an answer</p>
              )}
            </div>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
            {checked && (
              <button
                type="button"
                onClick={() => {
                  setShowWhy(true);
                  setChatOpen(true);
                }}
                className="min-h-14 rounded-2xl border-2 border-b-4 border-[#e5e5e5] bg-white px-6 text-lg font-extrabold text-[var(--muted)] transition hover:bg-[var(--surface)]"
              >
                Why?
              </button>
            )}
            <button
              type="button"
              disabled={selected === null}
              onClick={handleContinue}
              className={`min-h-14 flex-1 rounded-2xl px-12 text-lg font-extrabold sm:min-w-48 sm:flex-none ${
                selected === null
                  ? "cursor-not-allowed bg-[var(--track)] text-[#afafaf]"
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
      </footer>

      {showWhy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="animate-rise w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[var(--ink)]">Explanation</h2>
              <button
                type="button"
                onClick={() => setShowWhy(false)}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface)]"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl border-2 border-[var(--line)] p-5">
              <p className="font-bold text-[var(--ink)]">{question.prompt}</p>
              <p className="mt-4 inline-flex rounded-2xl bg-[var(--ok-soft)] px-4 py-2 font-extrabold text-[var(--brand-deep)]">
                {question.choices[question.correctIndex]}
              </p>
              <p className="mt-4 font-semibold leading-relaxed text-[var(--muted)]">
                {question.explanation}
              </p>
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
        <div className="grid min-h-dvh place-items-center bg-white font-bold text-[var(--muted)]">
          Loading practice…
        </div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
