"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getExam } from "@/lib/exams";
import { useExamPlans, useOnboardingStore, useReviewRecords } from "@/lib/hooks";
import { QUESTIONS } from "@/lib/questions";
import { toggleReviewFlag } from "@/lib/storage";
import type { ExamId, ReviewRecord } from "@/lib/types";

type Filter = "all" | "flagged" | "incorrect" | "correct";

function FlagButton({ record }: { record: ReviewRecord }) {
  return (
    <button
      type="button"
      onClick={() => toggleReviewFlag(record.questionId)}
      aria-label={record.flagged ? "Remove flag" : "Flag question"}
      aria-pressed={record.flagged}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 transition ${record.flagged ? "border-[#ffb020] bg-[#fff6df] text-[#c77800]" : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface)]"}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={record.flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M5 21V4h11l-2 4 4 4H5" strokeLinejoin="round" /></svg>
    </button>
  );
}

function ReviewExamSwitcher({ plans, examId, onSelect }: { plans: ReturnType<typeof useExamPlans>; examId: ExamId; onSelect: (id: ExamId) => void }) {
  const [open, setOpen] = useState(false);
  const activeExam = getExam(examId);
  if (!activeExam || plans.length < 2) return null;
  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} className="inline-flex min-h-12 items-center gap-3 rounded-2xl border-2 border-[var(--line)] bg-white px-3 pr-4 font-black shadow-sm transition hover:border-[#bec5cc]">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--ink)] text-[10px] text-white">{activeExam.name.slice(0, 2)}</span>
      <span>{activeExam.name}</span>
      <svg viewBox="0 0 24 24" className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m7 9 5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
    {open ? <><button type="button" aria-label="Close exam menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default"/><div role="menu" className="absolute right-0 top-14 z-40 w-64 rounded-3xl border-2 border-[var(--line)] bg-white p-2 shadow-[0_20px_55px_rgba(21,32,50,0.16)]">{plans.map((plan) => { const item = getExam(plan.examId); return item ? <button key={item.id} role="menuitem" type="button" onClick={() => { onSelect(item.id); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left font-black transition ${item.id === examId ? "bg-[#e9f5ff] text-[#1674a8]" : "hover:bg-[var(--surface)]"}`}><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--ink)] text-[10px] text-white">{item.name.slice(0, 2)}</span><span className="flex-1">{item.name}</span>{item.id === examId ? <span aria-hidden>✓</span> : null}</button> : null; })}</div></> : null}
  </div>;
}

function ReviewDetail({ records, activeRecord, examId, filter }: { records: ReviewRecord[]; activeRecord: ReviewRecord; examId: ExamId; filter: Filter }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const question = QUESTIONS.find((item) => item.id === activeRecord.questionId);
  if (!question) return null;
  const index = records.findIndex((record) => record.questionId === activeRecord.questionId);
  const previous = records[index - 1];
  const next = records[index + 1];
  const backHref = `/review?exam=${examId}&filter=${filter}`;
  const detailHref = (record: ReviewRecord) => `/review?exam=${examId}&filter=${filter}&question=${record.questionId}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f5f7fa]">
      <header className="shrink-0 border-b border-[var(--line)] bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2"><Link href={backHref} aria-label="Back to review" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--line)] bg-white text-[var(--ink)] transition hover:bg-[var(--surface)]"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg></Link><button type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label={sidebarOpen ? "Hide question list" : "Show question list"} aria-pressed={sidebarOpen} className={`inline-flex h-10 items-center gap-2 rounded-xl border-2 px-3 text-sm font-black transition ${sidebarOpen ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--ink)]"}`}><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg><span className="hidden sm:inline">Questions</span></button><p className="truncate text-sm font-black capitalize text-[var(--muted)]">{filter === "all" ? "All answered" : filter}</p></div>
          <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm font-black tabular-nums text-[var(--ink)]">{index + 1} / {records.length}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`shrink-0 overflow-hidden border-r border-[var(--line)] bg-white transition-[width,opacity] duration-200 ${sidebarOpen ? "w-[300px] opacity-100" : "w-0 opacity-0"}`} aria-hidden={!sidebarOpen}>
          <div className="flex h-16 items-center justify-between px-5"><div><p className="font-black text-[var(--ink)]">Question navigator</p><p className="text-xs font-bold text-[var(--muted)]">{records.length} in this set</p></div><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Hide question list" className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)]">✕</button></div>
          <div className="max-h-[calc(100dvh-125px)] space-y-2 overflow-y-auto px-3 pb-4">
            {records.map((record) => {
              const item = QUESTIONS.find((candidate) => candidate.id === record.questionId);
              return item ? <Link key={record.questionId} href={detailHref(record)} aria-label={item.prompt} className={`block rounded-2xl border-2 p-4 text-sm font-bold leading-snug transition ${record.questionId === activeRecord.questionId ? "border-[#79bfe7] bg-[#eaf6fd] text-[var(--ink)]" : "border-transparent bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line)] hover:text-[var(--ink)]"}`}><div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-black uppercase tracking-wide">{item.topic}</span><span className={`h-2.5 w-2.5 rounded-full ${record.correct ? "bg-[#23966f]" : "bg-[#d9565b]"}`}/></div><span className="line-clamp-4">{item.prompt}</span></Link> : null;
            })}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f8fa]">
          <div className="grid min-h-0 flex-1 overflow-y-auto xl:grid-cols-[1.05fr_.95fr]">
            <section className="bg-white p-6 sm:p-10 xl:p-14">
              <div className="flex items-start justify-between gap-4"><p className="text-sm font-bold text-[var(--muted)]">{question.topic}</p><FlagButton record={activeRecord} /></div>
              <h1 className="mt-3 text-2xl font-black leading-snug text-[var(--ink)] sm:text-3xl">{question.prompt}</h1>
              <div className="mt-8 space-y-3">
                {question.choices.map((choice, choiceIndex) => {
                  const isCorrect = choiceIndex === question.correctIndex;
                  const isSelected = choiceIndex === activeRecord.selectedIndex;
                  const style = isCorrect ? "border-[#00a878] bg-[#eafaf4]" : isSelected ? "border-[#ff4b4b] bg-[#fff0f0]" : "border-[var(--line)] bg-white";
                  return <div key={choice} className={`relative overflow-hidden rounded-xl border-2 p-4 ${style}`}><div className="flex items-center justify-between gap-4"><span className="font-bold text-[var(--ink)]">{String.fromCharCode(65 + choiceIndex)}. {choice}</span>{isCorrect ? <span className="font-black text-[#008c65]">Correct</span> : isSelected ? <span className="font-black text-[#d92f2f]">Your answer</span> : null}</div><div className="absolute inset-x-0 bottom-0 h-1 bg-[#e8edf0]"><div className="h-full" style={{ width: `${isCorrect ? 64 : isSelected ? 18 : 9 + choiceIndex * 3}%`, backgroundColor: isCorrect ? "#00a878" : isSelected ? "#ff4b4b" : "#8ba0ad" }} /></div></div>;
                })}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#e9f2ff] p-4 text-center"><p className="text-2xl font-black">1</p><p className="text-xs font-bold text-[var(--muted)]">Your attempts</p></div><div className={`rounded-xl p-4 text-center ${activeRecord.correct ? "bg-[#e8f7f2]" : "bg-[#fff0f0]"}`}><p className={`text-2xl font-black ${activeRecord.correct ? "text-[#008c65]" : "text-[#d92f2f]"}`}>{activeRecord.correct ? "Correct" : "Incorrect"}</p><p className="text-xs font-bold text-[var(--muted)]">Your result</p></div></div>
            </section>

            <aside className="border-t border-[var(--line)] bg-[#fbfcfd] p-6 sm:p-10 xl:border-l xl:border-t-0 xl:p-14">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--brand-deep)]">Explanation</p>
              <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">Why this answer works</h2>
              <p className="mt-5 text-lg font-semibold leading-relaxed text-[var(--muted)]">{question.explanation}</p>
              <div className="mt-8 rounded-2xl border-2 border-[var(--line)] bg-white p-5"><p className="text-sm font-black uppercase tracking-wide text-[var(--muted)]">Correct answer</p><p className="mt-2 text-lg font-extrabold text-[var(--ink)]">{question.choices[question.correctIndex]}</p></div>
              {!activeRecord.correct && <p className="mt-5 rounded-xl bg-[#fff6df] p-4 font-bold text-[#8c5b00]">Add this concept to your next practice set and try it again while the explanation is fresh.</p>}
            </aside>
          </div>
          <footer className="flex items-center justify-between border-t border-[var(--line)] bg-white p-4"><Link aria-disabled={!previous} href={previous ? detailHref(previous) : detailHref(activeRecord)} className={`rounded-xl px-5 py-3 font-extrabold ${previous ? "bg-[var(--surface)]" : "pointer-events-none opacity-35"}`}>← Previous</Link><Link aria-disabled={!next} href={next ? detailHref(next) : detailHref(activeRecord)} className={`rounded-xl px-5 py-3 font-extrabold text-white ${next ? "bg-[var(--ink)]" : "pointer-events-none bg-[var(--muted)] opacity-35"}`}>Next →</Link></footer>
        </main>
      </div>
    </div>
  );
}

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useOnboardingStore();
  const plans = useExamPlans();
  const allRecords = useReviewRecords();
  const examId = (params.get("exam") as ExamId | null) ?? plans[0]?.examId ?? profile.examId ?? "sat";
  const filter = (["all", "flagged", "incorrect", "correct"].includes(params.get("filter") || "") ? params.get("filter") : "all") as Filter;
  const subject = params.get("subject") ?? "all";
  const questionId = params.get("question");
  const [search, setSearch] = useState("");
  const exam = getExam(examId);
  const records = allRecords.filter((record) => record.examId === examId && QUESTIONS.some((question) => question.id === record.questionId));
  const filtered = useMemo(() => records.filter((record) => {
    const question = QUESTIONS.find((item) => item.id === record.questionId);
    if (!question) return false;
    if (filter === "flagged" && !record.flagged) return false;
    if (filter === "incorrect" && record.correct) return false;
    if (filter === "correct" && !record.correct) return false;
    if (subject !== "all" && question.topic !== subject) return false;
    return `${question.topic} ${question.prompt}`.toLowerCase().includes(search.toLowerCase());
  }), [records, filter, subject, search]);
  const activeRecord = records.find((record) => record.questionId === questionId);
  if (activeRecord) return <ReviewDetail records={filtered.some((item) => item.questionId === activeRecord.questionId) ? filtered : records} activeRecord={activeRecord} examId={examId} filter={filter} />;

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    next.delete("question");
    router.push(`/review?${next.toString()}`, { scroll: false });
  }
  const counts = { all: records.length, flagged: records.filter((record) => record.flagged).length, incorrect: records.filter((record) => !record.correct).length, correct: records.filter((record) => record.correct).length };
  const topics = Array.from(new Set(records.map((record) => QUESTIONS.find((question) => question.id === record.questionId)?.topic).filter(Boolean))) as string[];

  return (
    <div className="min-h-dvh bg-[#f5f7fa]">
      <SiteHeader compact />
      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Link href="/dashboard" aria-label="Back to dashboard" className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[var(--line)] bg-white text-[var(--ink)] shadow-sm transition hover:bg-[var(--surface)]"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg></Link><h1 className="text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">Review</h1></div><ReviewExamSwitcher plans={plans} examId={examId} onSelect={(id) => setParam("exam", id)}/></div>

        <div className="mx-auto mt-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#e9edf1] p-1.5">
          {(["all", "flagged", "incorrect", "correct"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setParam("filter", item)} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black capitalize transition ${filter === item ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}><span>{item}</span><span className={`grid min-w-6 place-items-center rounded-lg px-1.5 py-0.5 text-xs ${filter === item ? "bg-[var(--ink)] text-white" : "bg-white/70"}`}>{counts[item]}</span></button>)}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative"><span className="sr-only">Search answered questions</span><svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search answered questions" className="min-h-14 w-full rounded-xl border-2 border-[var(--line)] bg-white pl-12 pr-4 font-semibold outline-none focus:border-[var(--brand)]" /></label><select aria-label="Filter by subject" value={subject} onChange={(event) => setParam("subject", event.target.value)} className="min-h-14 rounded-xl border-2 border-[var(--line)] bg-white px-4 font-extrabold text-[var(--brand-deep)] outline-none"><option value="all">All subjects</option>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></div>

        {filtered.length ? <div className="mt-6 space-y-3">{filtered.map((record) => { const question = QUESTIONS.find((item) => item.id === record.questionId); if (!question) return null; return <article key={record.questionId} className="flex items-start gap-3 rounded-2xl border-2 border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--ink)] sm:p-6"><Link href={`/review?exam=${examId}&filter=${filter}&subject=${encodeURIComponent(subject)}&question=${question.id}`} className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold text-[var(--muted)]">{question.topic}</p><span className={`rounded-full px-2 py-0.5 text-xs font-black ${record.correct ? "bg-[#e8f7f2] text-[#008c65]" : "bg-[#fff0f0] text-[#d92f2f]"}`}>{record.correct ? "Correct" : "Incorrect"}</span></div><h2 className="mt-2 text-lg font-bold leading-relaxed text-[var(--ink)] sm:text-xl">{question.prompt}</h2></Link><div className="flex items-center gap-2"><FlagButton record={record} /><span aria-label={record.correct ? "Correct answer" : "Incorrect answer"} className={`grid h-11 w-11 place-items-center rounded-xl text-2xl font-black ${record.correct ? "bg-[#e8f7f2] text-[#00a878]" : "bg-[#fff0f0] text-[#ff4b4b]"}`}>{record.correct ? "✓" : "×"}</span></div></article>; })}</div> : <section className="mt-8 rounded-3xl border-2 border-dashed border-[var(--line)] bg-white p-10 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface)] text-2xl">✓</div><h2 className="mt-4 text-2xl font-black">{records.length ? "No questions match this filter" : `No ${exam?.name ?? "exam"} answers yet`}</h2><p className="mx-auto mt-2 max-w-md font-semibold text-[var(--muted)]">Answer a practice question and it will appear here with its explanation and result.</p><Link href={`/practice?exam=${examId}&question=1`} className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-[var(--brand)] px-6 font-extrabold text-white shadow-[0_3px_0_var(--brand-deep)]">Start practice</Link></section>}
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center font-bold text-[var(--muted)]">Loading review…</div>}><ReviewInner /></Suspense>;
}
