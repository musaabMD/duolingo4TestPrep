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
  { value: "night", label: "Nightly ritual", tone: "from-slate-800 to-slate-600" },
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

  function selectAndAdvance(partial: Partial<OnboardingState>) {
    patch(partial);
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  const minDateStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <header className="w-full border-b border-[var(--line)] px-4 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <ProgressBar value={progress} showBack={stepIndex > 0} onBack={back} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-32 pt-8 sm:px-8 lg:px-12">
        {step === "welcome" && (
          <div className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
            <div className="animate-float mb-8 grid h-40 w-40 place-items-center rounded-[2rem] bg-[var(--brand)]">
              <span className="text-5xl font-black text-white">Dk</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
              Welcome to DrKard
            </h1>
            <p className="mt-4 max-w-xl text-xl font-semibold text-[var(--muted)]">
              Set your exam date, remaining days, and daily study plan — built
              for test prep, not language lessons.
            </p>
          </div>
        )}

        {step === "exam" && (
          <div className="animate-rise">
            <div className="mb-8 flex items-start gap-4">
              <span className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-base font-black text-white">
                Dk
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                Which exam are you prepping for?
              </h1>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMS.map((item) => {
                const selected = state.examId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => patch({ examId: item.id })}
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--ok-soft)]"
                        : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"
                    }`}
                  >
                    <p className="text-xl font-extrabold text-[var(--ink)]">{item.name}</p>
                    <p className="mt-2 font-semibold text-[var(--muted)]">{item.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "date" && (
          <div className="animate-rise mx-auto w-full max-w-2xl">
            <div className="mb-8 flex items-start gap-4">
              <span className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-base font-black text-white">
                Dk
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
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
                onChange={(e) => patch({ examDate: e.target.value || null })}
                className="w-full rounded-2xl border-2 border-[var(--line)] bg-white px-5 py-4 text-xl font-bold outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <div className="mt-6 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
                Remaining
              </p>
              <p className="mt-2 text-6xl font-black text-[var(--ink)]">
                {remaining === null ? "—" : remaining < 0 ? 0 : remaining}
              </p>
              <p className="mt-2 text-xl font-extrabold text-[var(--brand-deep)]">
                {formatRemaining(remaining)}
              </p>
              {exam && (
                <p className="mt-4 font-semibold text-[var(--muted)]">
                  DrKard will pace your {exam.name} drills toward this date.
                </p>
              )}
            </div>
          </div>
        )}

        {step === "goal" && (
          <div className="animate-rise">
            <div className="mb-8 flex items-start gap-4">
              <span className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-base font-black text-white">
                Dk
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                What&apos;s your daily study goal?
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {GOALS.map((goal) => {
                const selected = state.dailyGoal === goal.value;
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => patch({ dailyGoal: goal.value })}
                    className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 px-3 py-6 transition ${
                      selected
                        ? "border-[var(--sky)] bg-[#ddf4ff]"
                        : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span
                      className="mb-4 grid h-20 w-20 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(#1cb0f6 ${goal.fill}%, #e5e5e5 0)`,
                      }}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black">
                        {goal.value}
                      </span>
                    </span>
                    <span className="text-lg font-extrabold">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "schedule" && (
          <div className="animate-rise">
            <div className="mb-8 flex items-start gap-4">
              <span className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-base font-black text-white">
                Dk
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                How will studying fit into your day?
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {SCHEDULES.map((item) => {
                const selected = state.studyTime === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => patch({ studyTime: item.value })}
                    className={`flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 px-4 py-6 text-center transition ${
                      selected
                        ? "border-[var(--sky)] bg-[#ddf4ff]"
                        : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mb-5 h-16 w-16 rounded-full bg-gradient-to-br ${item.tone}`}
                    />
                    <span className="text-base font-extrabold leading-snug">
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
            <div className="mb-8 grid h-28 w-28 place-items-center rounded-full bg-[var(--brand-soft)]">
              <span className="block h-16 w-10 rotate-12 rounded-md bg-[var(--brand)] shadow-[4px_4px_0_var(--brand-deep)]" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
              Your plan is ready
            </h1>
            <p className="mt-4 max-w-xl text-xl font-semibold text-[var(--muted)]">
              {exam?.name ?? "Exam"} · {formatRemaining(remaining)} ·{" "}
              {state.dailyGoal ?? 20} min / day
            </p>
            <div className="mt-10 w-full max-w-xl rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-6 text-left">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                Next up
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--ink)]">
                Start a short placement-style practice set
              </p>
              <Link
                href={`/practice?exam=${state.examId ?? "sat"}`}
                className="mt-4 inline-flex text-lg font-extrabold text-[var(--sky)]"
              >
                Jump into practice →
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-[var(--line)] bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl justify-end">
          <PillButton
            onClick={next}
            disabled={!canContinue}
            variant={
              canContinue ? (step === "ready" ? "brand" : "primary") : "disabled"
            }
            className="max-w-xs"
          >
            {step === "ready" ? "Go to dashboard" : "Continue"}
          </PillButton>
        </div>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-white font-bold text-[var(--muted)]">
          Loading onboarding…
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
