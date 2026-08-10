"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PillButton } from "@/components/PillButton";
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
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streak, setStreak] = useState(1);

  const question: PracticeQuestion | undefined = questions[index];
  const isCorrect =
    selected !== null &&
    question !== undefined &&
    selected === question.correctIndex;

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
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-white px-6 text-center">
        <div className="animate-float mb-6 grid h-28 w-28 place-items-center rounded-[2rem] bg-[linear-gradient(145deg,#d9c2ff,#8b5cf6)] shadow-[0_18px_40px_rgba(139,92,246,0.25)]">
          <div className="h-12 w-4 rounded-full bg-white" />
        </div>
        <h1 className="animate-rise text-4xl font-extrabold tracking-tight">
          Practice complete!
        </h1>
        <p className="mt-2 text-lg font-semibold text-[var(--muted)]">
          Nice — let&apos;s keep the momentum going
        </p>
        <div className="mt-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em]">
            Total XP
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-6xl font-bold">
            {earnedXp}
            <span className="ml-2 text-[var(--brand)]">✦</span>
          </p>
          <p className="mt-3 font-bold text-[var(--muted)]">
            {correctCount}/{questions.length} correct · {streak}-day streak
          </p>
        </div>
        <div className="mt-12 w-full space-y-3">
          <PillButton variant="primary" onClick={() => router.push("/dashboard")}>
            Continue
          </PillButton>
          <PillButton
            variant="ghost"
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setChecked(false);
              setShowWhy(false);
              setCorrectCount(0);
              setDone(false);
            }}
          >
            Practice again
          </PillButton>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="grid min-h-dvh place-items-center font-bold">
        Loading practice…
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col bg-[#f7f7f7] px-4 pb-28 pt-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          aria-label="Close practice"
          className="grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] hover:bg-black/5"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          {questions.map((item, i) => (
            <span
              key={item.id}
              className={`h-2.5 w-2.5 rounded-full ${
                i === index
                  ? "bg-[var(--brand)]"
                  : i < index
                    ? "bg-[#c4c4c4]"
                    : "bg-[#e0e0e0]"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--amber)]">
          ★ {correctCount * 10}
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
          {question.topic}
        </p>
        <h1 className="mt-3 text-xl font-extrabold leading-snug tracking-tight text-[var(--ink)] sm:text-2xl">
          {question.prompt}
        </h1>

        <div className="mt-8 space-y-3">
          {question.choices.map((choice, i) => {
            let state: "correct" | "wrong" | undefined;
            if (checked) {
              if (i === question.correctIndex) state = "correct";
              else if (i === selected) state = "wrong";
            }
            return (
              <button
                key={choice}
                type="button"
                disabled={checked}
                data-selected={!checked && selected === i ? "true" : "false"}
                data-state={state}
                onClick={() => setSelected(i)}
                className="choice-card relative w-full rounded-2xl px-4 py-4 text-left text-base font-bold sm:text-lg"
              >
                {choice}
                {state === "correct" && (
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-sm text-white">
                    ✓
                  </span>
                )}
                {state === "wrong" && (
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--warn)] text-sm text-white">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 border-t px-4 py-4 sm:px-6 ${
          !checked
            ? "border-[var(--line)] bg-white"
            : isCorrect
              ? "border-[#b6e07e] bg-[var(--ok-soft)]"
              : "border-[#f5b4b4] bg-[var(--warn-soft)]"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-8 font-extrabold">
            {checked ? (
              <span
                className={
                  isCorrect ? "text-[var(--brand-deep)]" : "text-[var(--warn)]"
                }
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
            ) : (
              <span className="text-[var(--muted)]">Select an answer</span>
            )}
          </div>
          <div className="flex gap-2">
            {checked && (
              <button
                type="button"
                onClick={() => setShowWhy(true)}
                className="min-h-12 rounded-2xl bg-[var(--ink)] px-5 text-base font-extrabold text-white"
              >
                Why?
              </button>
            )}
            <button
              type="button"
              disabled={selected === null}
              onClick={handleContinue}
              className={`min-h-12 flex-1 rounded-2xl px-6 text-base font-extrabold sm:flex-none ${
                selected === null
                  ? "bg-[var(--track)] text-[#afafaf]"
                  : checked
                    ? isCorrect
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--ink)] text-white"
                    : "bg-[var(--ink)] text-white"
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

      {showWhy && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4">
          <div className="animate-rise w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Explanation</h2>
              <button
                type="button"
                onClick={() => setShowWhy(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="font-semibold text-[var(--ink)]">{question.prompt}</p>
              <p className="mt-3 inline-flex rounded-full bg-[var(--ink)] px-3 py-1 text-sm font-bold text-white">
                {question.choices[question.correctIndex]}
              </p>
              <p className="mt-4 font-semibold text-[var(--muted)]">
                {question.explanation}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="mt-5 min-h-12 w-full rounded-full bg-[var(--ink)] text-base font-extrabold text-white"
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
        <div className="grid min-h-dvh place-items-center font-bold text-[var(--muted)]">
          Loading practice…
        </div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
