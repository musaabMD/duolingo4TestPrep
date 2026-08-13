"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EXAMS, getExam } from "@/lib/exams";
import { useOnboardingStore } from "@/lib/hooks";
import { saveOnboarding } from "@/lib/storage";
import type { ExamId } from "@/lib/types";

const EXAM_MARK: Record<ExamId, { bg: string; letters: string }> = {
  sat: { bg: "#ff4b6e", letters: "SA" },
  act: { bg: "#ff9600", letters: "AC" },
  mcat: { bg: "#ce82ff", letters: "MC" },
  usmle: { bg: "#1cb0f6", letters: "US" },
  gre: { bg: "#58cc02", letters: "GR" },
  lsat: { bg: "#ffc800", letters: "LS" },
};

export function ExamSwitcher() {
  const profile = useOnboardingStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getExam(profile.examId) ?? EXAMS[0];
  const mark = EXAM_MARK[current.id];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectExam(examId: ExamId) {
    saveOnboarding({ ...profile, examId });
    setOpen(false);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-2xl px-2 py-1.5 text-left transition hover:bg-[var(--surface)]"
      >
        <span
          className="grid h-9 w-9 place-items-center rounded-xl text-[11px] font-black text-white"
          style={{ background: mark.bg }}
        >
          {mark.letters}
        </span>
        <span className="hidden text-sm font-extrabold text-[var(--ink)] sm:inline">
          {current.name}
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#afafaf]" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-3 w-72 rounded-3xl border-2 border-[var(--line)] bg-white p-3 shadow-[0_20px_60px_rgba(21,32,50,0.18)]"
        >
          <p className="px-2 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#afafaf]">
            My exams
          </p>
          <div className="space-y-1">
            {EXAMS.map((exam) => {
              const selected = exam.id === current.id;
              const itemMark = EXAM_MARK[exam.id];
              return (
                <button
                  key={exam.id}
                  type="button"
                  role="menuitem"
                  onClick={() => selectExam(exam.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                    selected
                      ? "bg-[#e8f4ff] text-[#1674a8]"
                      : "text-[var(--ink)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-black text-white"
                    style={{ background: itemMark.bg }}
                  >
                    {itemMark.letters}
                  </span>
                  <span className="flex-1 text-base font-extrabold">{exam.name}</span>
                  {selected && (
                    <span className="text-lg font-black" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            <Link
              href="/onboarding"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left text-[var(--ink)] transition hover:bg-[var(--surface)]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--line)] bg-white text-xl font-black text-[var(--muted)]">
                ✎
              </span>
              <span>
                <span className="block text-base font-extrabold">Review and edit</span>
                <span className="block text-xs font-semibold text-[var(--muted)]">
                  Goal, date, and schedule
                </span>
              </span>
            </Link>

            <Link
              href="/onboarding"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left text-[var(--ink)] transition hover:bg-[var(--surface)]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--line)] bg-white text-xl font-black text-[var(--muted)]">
                +
              </span>
              <span className="text-base font-extrabold">Add exam</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
