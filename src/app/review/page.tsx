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
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f4f6f8]">
      <header className="shrink-0 border-b border-[#263a49] bg-[#173142] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2"><button type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label={sidebarOpen ? "Close question list" : "Open question list"} aria-pressed={sidebarOpen} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-[#ffd16a] hover:bg-white/15"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg></button><Link href={backHref} className="inline-flex items-center gap-2 font-extrabold text-[#ffd16a]">← Back to review</Link></div>
          <p className="hidden font-bold capitalize sm:block">{filter === "all" ? "All answered" : filter}</p>
          <p className="font-extrabold">{index + 1} / {records.length}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`flex shrink-0 flex-col overflow-hidden bg-[#102531] text-white transition-[width] duration-200 ${sidebarOpen ? "w-[270px]" : "w-16"}`}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4"><p className={`font-extrabold ${sidebarOpen ? "block" : "hidden"}`}>Questions</p><button type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label={sidebarOpen ? "Close question list" : "Open question list"} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#ffd16a] hover:bg-white/10"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d={sidebarOpen ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
          <div className="max-h-[calc(100dvh-150px)] overflow-y-auto">
            {records.map((record) => {
              const item = QUESTIONS.find((candidate) => candidate.id === record.questionId);
              return item ? <Link key={record.questionId} href={detailHref(record)} aria-label={item.prompt} className={`block border-b border-white/10 p-4 text-sm font-semibold leading-snug transition ${record.questionId === activeRecord.questionId ? "bg-[#536b79]" : "text-white/75 hover:bg-white/10"}`}>{sidebarOpen ? item.prompt : <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">{records.indexOf(record) + 1}</span>}</Link> : null;
            })}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="grid min-h-0 flex-1 overflow-y-auto xl:grid-cols-[1.05fr_.95fr]">
            <section className="p-6 sm:p-10 xl:p-14">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/dashboard" className="text-sm font-extrabold text-[var(--brand-deep)]">← Dashboard</Link><h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">Review Questions</h1><p className="mt-2 font-semibold text-[var(--muted)]">See what you know, revisit mistakes, and flag anything for later.</p></div>{plans.length > 1 && <select value={examId} onChange={(event) => setParam("exam", event.target.value)} className="min-h-12 rounded-2xl border-2 border-[var(--line)] bg-white px-4 font-extrabold outline-none focus:border-[var(--brand)]">{plans.map((plan) => { const item = getExam(plan.examId); return item ? <option key={item.id} value={item.id}>{item.name}</option> : null; })}</select>}</div>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[var(--line)]">
          {(["all", "flagged", "incorrect", "correct"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setParam("filter", item)} className={`min-w-28 border-b-4 px-4 pb-4 pt-2 text-center capitalize transition ${filter === item ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--muted)]"}`}><span className="block text-sm font-extrabold">{item}</span><span className="mt-1 block text-3xl font-black">{counts[item]}</span></button>)}
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
