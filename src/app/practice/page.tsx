"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { SideChat } from "@/components/SideChat";
import { SiteHeader } from "@/components/SiteHeader";
import { VoiceMenu } from "@/components/VoiceMenu";
import { useOnboardingStore, useReviewRecords } from "@/lib/hooks";
import { questionsForExam } from "@/lib/questions";
import { addStudySeconds, addXp, bumpStreak, saveQuestionReport, saveReviewRecord, toggleReviewFlag } from "@/lib/storage";
import type { ExamId, PracticeQuestion } from "@/lib/types";

function playNextTone(correct: boolean) {
  try {
    const context = new window.AudioContext();
    const gain = context.createGain();
    const first = context.createOscillator();
    const second = context.createOscillator();
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    first.type = "sine";
    second.type = "sine";
    first.frequency.setValueAtTime(correct ? 560 : 360, now);
    second.frequency.setValueAtTime(correct ? 720 : 440, now + 0.07);
    first.connect(gain);
    second.connect(gain);
    gain.connect(context.destination);
    first.start(now);
    first.stop(now + 0.13);
    second.start(now + 0.07);
    second.stop(now + 0.2);
    window.setTimeout(() => void context.close(), 260);
  } catch {
    // Audio feedback is optional; navigation should always continue.
  }
}

const REPORT_REASONS = [
  "Incorrect information",
  "Wrong answer marked correct",
  "Unclear wording",
  "Formatting or technical issue",
  "Other",
] as const;

function PracticeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const examParam = params.get("exam") as ExamId | null;
  const profile = useOnboardingStore();
  const reviewRecords = useReviewRecords();
  const examId = examParam ?? profile.examId ?? "sat";

  const questions = useMemo(() => questionsForExam(examId), [examId]);
  const requestedQuestion = Number(params.get("question") ?? "1") - 1;
  const index = Number.isFinite(requestedQuestion)
    ? Math.max(0, Math.min(questions.length - 1, requestedQuestion))
    : 0;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showWhy, setShowWhy] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("Incorrect information");
  const [reportNote, setReportNote] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localFlags, setLocalFlags] = useState<Set<string>>(() => new Set());
  const [quickPrompt, setQuickPrompt] = useState<{ id: number; text: string } | null>(null);
  const startedAtRef = useRef(Date.now());
  const keyboardActionRef = useRef<(event: KeyboardEvent) => void>(() => undefined);

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
  const answeredCount = Object.keys(answers).length;
  const liveScorePercent = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressPct = ((index + (answered ? 1 : 0.35)) / questions.length) * 100;
  const remainingDots = Math.max(0, questions.length - index - 1);
  const isLast = index >= questions.length - 1;
  const savedRecord = question ? reviewRecords.find((record) => record.questionId === question.id) : undefined;
  const flagged = Boolean(savedRecord?.flagged || (question && localFlags.has(question.id)));

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [index]: optionIndex }));
    if (question) {
      saveReviewRecord({
        questionId: question.id,
        examId: question.examId,
        selectedIndex: optionIndex,
        correct: optionIndex === question.correctIndex,
        flagged,
        answeredAt: new Date().toISOString(),
      });
    }
  }

  function handleBack() {
    if (index <= 0) return;
    goToQuestion(index - 1);
    setShowWhy(false);
  }

  function goToQuestion(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(questions.length - 1, nextIndex));
    const query = new URLSearchParams(params.toString());
    query.set("exam", examId);
    query.set("question", String(safeIndex + 1));
    router.push(`/practice?${query.toString()}`, { scroll: false });
  }

  function handleNext() {
    if (!answered) return;
    playNextTone(isCorrect);

    if (isLast) {
      const sessionXp = Math.max(10, correctCount * 10 + 10);
      const sessionSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      addXp(sessionXp);
      addStudySeconds(sessionSeconds);
      setEarnedXp(sessionXp);
      setElapsedSeconds(sessionSeconds);
      setStreak(bumpStreak());
      setDone(true);
      return;
    }

    goToQuestion(index + 1);
    setShowWhy(false);
  }

  function openReport() {
    setReportSubmitted(false);
    setShowReport(true);
  }

  function submitReport() {
    if (!question) return;
    saveQuestionReport({
      questionId: question.id,
      examId: question.examId,
      reason: reportReason,
      note: reportNote.trim(),
      reportedAt: new Date().toISOString(),
    });
    if (savedRecord && !savedRecord.flagged) toggleReviewFlag(question.id);
    if (!savedRecord) {
      setLocalFlags((previous) => new Set(previous).add(question.id));
    }
    setReportSubmitted(true);
  }

  function askTutor(text: string) {
    setChatOpen(true);
    setQuickPrompt({ id: Date.now(), text });
  }

  keyboardActionRef.current = (event) => {
    const target = event.target as HTMLElement | null;
    if (done || showQuit || showReport || target?.matches("input, textarea, select, [contenteditable='true']")) return;
    const optionIndex = ["1", "2", "3", "4", "a", "b", "c", "d"].indexOf(event.key.toLowerCase()) % 4;
    if (!answered && optionIndex >= 0) {
      event.preventDefault();
      handleSelect(optionIndex);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleBack();
    } else if (answered && (event.key === "ArrowRight" || event.key === "Enter")) {
      event.preventDefault();
      handleNext();
    } else if (answered && event.key.toLowerCase() === "w") {
      event.preventDefault();
      setShowWhy(true);
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => keyboardActionRef.current(event);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (done) {
    const incorrectCount = questions.length - correctCount;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const timeLabel = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
    return (
      <div className="flex min-h-dvh w-full flex-col bg-[#f4f6f8]">
        <SiteHeader compact actions={<Link href="/dashboard" className="rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-black text-white">Dashboard</Link>}/>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
          <section className="rounded-[2rem] border-2 border-[var(--line)] bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--muted)]">Session report</p><h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">Practice results</h1></div><div className="rounded-2xl bg-[var(--surface)] px-5 py-3 text-right"><p className="text-xs font-black uppercase text-[var(--muted)]">Score</p><p className="text-4xl font-black">{scorePercent}%</p></div></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border-2 border-[var(--line)] p-5"><p className="text-xs font-black uppercase text-[var(--muted)]">Correct</p><p className="mt-2 text-4xl font-black text-[#147657]">{correctCount}</p></div>
              <div className="rounded-2xl border-2 border-[var(--line)] p-5"><p className="text-xs font-black uppercase text-[var(--muted)]">Incorrect</p><p className="mt-2 text-4xl font-black text-[#b83b42]">{incorrectCount}</p></div>
              <div className="rounded-2xl border-2 border-[var(--line)] p-5"><p className="text-xs font-black uppercase text-[var(--muted)]">Time</p><p className="mt-2 text-4xl font-black">{timeLabel}</p></div>
              <div className="rounded-2xl border-2 border-[var(--line)] p-5"><p className="text-xs font-black uppercase text-[var(--muted)]">Questions</p><p className="mt-2 text-4xl font-black">{questions.length}</p></div>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] px-5 py-4"><p className="font-bold text-[var(--muted)]">{streak}-day study streak</p><p className="text-sm font-black text-[var(--muted)]">+{earnedXp} study points</p></div>
          </section>
        </main>
        <footer className="border-t border-[var(--line)] bg-white px-5 py-5">
          <div className="mx-auto flex max-w-4xl flex-col justify-end gap-3 sm:flex-row">
            <Link
              href={`/review?exam=${examId}`}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-white px-7 text-base font-extrabold text-[var(--ink)]"
            >
              Review answers
            </Link>
            <button
              type="button"
              onClick={() => {
                goToQuestion(0);
                setAnswers({});
                setDone(false);
                startedAtRef.current = Date.now();
              }}
              className="min-h-14 rounded-2xl bg-[var(--surface)] px-7 text-base font-extrabold"
            >
              Start over
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="min-h-14 rounded-2xl bg-[var(--ink)] px-8 text-base font-extrabold text-white"
            >
              Dashboard
            </button>
          </div>
        </footer>
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

  const feedbackChrome = answered ? (isCorrect ? "bg-[#edf7f3]" : "bg-[#fbedef]") : "bg-[#f4f5f7]";

  return (
    <div className={`flex h-dvh w-full flex-col overflow-hidden transition-colors ${feedbackChrome}`}>
      {/* Top bar */}
      <header className="shrink-0 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowQuit(true)}
            aria-label="Close practice"
            className="grid h-10 w-10 shrink-0 place-items-center text-[#afafaf] transition hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

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

          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#eef8ff] px-3 py-2 text-base font-black text-[#168ac1]" aria-label={`${liveScorePercent}% score`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="m12 1 8.7 5v10L12 21l-8.7-5V6L12 1Zm-1.2 14.8 6-6-1.7-1.7-4.3 4.3-2-2-1.7 1.7 3.7 3.7Z" />
            </svg>
            <span className="tabular-nums">{liveScorePercent}%</span>
          </div>
        </div>
      </header>

      {/* Body: gray chrome + full white question plane */}
      <div className="relative flex min-h-0 flex-1 gap-0 p-2 pt-0 sm:p-3 sm:pt-0 lg:px-5 lg:pb-5">
        {/* Side chat sits on gray page chrome */}
        {chatOpen ? <div className="relative hidden h-full w-[320px] shrink-0 pr-3 md:flex lg:w-[360px]"><SideChat question={question} checked={answered} isCorrect={answered ? isCorrect : null} open flagged={flagged} onFlag={openReport} onClose={() => setChatOpen(false)} quickPrompt={quickPrompt} className="w-full"/></div> : null}

        {/* Full remaining area = white question background */}
        <main className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-[0_16px_50px_rgba(28,42,58,0.05)] md:rounded-[2.25rem] md:border-[3px] ${answered ? (isCorrect ? "md:border-[#79d6ab]" : "md:border-[#ec9da3]") : "md:border-[#d7dce1]"}`}>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-12 pt-5 sm:px-10 sm:pt-8 lg:px-16 lg:pt-10">
            {!chatOpen && (
              <div className="mb-5 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Report question"
                  aria-pressed={flagged}
                  onClick={openReport}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border-2 px-3 font-black transition ${flagged ? "border-[#f0c469] bg-[#fff4d6] text-[#956000]" : "border-[var(--line)] bg-white text-[#656b72] hover:border-[#bbc1c8] hover:bg-[var(--surface)]"}`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M5 21V4h10l-1.5 4L19 12H5" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">Report</span>
                </button>
                <VoiceMenu iconClassName="hover:bg-[var(--surface)]" />
              </div>
            )}

            <div className="mx-auto w-full max-w-4xl flex-1">
              <p className="text-center text-sm font-bold uppercase tracking-wide text-[var(--muted)] sm:text-left">
                {question.topic}
              </p>
              <h1 className="mt-3 text-center text-3xl font-extrabold leading-[1.2] tracking-tight text-[var(--ink)] sm:text-left sm:text-4xl">
                {question.prompt}
              </h1>

              <div className="mt-8 space-y-3.5 sm:mt-10">
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
                      className="mcq-option relative flex min-h-[4.75rem] w-full items-center gap-4 rounded-2xl px-4 py-4 text-left sm:min-h-[5.25rem] sm:px-6 sm:py-5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-sm font-extrabold text-[var(--muted)]">
                        {letter}
                      </span>
                      <span className="flex-1 text-lg font-bold sm:text-[1.35rem]">{choice}</span>
                      {state === "correct" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#23966f] text-white">
                          ✓
                        </span>
                      )}
                      {state === "wrong" && (
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9565b] text-white">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {answered ? <div className="mt-6 rounded-2xl border-2 border-[#d7dce1] bg-[var(--surface)] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Explanation</p><p className="mt-2 text-base font-semibold leading-relaxed text-[var(--ink)] sm:text-lg">{question.explanation}</p><div className="mt-4 flex flex-wrap gap-2">{["I still have questions", "Go deeper", "Simplify"].map((prompt) => <button key={prompt} type="button" onClick={() => askTutor(prompt)} className="min-h-11 rounded-xl border-2 border-[var(--line)] bg-white px-4 font-bold text-[var(--ink)] transition hover:border-[#c7cdd4] hover:bg-white">{prompt}</button>)}</div></div> : null}
            </div>
          </div>

          <div
            className={`shrink-0 border-t px-4 py-4 sm:px-6 ${
              !answered
                ? "border-[var(--line)] bg-white"
                : isCorrect
                  ? "border-[#b9ddcf] bg-[#e8f5f0]"
                  : "border-[#efc4c7] bg-[#fbecee]"
            }`}
          >
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
              <div className="flex min-h-10 items-center gap-3">
                <button
                  type="button"
                  aria-label="Back"
                  disabled={index <= 0}
                  onClick={handleBack}
                  className={`grid h-12 w-12 place-items-center rounded-2xl border-2 border-b-4 transition ${
                    index <= 0
                      ? "cursor-not-allowed border-[#d8dde2] bg-[#f4f5f6] text-[#777d84] opacity-65"
                      : "border-[#cfd5db] bg-white text-[#3f464d] shadow-sm hover:bg-[var(--surface)]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.75">
                    <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChatOpen((value) => !value)}
                  aria-label={chatOpen ? "Hide tutor" : "Open tutor"}
                  aria-pressed={chatOpen}
                  className={`grid h-12 w-12 place-items-center rounded-2xl border-2 border-b-4 transition ${chatOpen ? "border-[#9bd7f5] bg-[#eaf7ff] text-[#168ac1]" : "border-[#d8dde2] bg-white text-[var(--ink)]"}`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M5 6h14v10H8l-3 3V6z" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" strokeLinecap="round"/></svg>
                </button>
                {answered && (
                  <button
                    type="button"
                    onClick={() => setShowWhy(true)}
                    aria-label="Why this answer"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-b-4 border-[#d8dde2] bg-white px-5 text-base font-black text-[var(--ink)]"
                >
                    Why?
                  </button>
                )}
                <button
                  type="button"
                  aria-label={isLast ? "Finish" : "Next"}
                  disabled={!answered}
                  onClick={handleNext}
                  className={`inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-2xl px-5 text-base font-black sm:min-w-44 ${
                    !answered
                      ? "cursor-not-allowed bg-[#e5e5e5] text-[#afafaf]"
                      : isCorrect
                        ? "bg-[#23966f] text-white shadow-[0_4px_0_#147657]"
                        : "bg-[#d9565b] text-white shadow-[0_4px_0_#b83b42]"
                  }`}
                >
                  <span>{isLast ? "Finish" : "Continue"}</span>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.75">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
            <div className="relative z-10 h-full w-[min(100%,340px)] overflow-hidden rounded-r-3xl bg-white shadow-2xl">
              <SideChat
                question={question}
                checked={answered}
                isCorrect={answered ? isCorrect : null}
                open
                flagged={flagged}
                onFlag={openReport}
                onClose={() => setChatOpen(false)}
                quickPrompt={quickPrompt}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </div>

      {showWhy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="explanation-title" className="animate-rise w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span id="explanation-title" className="rounded-full bg-[#e8f2fb] px-4 py-2 text-sm font-black text-[#2f668b]">Explanation</span>
              <button
                type="button"
                onClick={() => setShowWhy(false)}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface)]"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl bg-[var(--surface)] p-5">
              <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">Correct answer</p>
              <p className="mt-2 text-xl font-black text-[#147657]">{question.choices[question.correctIndex]}</p>
              <div className="my-5 h-px bg-[var(--line)]" />
              <p className="font-semibold leading-relaxed text-[var(--ink)]">{question.explanation}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="mt-5 min-h-14 w-full rounded-2xl bg-[var(--ink)] text-lg font-extrabold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showReport ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowReport(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="report-title" className="animate-rise w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            {reportSubmitted ? <div className="py-5 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e2f5ec] text-3xl font-black text-[#16865f]">✓</div>
              <h2 id="report-title" className="mt-5 text-3xl font-black text-[var(--ink)]">Report received</h2>
              <p className="mx-auto mt-3 max-w-sm text-base font-semibold leading-relaxed text-[var(--muted)]">We saved this question for review and flagged it in your history.</p>
              <button type="button" onClick={() => setShowReport(false)} className="mt-7 min-h-14 w-full rounded-2xl bg-[var(--ink)] text-lg font-black text-white">Back to practice</button>
            </div> : <>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#b67800]">Question feedback</p><h2 id="report-title" className="mt-1 text-3xl font-black text-[var(--ink)]">Report a problem</h2></div>
                <button type="button" onClick={() => setShowReport(false)} aria-label="Close report" className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)]">✕</button>
              </div>
              <p className="mt-3 font-semibold leading-relaxed text-[var(--muted)]">What should we review about this question?</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {REPORT_REASONS.map((reason) => <button key={reason} type="button" onClick={() => setReportReason(reason)} className={`min-h-12 rounded-xl border-2 px-4 text-left text-sm font-black transition ${reportReason === reason ? "border-[#d69a21] bg-[#fff7e1] text-[#855600]" : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[#c5cbd1]"}`}>{reason}</button>)}
              </div>
              <label className="mt-5 block"><span className="text-sm font-black text-[var(--ink)]">More detail <span className="font-semibold text-[var(--muted)]">(optional)</span></span><textarea value={reportNote} onChange={(event) => setReportNote(event.target.value)} rows={3} placeholder="Tell us what seems wrong…" className="mt-2 w-full resize-none rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4 font-semibold outline-none transition focus:border-[#d69a21]"/></label>
              <button type="button" onClick={submitReport} className="mt-5 min-h-14 w-full rounded-2xl bg-[var(--ink)] text-lg font-black text-white shadow-[0_4px_0_#111]">Submit report</button>
            </>}
          </section>
        </div>
      ) : null}

      {showQuit ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowQuit(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="quit-title" className="animate-rise w-full max-w-lg rounded-[2rem] bg-white p-7 text-center shadow-2xl sm:p-9">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0f0] text-[#c83c43]">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v5M12 17h.01" strokeLinecap="round"/><path d="M10.3 3.8 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.8a2 2 0 0 0-3.4 0Z" strokeLinejoin="round"/></svg>
            </div>
            <h2 id="quit-title" className="mt-5 text-3xl font-black text-[var(--ink)]">Are you sure?</h2>
            <p className="mx-auto mt-3 max-w-sm text-lg font-semibold leading-relaxed text-[var(--muted)]">If you quit, this practice session and its study points won’t be completed.</p>
            <button type="button" onClick={() => setShowQuit(false)} className="mt-7 min-h-14 w-full rounded-2xl bg-[var(--ink)] text-lg font-black text-white shadow-[0_4px_0_#111]">Keep learning</button>
            <button type="button" onClick={() => router.push("/dashboard")} className="mt-4 min-h-12 w-full rounded-2xl text-lg font-black text-[#c83c43] transition hover:bg-[#fff4f4]">Quit</button>
          </section>
        </div>
      ) : null}
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
