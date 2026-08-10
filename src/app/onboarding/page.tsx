"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { daysUntil, EXAMS, formatRemaining, getExam } from "@/lib/exams";
import { useOnboardingStore } from "@/lib/hooks";
import { saveOnboarding } from "@/lib/storage";
import type {
  DailyGoal,
  ExamId,
  OnboardingState,
  StudyTime,
} from "@/lib/types";

const STEPS = [
  "welcome",
  "exam",
  "date",
  "goal",
  "schedule",
  "ready",
] as const;

const GOALS: { value: DailyGoal; label: string; fill: number }[] = [
  { value: 10, label: "10 min", fill: 20 },
  { value: 20, label: "20 min", fill: 40 },
  { value: 30, label: "30 min", fill: 60 },
  { value: 60, label: "60 min", fill: 100 },
];

const SCHEDULES: {
  value: StudyTime;
  label: string;
  tone: string;
}[] = [
  { value: "morning", label: "Morning routine", tone: "from-amber-200 to-sky-200" },
  { value: "afternoon", label: "Afternoon break", tone: "from-orange-200 to-amber-100" },
  { value: "night", label: "Nightly ritual", tone: "from-indigo-900 to-slate-700" },
  { value: "flexible", label: "Another time", tone: "from-emerald-200 to-sky-100" },
];

function mergeDraft(
  stored: OnboardingState,
  draft: Partial<OnboardingState> | null,
  presetExam: ExamId | null,
): OnboardingState {
  const base = { ...stored, ...draft };
  if (presetExam && EXAMS.some((exam) => exam.id === presetExam) && !draft?.examId) {
    return { ...base, examId: presetExam };
  }
  return base;
}

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const presetExam = params.get("exam") as ExamId | null;
  const stored = useOnboardingStore();

  const [stepIndex, setStepIndex] = useState(() =>
    presetExam && EXAMS.some((exam) => exam.id === presetExam) ? 1 : 0,
  );
  const [draft, setDraft] = useState<Partial<OnboardingState> | null>(null);

  const state = useMemo(
    () => mergeDraft(stored, draft, presetExam),
    [stored, draft, presetExam],
  );

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const exam = getExam(state.examId);
  const remaining = daysUntil(state.examDate);

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "exam") return Boolean(state.examId);
    if (step === "date") return Boolean(state.examDate);
    if (step === "goal") return Boolean(state.dailyGoal);
    if (step === "schedule") return Boolean(state.studyTime);
    return true;
  }, [step, state]);

  function patch(partial: Partial<OnboardingState>) {
    const next = { ...state, ...partial };
    setDraft(next);
    saveOnboarding(next);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    if (step === "ready") {
      const completed = { ...state, completed: true };
      setDraft(completed);
      saveOnboarding(completed);
      router.push("/dashboard");
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  const minDateStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-white px-4 pb-6 pt-4 sm:px-6">
      <ProgressBar value={progress} showBack={stepIndex > 0} onBack={back} />

      <div className="flex flex-1 flex-col pt-8">
        {step === "welcome" && (
          <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
            <div className="animate-float mb-8 grid h-36 w-36 place-items-center rounded-[2rem] bg-[linear-gradient(145deg,#dff8c4,#58cc02)] shadow-[0_18px_40px_rgba(88,204,2,0.28)]">
              <span className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--ink)]">
                Dk
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
              Welcome to DrKard
            </h1>
            <p className="mt-3 max-w-md text-lg font-semibold text-[var(--muted)]">
              We&apos;ll set your exam, countdown, and daily study plan — built
              for test prep, not language lessons.
            </p>
          </div>
        )}

        {step === "exam" && (
          <div className="animate-rise">
            <div className="mb-6 flex items-start gap-3">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">
                Dk
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Which exam are you prepping for?
              </h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {EXAMS.map((item) => {
                const selected = state.examId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => patch({ examId: item.id })}
                    className={`rounded-3xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--ok-soft)]"
                        : "border-[var(--line)] bg-[var(--track)] hover:border-[#c5d4cb]"
                    }`}
                  >
                    <p className="text-lg font-extrabold">{item.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                      {item.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "date" && (
          <div className="animate-rise">
            <div className="mb-6 flex items-start gap-3">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">
                Dk
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                When is your {exam?.name ?? "exam"} date?
              </h1>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Exam date
              </span>
              <input
                type="date"
                min={minDateStr}
                value={state.examDate ?? ""}
                onChange={(e) =>
                  patch({ examDate: e.target.value || null })
                }
                className="w-full rounded-3xl border-2 border-[var(--line)] bg-[var(--track)] px-5 py-4 text-lg font-bold outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <div className="mt-6 rounded-[1.75rem] bg-[var(--ink)] p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">
                Remaining
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-5xl font-bold">
                {remaining === null ? "—" : remaining < 0 ? 0 : remaining}
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--brand-soft)]">
                {formatRemaining(remaining)}
              </p>
              {exam && (
                <p className="mt-4 text-sm font-semibold text-white/70">
                  DrKard will pace your {exam.name} drills toward this date.
                </p>
              )}
            </div>
          </div>
        )}

        {step === "goal" && (
          <div className="animate-rise">
            <div className="mb-6 flex items-start gap-3">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">
                Dk
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                What&apos;s your daily study goal?
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GOALS.map((goal) => {
                const selected = state.dailyGoal === goal.value;
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => patch({ dailyGoal: goal.value })}
                    className={`flex min-h-40 flex-col items-center justify-center rounded-3xl border-2 px-3 py-5 transition ${
                      selected
                        ? "border-[#ce82ff] bg-[linear-gradient(180deg,#f3e8ff,#ebe0ff)]"
                        : "border-[var(--line)] bg-[var(--track)]"
                    }`}
                  >
                    <span
                      className="mb-3 grid h-16 w-16 place-items-center rounded-full border-4 border-[#d0d0d0] bg-white"
                      style={{
                        background: `conic-gradient(#ce82ff ${goal.fill}%, #ececec 0)`,
                      }}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-black text-[var(--ink)]">
                        {goal.value}
                      </span>
                    </span>
                    <span className="text-base font-extrabold">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "schedule" && (
          <div className="animate-rise">
            <div className="mb-6 flex items-start gap-3">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">
                Dk
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                How will studying fit into your day?
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SCHEDULES.map((item) => {
                const selected = state.studyTime === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => patch({ studyTime: item.value })}
                    className={`flex min-h-44 flex-col items-center justify-center rounded-3xl border-2 px-3 py-5 text-center transition ${
                      selected
                        ? "border-[#ce82ff] bg-[linear-gradient(180deg,#f3e8ff,#ebe0ff)]"
                        : "border-[var(--line)] bg-[var(--track)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mb-4 h-14 w-14 rounded-full bg-gradient-to-br ${item.tone} shadow-inner`}
                    />
                    <span className="text-sm font-extrabold leading-snug">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "ready" && (
          <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
            <div className="animate-pulse-soft mb-6 grid h-28 w-28 place-items-center rounded-full bg-[var(--brand-soft)]">
              <span className="block h-16 w-10 rotate-12 rounded-md bg-[var(--brand)] shadow-[4px_4px_0_var(--brand-deep)]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your plan is ready
            </h1>
            <p className="mt-3 max-w-md text-lg font-semibold text-[var(--muted)]">
              {exam?.name ?? "Exam"} · {formatRemaining(remaining)} ·{" "}
              {state.dailyGoal ?? 20} min / day
            </p>
            <div className="mt-8 w-full max-w-md rounded-[1.75rem] border-2 border-[var(--line)] bg-[var(--mint)] p-5 text-left">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                Next up
              </p>
              <p className="mt-1 text-xl font-extrabold text-[var(--ink)]">
                Start a short placement-style practice set
              </p>
              <Link
                href={`/practice?exam=${state.examId ?? "sat"}`}
                className="mt-4 inline-flex font-extrabold text-[var(--brand-deep)]"
              >
                Jump into practice →
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <PillButton
          onClick={next}
          disabled={!canContinue}
          variant={
            canContinue ? (step === "ready" ? "brand" : "primary") : "disabled"
          }
        >
          {step === "ready" ? "Go to dashboard" : "Continue"}
        </PillButton>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center font-bold text-[var(--muted)]">
          Loading onboarding…
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
