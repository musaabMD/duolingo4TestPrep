"use client";

import { useState } from "react";
import { SubjectPerformance } from "@/components/SubjectPerformance";
import { daysUntil, formatRemaining, getExam } from "@/lib/exams";
import { useOnboardingStore, useStreak, useXp } from "@/lib/hooks";
import type { ExamId } from "@/lib/types";

export function ExamWorkspace() {
  const profile = useOnboardingStore();
  const xp = useXp();
  const streak = useStreak();
  const remaining = daysUntil(profile.examDate);
  const exam = getExam(profile.examId);
  const examId = (profile.examId ?? "sat") as ExamId;
  const topics = exam?.topics ?? ["Warm-up", "Core skills", "Review"];
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  return (
    <section className="w-full">
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="mb-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-deep)]">
              {exam?.name ?? "Exam"} path
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Subjects
            </h2>
            <p className="mt-1 font-semibold text-[var(--muted)]">
              Tap a subject for review, restart, or fresh practice.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic, i) => (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                className="rounded-2xl border-2 border-[var(--line)] bg-white p-5 text-left transition hover:border-[var(--brand)] hover:bg-[var(--surface)]"
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                  Unit {i + 1}
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--ink)]">{topic}</p>
                <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                  {60 + ((i * 11) % 35)}% recent accuracy
                </p>
              </button>
            ))}
          </div>

          {activeTopic && (
            <SubjectPerformance
              topic={activeTopic}
              examId={examId}
              accuracy={60 + ((topics.indexOf(activeTopic) * 11) % 35)}
              onClose={() => setActiveTopic(null)}
            />
          )}
        </div>

        <aside className="grid gap-4">
          <div className="rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
              Countdown
            </p>
            <p className="mt-2 text-5xl font-black text-[var(--ink)]">
              {remaining === null ? "—" : Math.max(remaining, 0)}
            </p>
            <p className="mt-1 font-extrabold text-[var(--brand-deep)]">
              {formatRemaining(remaining)}
            </p>
          </div>
          <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
              Streak
            </p>
            <p className="mt-2 text-3xl font-black">
              {streak}
              <span className="ml-2 text-base font-extrabold text-[var(--brand)]">days</span>
            </p>
          </div>
          <div className="rounded-3xl border-2 border-[var(--line)] bg-white p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
              Total XP
            </p>
            <p className="mt-2 text-3xl font-black">
              {xp}
              <span className="ml-2 text-[var(--brand)]">✦</span>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
