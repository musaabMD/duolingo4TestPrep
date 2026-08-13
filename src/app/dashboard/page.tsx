"use client";

import Link from "next/link";
import { ExamWorkspace } from "@/components/ExamWorkspace";
import { SearchBox } from "@/components/SearchBox";
import { SiteHeader } from "@/components/SiteHeader";
import { getExam } from "@/lib/exams";
import { useOnboardingStore } from "@/lib/hooks";

export default function DashboardPage() {
  const profile = useOnboardingStore();
  const exam = getExam(profile.examId);

  return (
    <div className="min-h-dvh w-full bg-white">
      <SiteHeader compact />

      <main className="w-full px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-rise">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-deep)]">
              Your prep hub
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
              DrKard
            </h1>
            <p className="mt-2 max-w-2xl text-lg font-semibold text-[var(--muted)]">
              {exam
                ? `${exam.name} subjects, review, and daily drills.`
                : "Finish onboarding to lock in your exam date and plan."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/practice?exam=${profile.examId ?? "sat"}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand)] px-6 text-base font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
            >
              Continue practice
            </Link>
          </div>
        </div>

        <div className="mb-10 max-w-2xl animate-rise-delay">
          <SearchBox placeholder="Search topics or jump to an exam…" />
        </div>

        <ExamWorkspace />
      </main>
    </div>
  );
}
