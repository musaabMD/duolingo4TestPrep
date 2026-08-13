"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { EXAMS } from "@/lib/exams";
import { QUESTIONS } from "@/lib/questions";

type SearchBoxProps = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export function SearchBox({
  placeholder = "Search exams, topics, or practice…",
  className = "",
  autoFocus = false,
}: SearchBoxProps) {
  const id = useId();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const open = focused && q.length > 0;
  const examHits =
    q.length === 0
      ? []
      : EXAMS.filter(
          (exam) =>
            exam.name.toLowerCase().includes(q) ||
            exam.blurb.toLowerCase().includes(q) ||
            exam.topics.some((t) => t.toLowerCase().includes(q)),
        ).slice(0, 4);
  const questionHits =
    q.length === 0
      ? []
      : QUESTIONS.filter(
          (question) =>
            question.prompt.toLowerCase().includes(q) ||
            question.topic.toLowerCase().includes(q),
        ).slice(0, 4);

  function go(path: string) {
    setFocused(false);
    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search DrKard
      </label>
      <div className="flex items-center gap-3 rounded-full border-2 border-[var(--ink-soft)] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,40,28,0.06)] transition focus-within:border-[var(--brand)]">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id={id}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && examHits[0]) {
              go(`/onboarding?exam=${examHits[0].id}&fresh=1&step=date`);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-semibold text-[var(--ink)] outline-none placeholder:font-medium placeholder:text-[var(--muted)]"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[0_18px_50px_rgba(15,40,28,0.12)]">
          {examHits.length === 0 && questionHits.length === 0 ? (
            <p className="px-4 py-5 text-sm text-[var(--muted)]">
              No matches. Try SAT, MCAT, algebra, or pathology.
            </p>
          ) : (
            <ul className="max-h-80 overflow-auto py-2">
              {examHits.map((exam) => (
                <li key={exam.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(`/onboarding?exam=${exam.id}&fresh=1&step=date`)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--mint)]"
                  >
                    <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">
                      {exam.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block font-bold text-[var(--ink)]">
                        {exam.name}
                      </span>
                      <span className="block text-sm text-[var(--muted)]">
                        {exam.blurb}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {questionHits.map((question) => (
                <li key={question.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(`/practice?exam=${question.examId}&question=1`)}
                    className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-[var(--mint)]"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                      {question.topic}
                    </span>
                    <span className="line-clamp-2 font-semibold text-[var(--ink)]">
                      {question.prompt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
