"use client";

import Link from "next/link";
import type { ExamId } from "@/lib/types";

export type SubjectPerformanceProps = {
  topic: string;
  examId: ExamId;
  accuracy?: number;
  onClose: () => void;
};

export function SubjectPerformance({
  topic,
  examId,
  accuracy = 72,
  onClose,
}: SubjectPerformanceProps) {
  const practiceHref = `/practice?exam=${examId}&topic=${encodeURIComponent(topic)}`;
  const reviewHref = `/practice?exam=${examId}&topic=${encodeURIComponent(topic)}&mode=review`;
  const restartHref = `/practice?exam=${examId}&topic=${encodeURIComponent(topic)}&mode=restart`;
  const weakHref = `/practice?exam=${examId}&topic=${encodeURIComponent(topic)}&mode=weak`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="animate-rise relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">
              Subject
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{topic}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full text-[#afafaf] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--muted)]">
            Recent accuracy
          </p>
          <p className="mt-1 text-4xl font-black text-[var(--ink)]">
            {accuracy}
            <span className="ml-1 text-xl font-extrabold text-[var(--brand)]">%</span>
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Link
            href={restartHref}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#d4d4d4] bg-[#f0f0f0] px-3 text-center text-sm font-extrabold text-[var(--ink)] transition hover:bg-[#e8e8e8]"
          >
            Start over
          </Link>
          <Link
            href={reviewHref}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-white px-3 text-center text-sm font-extrabold text-[var(--ink)] transition hover:bg-[var(--surface)]"
          >
            Review
          </Link>
          <Link
            href={weakHref}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-white px-3 text-center text-sm font-extrabold text-[var(--ink)] transition hover:bg-[var(--surface)]"
          >
            Practice weak
          </Link>
        </div>

        <Link
          href={practiceHref}
          className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--brand)] px-6 text-lg font-extrabold text-white shadow-[0_4px_0_var(--brand-deep)]"
        >
          Start practice
        </Link>
      </section>
    </div>
  );
}
