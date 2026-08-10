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
    <div className="min-h-dvh bg-[var(--background)]">
      <div className="hero-atmosphere absolute inset-x-0 top-0 -z-10 h-80" />
      <SiteHeader compact />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-8">
        <div className="animate-rise">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-deep)]">
            Your prep hub
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
            DrKard
          </h1>
          <p className="mt-2 max-w-xl text-lg font-semibold text-[var(--muted)]">
            {exam
              ? `${exam.name} countdown and daily drills in one place.`
              : "Finish onboarding to lock in your exam date and plan."}
          </p>
        </div>

        <div className="mt-6 animate-rise-delay">
          <SearchBox placeholder="Search topics or jump to an exam…" />
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] bg-[var(--ink)] p-6 text-white shadow-[0_24px_50px_rgba(15,40,28,0.18)]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/55">
              Exam date
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold sm:text-6xl">
              {remaining === null ? "—" : Math.max(remaining, 0)}
            </p>
            <p className="mt-2 text-xl font-bold text-[var(--brand-soft)]">
              {formatRemaining(remaining)}
            </p>
            <p className="mt-4 font-semibold text-white/70">
              {exam?.name ?? "No exam selected"}
              {profile.examDate ? ` · ${profile.examDate}` : ""}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/practice?exam=${profile.examId ?? "sat"}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-extrabold text-[var(--ink)]"
              >
                Continue practice
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/10 px-6 font-extrabold text-white"
              >
                {profile.completed ? "Edit plan" : "Start onboarding"}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border-2 border-[var(--line)] bg-white p-5">
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
            <div className="rounded-[1.75rem] border-2 border-[var(--line)] bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
                Total XP
              </p>
              <p className="mt-2 text-4xl font-black text-[var(--ink)]">
                {xp}
                <span className="ml-2 text-[var(--brand)]">✦</span>
              </p>
            </div>
            <div className="rounded-[1.75rem] border-2 border-[var(--line)] bg-white p-5">
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

        <section className="mt-8 rounded-[1.75rem] border-2 border-[var(--line)] bg-white p-6">
          <h2 className="text-xl font-extrabold">Today&apos;s path</h2>
          <p className="mt-1 font-semibold text-[var(--muted)]">
            Short sets keep you exam-ready without marathon sessions.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(exam?.topics ?? ["Warm-up", "Core skills", "Review"]).map(
              (topic, i) => (
                <Link
                  key={topic}
                  href={`/practice?exam=${profile.examId ?? "sat"}`}
                  className="rounded-2xl bg-[var(--mint)] p-4 transition hover:brightness-95"
                >
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                    Set {i + 1}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[var(--ink)]">
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
