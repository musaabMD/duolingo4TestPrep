"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EXAMS } from "@/lib/exams";
import type { ExamId } from "@/lib/types";

const EXAM_STYLES: Record<ExamId, string> = {
  sat: "bg-[#eb1748]",
  act: "bg-[#079b71]",
  mcat: "bg-[#7c35ef]",
  usmle: "bg-[#2d66e8]",
  gre: "bg-[#ff7412]",
  lsat: "bg-[#117d72]",
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleExams = EXAMS.filter(
    (exam) =>
      !normalizedQuery ||
      exam.name.toLowerCase().includes(normalizedQuery) ||
      exam.blurb.toLowerCase().includes(normalizedQuery) ||
      exam.topics.some((topic) => topic.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div className="min-h-dvh w-full bg-[#f6f7f9]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">
            Choose your exam
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-[var(--muted)]">
            Pick a track and build a daily plan around your test date.
          </p>
          <div className="mx-auto mt-7 max-w-2xl">
            <label className="relative block"><span className="sr-only">Filter exams</span><svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4" strokeLinecap="round"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter exams or topics…" className="min-h-14 w-full rounded-full border-2 border-[var(--line)] bg-white pl-14 pr-5 text-base font-semibold outline-none shadow-[0_8px_24px_rgba(15,40,28,0.06)] transition focus:border-[var(--brand)]"/></label>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available exams">
          {visibleExams.map((exam) => (
            <Link
              key={exam.id}
              href={`/onboarding?exam=${exam.id}&fresh=1&step=date`}
              className={`group relative min-h-44 overflow-hidden rounded-[1.25rem] p-5 text-white shadow-[0_7px_16px_rgba(21,32,50,0.11)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(21,32,50,0.16)] ${EXAM_STYLES[exam.id]}`}
            >
              <h2 className="relative z-10 max-w-[75%] text-2xl font-black leading-tight tracking-tight">
                {exam.name}
              </h2>
              <span
                aria-hidden
                className="absolute -bottom-14 -right-9 h-40 w-44 rotate-[-4deg] rounded-[1.25rem] bg-white/95 shadow-[-10px_-10px_28px_rgba(0,0,0,0.08)] transition duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
                style={{ clipPath: "polygon(32% 0, 100% 18%, 100% 100%, 0 100%)" }}
              />
            </Link>
          ))}
          {visibleExams.length === 0 ? <div className="col-span-full rounded-3xl bg-white p-10 text-center"><h2 className="text-2xl font-black">No matching exams</h2><p className="mt-2 font-semibold text-[var(--muted)]">Try a different exam name or topic.</p></div> : null}
        </section>
      </main>
    </div>
  );
}
