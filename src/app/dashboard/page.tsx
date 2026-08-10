"use client";

import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { SiteHeader } from "@/components/SiteHeader";
import { daysUntil, formatRemaining, getExam } from "@/lib/exams";
import { useOnboardingStore, useStreak, useXp } from "@/lib/hooks";

export default function DashboardPage() {
  const profile = useOnboardingStore();
  const xp = useXp();
  const streak = useStreak();
  const remaining = daysUntil(profile.examDate);
  const exam = getExam(profile.examId);

  return (
    <div className="min-h-dvh w-full bg-white">
      <SiteHeader compact />

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 sm:px-8 lg:px-12">
        <div className="animate-rise">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-deep)]">
            Your prep hub
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
            DrKard
          </h1>
          <p className="mt-2 max-w-2xl text-lg font-semibold text-[var(--muted)]">
            {exam
              ? `${exam.name} countdown and daily drills in one place.`
              : "Finish onboarding to lock in your exam date and plan."}
          </p>
        </div>

        <div className="mt-6 max-w-2xl animate-rise-delay">
          <SearchBox placeholder="Search topics or jump to an exam…" />
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
              Exam date
            </p>
            <p className="mt-3 text-6xl font-black text-[var(--ink)] sm:text-7xl">
              {remaining === null ? "—" : Math.max(remaining, 0)}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--brand-deep)]">
              {formatRemaining(remaining)}
            </p>
            <p className="mt-4 text-lg font-semibold text-[var(--muted)]">
              {exam?.name ?? "No exam selected"}
              {profile.examDate ? ` · ${profile.examDate}` : ""}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/practice?exam=${profile.examId ?? "sat"}`}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--brand)] px-8 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
              >
                Continue practice
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-white px-8 text-lg font-extrabold text-[var(--ink)]"
              >
                {profile.completed ? "Edit plan" : "Start onboarding"}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Streak
              </p>
              <p className="mt-2 text-4xl font-black text-[var(--ink)]">
                {streak}
                <span className="ml-2 text-lg font-extrabold text-[var(--brand)]">
                  days
                </span>
              </p>
            </div>
            <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Total XP
              </p>
              <p className="mt-2 text-4xl font-black text-[var(--ink)]">
                {xp}
                <span className="ml-2 text-[var(--brand)]">✦</span>
              </p>
            </div>
            <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Daily goal
              </p>
              <p className="mt-2 text-2xl font-black text-[var(--ink)]">
                {profile.dailyGoal ? `${profile.dailyGoal} min` : "Not set"}
              </p>
              <p className="mt-1 font-semibold capitalize text-[var(--muted)]">
                {profile.studyTime
                  ? profile.studyTime.replace("-", " ")
                  : "Pick a study time"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border-2 border-[var(--line)] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-[var(--ink)]">Today&apos;s path</h2>
          <p className="mt-1 font-semibold text-[var(--muted)]">
            Short MCQ sets keep you exam-ready.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(exam?.topics ?? ["Warm-up", "Core skills", "Review"]).map(
              (topic, i) => (
                <Link
                  key={topic}
                  href={`/practice?exam=${profile.examId ?? "sat"}`}
                  className="rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand)]"
                >
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                    Set {i + 1}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--ink)]">
                    {topic}
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
