"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ExamDatePicker } from "@/components/ExamDatePicker";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { daysUntil, EXAMS, formatRemaining, getExam } from "@/lib/exams";
import { useExamPlans, useOnboardingStore } from "@/lib/hooks";
import { defaultOnboarding, saveOnboarding } from "@/lib/storage";
import type {
  DailyGoal,
  ExamId,
  KnowledgeLevel,
  OnboardingState,
  StudyTime,
} from "@/lib/types";

const STEPS = [
  "welcome",
  "exam",
  "date",
  "level",
  "goal",
  "schedule",
  "ready",
] as const;

const LEVELS: { value: KnowledgeLevel; label: string; detail: string }[] = [
  { value: "beginner", label: "Building foundations", detail: "I need help with the core concepts" },
  { value: "intermediate", label: "Making progress", detail: "I know the basics but have gaps" },
  { value: "advanced", label: "Aiming high", detail: "I’m refining speed and exam strategy" },
];

const GOALS: { value: DailyGoal; label: string; fill: number }[] = [
  { value: 10, label: "10 min", fill: 20 },
  { value: 20, label: "20 min", fill: 40 },
  { value: 30, label: "30 min", fill: 60 },
  { value: 60, label: "60 min", fill: 100 },
];

const SCHEDULES: {
  value: StudyTime;
  label: string;
  icon: "sun" | "mug" | "moon" | "calendar";
  tone: string;
}[] = [
  { value: "morning", label: "Morning", icon: "sun", tone: "bg-[#fff4d6] text-[#c98500]" },
  { value: "afternoon", label: "Afternoon", icon: "mug", tone: "bg-[#ffe8d6] text-[#d46b1c]" },
  { value: "night", label: "At night", icon: "moon", tone: "bg-[#ebe4ff] text-[#6b5bdb]" },
  { value: "flexible", label: "Flexible", icon: "calendar", tone: "bg-[#e8f4ff] text-[#1674a8]" },
];

function ScheduleIcon({ name }: { name: (typeof SCHEDULES)[number]["icon"] }) {
  if (name === "sun") return <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2 6 6M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" strokeLinecap="round"/></svg>;
  if (name === "mug") return <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" strokeLinejoin="round"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3.5c.6 1.1.6 2.2 0 3.3M11.5 3.5c.6 1.1.6 2.2 0 3.3" strokeLinecap="round"/></svg>;
  if (name === "moon") return <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 15a7.5 7.5 0 0 1-9.8-9.8A7.5 7.5 0 1 0 19.9 15Z" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round"/></svg>;
}

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
  const isAdding = params.get("add") === "1";
  const isFresh = params.get("fresh") === "1";
  const hasPresetExam = Boolean(
    presetExam && EXAMS.some((exam) => exam.id === presetExam),
  );
  const stored = useOnboardingStore();
  const savedPlans = useExamPlans();
  const presetPlan = savedPlans.find((plan) => plan.examId === presetExam);

  const requestedStep = params.get("step");
  const requestedStepIndex = STEPS.indexOf(
    requestedStep as (typeof STEPS)[number],
  );
  const stepIndex =
    requestedStepIndex >= 0
      ? requestedStepIndex
      : hasPresetExam
        ? 2
        : isAdding
          ? 1
          : 0;
  const [draft, setDraft] = useState<Partial<OnboardingState> | null>(null);

  const state = useMemo(
    () =>
      mergeDraft(
        isAdding || isFresh || (hasPresetExam && !presetPlan)
          ? defaultOnboarding
          : presetPlan ?? stored,
        draft,
        presetExam,
      ),
    [stored, draft, presetExam, isAdding, isFresh, hasPresetExam, presetPlan],
  );

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const exam = getExam(state.examId);
  const remaining = daysUntil(state.examDate);

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "exam") return Boolean(state.examId);
    if (step === "date") return Boolean(state.examDate);
    if (step === "level") return Boolean(state.knowledgeLevel);
    if (step === "goal") return Boolean(state.dailyGoal);
    if (step === "schedule") return Boolean(state.studyTime);
    return true;
  }, [step, state]);

  function patch(partial: Partial<OnboardingState>) {
    const next = { ...state, ...partial };
    setDraft(next);
    saveOnboarding(next);
    if (isFresh) {
      const query = new URLSearchParams(params.toString());
      query.delete("fresh");
      router.replace(`/onboarding?${query.toString()}`, { scroll: false });
    }
  }

  function back() {
    if (hasPresetExam && stepIndex === 2) {
      router.back();
      return;
    }
    if (isAdding && stepIndex === 1) {
      router.push("/dashboard");
      return;
    }
    goToStep(stepIndex - 1);
  }

  function goToStep(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(STEPS.length - 1, nextIndex));
    const query = new URLSearchParams(params.toString());
    query.set("step", STEPS[safeIndex]);
    router.push(`/onboarding?${query.toString()}`, { scroll: false });
  }

  function next() {
    if (step === "ready") {
      const completed = { ...state, completed: true };
      setDraft(completed);
      saveOnboarding(completed);
      router.push("/dashboard");
      return;
    }
    goToStep(stepIndex + 1);
  }

  const minDateStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <header className="w-full border-b border-[var(--line)] bg-white px-4 py-4 sm:px-8">
        <div className="flex w-full items-center gap-5 sm:gap-8">
          <Link href="/" className="inline-flex shrink-0 items-center gap-2.5" aria-label="DrKard home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white shadow-[0_4px_0_var(--brand-deep)]">Dk</span>
            <span className="text-xl font-black tracking-tight text-[var(--ink)]">DrKard</span>
          </Link>
          <div className="mx-auto w-full max-w-5xl">
            <ProgressBar value={progress} showBack={stepIndex > 0} onBack={back} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-32 pt-10 sm:px-8 lg:px-12">
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
          <div className="animate-rise mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center pb-8">
            <div className="mb-10 text-center">
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
          <div className="animate-rise mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center pb-8">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                When is your {exam?.name ?? "exam"} date?
              </h1>
            </div>

            <div>
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Exam date
              </span>
              <ExamDatePicker
                min={minDateStr}
                value={state.examDate}
                onChange={(examDate) => patch({ examDate })}
              />
            </div>

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
          <div className="animate-rise mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center pb-8">
            <div className="mb-10 text-center">
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
                    onClick={() => {
                      patch({ dailyGoal: goal.value });
                      goToStep(stepIndex + 1);
                    }}
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

        {step === "level" && (
          <div className="animate-rise mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center pb-8">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-[var(--brand-deep)]">Quick level check</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                Where are you right now?
              </h1>
              <p className="mt-3 font-semibold text-[var(--muted)]">We’ll use this to set your starting difficulty. You can change it later.</p>
            </div>
            <div className="space-y-3">
              {LEVELS.map((item, index) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    patch({ knowledgeLevel: item.value });
                    goToStep(stepIndex + 1);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
                    state.knowledgeLevel === item.value
                      ? "border-[var(--brand)] bg-[var(--ok-soft)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] font-black text-[var(--ink)]">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-extrabold text-[var(--ink)]">{item.label}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-[var(--muted)]">{item.detail}</span>
                  </span>
                  <span aria-hidden className="text-xl text-[var(--muted)]">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "schedule" && (
          <div className="animate-rise mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center pb-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
                When do you usually study?
              </h1>
              <p className="mt-3 font-semibold text-[var(--muted)]">Pick the closest fit. We’ll make your plan flexible.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SCHEDULES.map((item) => {
                const selected = state.studyTime === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      patch({ studyTime: item.value });
                      goToStep(stepIndex + 1);
                    }}
                    className={`flex min-h-20 items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition ${
                      selected
                        ? "border-[var(--sky)] bg-[#ddf4ff]"
                        : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${item.tone}`} aria-hidden><ScheduleIcon name={item.icon}/></span>
                      <span className="block text-base font-extrabold leading-snug">{item.label}</span>
                    </span>
                    <span aria-hidden className="text-xl text-[var(--muted)]">→</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "ready" && (
          <div className="animate-rise flex flex-col items-center pt-8 text-center sm:pt-12">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-soft)] text-3xl font-black text-[var(--brand-deep)]">
              ✓
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
              Your {exam?.name ?? "exam"} plan is ready
            </h1>
            <p className="mt-3 max-w-lg text-lg font-semibold text-[var(--muted)]">
              Your daily plan is saved. Head to your dashboard to begin.
            </p>
          </div>
        )}
      </main>

      {step !== "level" && step !== "schedule" && <footer className="fixed inset-x-0 bottom-0 border-t border-[var(--line)] bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl justify-end">
          <PillButton
            onClick={next}
            disabled={!canContinue}
            variant={
              canContinue ? (step === "ready" ? "brand" : "primary") : "disabled"
            }
            className="max-w-sm"
          >
            {step === "ready" ? "Go to dashboard" : "Continue"}
          </PillButton>
        </div>
      </footer>}
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
