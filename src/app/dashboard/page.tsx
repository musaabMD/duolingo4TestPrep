"use client";

import Link from "next/link";
import { useState } from "react";
import { ExamRankCard } from "@/components/ExamRankCard";
import { SiteHeader } from "@/components/SiteHeader";
import { daysUntil, getExam } from "@/lib/exams";
import { useExamPlans, useOnboardingStore, useReviewRecords, useStreak, useStudySeconds } from "@/lib/hooks";
import { QUESTIONS, questionsForExam } from "@/lib/questions";
import type { ExamId, OnboardingState, ReviewRecord } from "@/lib/types";

const EXAM_TONES: Record<ExamId, string> = { sat: "bg-[#eb1748]", act: "bg-[#079b71]", mcat: "bg-[#7c35ef]", usmle: "bg-[#2d66e8]", gre: "bg-[#ff7412]", lsat: "bg-[#117d72]" };

function scoreColor(score: number) {
  if (score >= 75) return "#23966f";
  if (score >= 50) return "#e69a17";
  return "#d9565b";
}

function estimatedScore(plan: OnboardingState, index = 0) {
  const base = plan.knowledgeLevel === "advanced" ? 82 : plan.knowledgeLevel === "intermediate" ? 64 : 42;
  return Math.max(18, Math.min(92, base + [18, -4, 22, -20][index % 4]));
}

function recordsScore(records: ReviewRecord[], fallback: number) {
  return records.length ? Math.round(records.filter((record) => record.correct).length / records.length * 100) : fallback;
}

function HeaderMetric({ icon, value, label, tone, onClick, expanded }: { icon: React.ReactNode; value: string; label: string; tone: string; onClick?: () => void; expanded?: boolean }) {
  const content = <><span className={`grid h-8 w-8 place-items-center ${tone}`}>{icon}</span><span className="text-base font-black tabular-nums">{value}</span></>;
  if (onClick) return <button type="button" onClick={onClick} aria-label={`${value} ${label}`} aria-expanded={expanded} title={`${value} ${label}`} className={`hidden h-11 items-center gap-1 rounded-xl px-1.5 transition sm:flex ${expanded ? "bg-[#e8f4ff] ring-2 ring-[#22a8f0]" : "hover:bg-[var(--surface)]"}`}>{content}</button>;
  return <div aria-label={`${value} ${label}`} title={`${value} ${label}`} className="hidden h-11 items-center gap-1 rounded-xl px-1.5 sm:flex">{content}</div>;
}

function ExamSwitcher({ plans, activePlan, onSelect, streak, score, remaining, correctAnswers, answeredQuestions }: { plans: OnboardingState[]; activePlan: OnboardingState; onSelect: (id: ExamId) => void; streak: number; score: number; remaining: number | null; correctAnswers: number; answeredQuestions: number }) {
  const [open, setOpen] = useState(false);
  const [actionExamId, setActionExamId] = useState<ExamId | null>(null);
  const [detailOpen, setDetailOpen] = useState<"streak" | "score" | "date" | null>(null);
  const exam = getExam(activePlan.examId);
  if (!exam) return null;
  const incorrectAnswers = Math.max(0, answeredQuestions - correctAnswers);
  const remainingDays = Math.max(0, remaining ?? 0);
  const formattedDate = activePlan.examDate ? new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${activePlan.examDate}T12:00:00`)) : "Not set";
  const toggleDetail = (detail: "streak" | "score" | "date") => {
    setDetailOpen((current) => current === detail ? null : detail);
    setOpen(false);
  };
  return <div className="relative flex items-center gap-1 sm:gap-2">
    <div className="relative">
      <button type="button" onClick={() => { setOpen((value) => !value); setDetailOpen(null); }} aria-haspopup="menu" aria-expanded={open} className="flex min-h-11 items-center gap-2 rounded-xl bg-[var(--surface)] px-2.5 pr-3 transition hover:bg-[#eceef1]"><span className={`grid h-8 w-8 place-items-center rounded-lg text-[10px] font-black text-white ${EXAM_TONES[exam.id]}`}>{exam.name.slice(0, 2)}</span><span className="hidden text-sm font-black sm:block">{exam.name}</span><svg viewBox="0 0 24 24" className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m7 9 5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      {open ? <><button type="button" aria-label="Close exam menu" className="fixed inset-0 z-30 cursor-default" onClick={() => { setOpen(false); setActionExamId(null); }}/><div role="menu" className="absolute right-0 z-40 mt-3 w-80 rounded-3xl border-2 border-[var(--line)] bg-white p-3 shadow-[0_20px_60px_rgba(21,32,50,0.18)]"><p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-[0.15em] text-[var(--muted)]">My exams</p><div className="space-y-1">{plans.map((plan) => { const item = getExam(plan.examId); if (!item) return null; const actionsOpen = actionExamId === item.id; return <div key={item.id} className={`rounded-2xl transition ${item.id === exam.id ? "bg-[#e8f4ff] text-[#1674a8]" : "hover:bg-[var(--surface)]"}`}><div className="flex items-center gap-2 p-2"><button role="menuitem" type="button" onClick={() => { onSelect(item.id); setActionExamId(null); }} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black text-white ${EXAM_TONES[item.id]}`}>{item.name.slice(0, 2)}</span><span className="flex-1 truncate font-black">{item.name}</span>{item.id === exam.id ? <span className="sr-only">Selected</span> : null}</button><button type="button" aria-label={`${item.name} review and edit`} aria-expanded={actionsOpen} onClick={() => setActionExamId(actionsOpen ? null : item.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" strokeLinejoin="round"/></svg></button></div>{actionsOpen ? <div className="grid grid-cols-2 gap-2 px-3 pb-3"><Link href={`/review?exam=${item.id}`} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white text-sm font-black text-[var(--ink)] shadow-sm">Review</Link><Link href={`/onboarding?exam=${item.id}&step=date`} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white text-sm font-black text-[var(--ink)] shadow-sm">Edit plan</Link></div> : null}</div>; })}<Link role="menuitem" href="/onboarding?add=1&step=exam" className="flex items-center gap-3 rounded-2xl p-3 font-black text-[var(--ink)] hover:bg-[var(--surface)]"><span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[var(--line)] text-xl">＋</span>Add exam</Link></div></div></> : null}
    </div>
    <HeaderMetric label="day streak" value={`${streak}`} tone="text-[#ff9600]" expanded={detailOpen === "streak"} onClick={() => toggleDetail("streak")} icon={<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden><path d="M13.6 2.4c.4 3-1.1 4.2-2.4 5.6-1.4 1.5-2.6 3.1-1.6 5.8.4-1.9 1.5-2.8 2.6-3.8.2 2.1 2.4 3.3 2.4 5.8 0 1.8-1.2 3.4-3 4.1 3.9-.2 7-3.4 7-7.4 0-4.1-2.5-7.7-5-10.1ZM9.4 21.2C6.3 20.3 4 17.5 4 14.1c0-3.1 1.8-5.7 4.4-7-.4 2.6-2.4 4.4-2.4 7.3 0 2.8 1.2 5.2 3.4 6.8Z"/></svg>}/>
    <HeaderMetric label="score" value={`${score}%`} tone="text-[#22a8f0]" expanded={detailOpen === "score"} onClick={() => toggleDetail("score")} icon={<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden><path d="m12 1 8.7 5v10L12 21l-8.7-5V6L12 1Zm-1.2 14.8 6-6-1.7-1.7-4.3 4.3-2-2-1.7 1.7 3.7 3.7Z"/></svg>}/>
    <HeaderMetric label="days until exam" value={`${remainingDays}d`} tone="text-[#ff4b55]" expanded={detailOpen === "date"} onClick={() => toggleDetail("date")} icon={<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10Zm-7 2h2v3h3v2h-5v-5Z"/></svg>}/>
    {detailOpen ? <>
      <button type="button" aria-label="Close dashboard details" className="fixed inset-0 z-30 cursor-default" onClick={() => setDetailOpen(null)}/>
      <section role="dialog" aria-label={`${exam.name} ${detailOpen} details`} className="absolute right-0 top-14 z-40 w-80 rounded-3xl border-2 border-[var(--line)] bg-white p-5 shadow-[0_20px_60px_rgba(21,32,50,0.18)]">
        {detailOpen === "score" ? <>
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--muted)]">{exam.name} performance</p><p className="mt-1 text-2xl font-black text-[var(--ink)]">Score details</p></div><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f4ff] text-2xl font-black text-[#168ac1]">{score}%</div></div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-[#e9f7f1] p-3"><p className="text-2xl font-black text-[#16865f]">{correctAnswers}</p><p className="mt-1 text-[10px] font-black uppercase text-[var(--muted)]">Correct</p></div><div className="rounded-2xl bg-[#fff0f0] p-3"><p className="text-2xl font-black text-[#c83c43]">{incorrectAnswers}</p><p className="mt-1 text-[10px] font-black uppercase text-[var(--muted)]">Incorrect</p></div><div className="rounded-2xl bg-[var(--surface)] p-3"><p className="text-2xl font-black text-[var(--ink)]">{answeredQuestions}</p><p className="mt-1 text-[10px] font-black uppercase text-[var(--muted)]">Answered</p></div></div>
          {answeredQuestions ? <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#e4e8ed]"><div className="h-full rounded-full bg-[#22a8f0]" style={{ width: `${score}%` }}/></div> : <p className="mt-5 rounded-2xl bg-[var(--surface)] p-3 text-sm font-bold text-[var(--muted)]">Complete practice questions to build your score.</p>}
          <Link href={`/review?exam=${exam.id}`} onClick={() => setDetailOpen(null)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--ink)] font-black text-white">Review answers</Link>
        </> : detailOpen === "streak" ? <>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#d67b00]">Current streak</p>
          <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-black text-[var(--ink)]">{streak}</span><span className="pb-1 font-black text-[var(--muted)]">{streak === 1 ? "day" : "days"}</span></div>
          <p className="mt-3 text-sm font-bold text-[var(--muted)]">Practice today to keep your streak active.</p>
          <div className="mt-5 grid grid-cols-7 gap-2" aria-label={`${Math.min(streak, 7)} active days this week`}>{Array.from({ length: 7 }, (_, index) => <span key={index} className={`aspect-square rounded-full ${index < Math.min(streak, 7) ? "bg-[#ff9600]" : "bg-[#e6e8eb]"}`}/>)}</div>
        </> : <>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#d93f49]">{exam.name} exam</p>
          <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-black text-[var(--ink)]">{remainingDays}</span><span className="pb-1 font-black text-[var(--muted)]">days left</span></div>
          <div className="mt-5 rounded-2xl bg-[var(--surface)] p-4"><p className="text-xs font-black uppercase text-[var(--muted)]">Exam date</p><p className="mt-1 text-lg font-black">{formattedDate}</p></div>
        </>}
      </section>
    </> : null}
  </div>;
}

function SubjectPerformance({ plan, records }: { plan: OnboardingState; records: ReviewRecord[] }) {
  const exam = getExam(plan.examId);
  const [view, setView] = useState<"subjects" | "topics" | "blueprint" | "review">("subjects");
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "flagged">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ name: string; score: number; attempts: number } | null>(null);
  const [action, setAction] = useState<"resume" | "restart" | "review">("resume");
  if (!exam) return null;

  const topicNames = Array.from(new Set(QUESTIONS.filter((question) => question.examId === exam.id).map((question) => question.topic)));
  const names = view === "review" ? [] : view === "topics" ? topicNames : exam.topics;
  const cards = names.map((name, index) => {
    const questionIds = QUESTIONS.filter((question) => question.examId === exam.id && (view === "topics" ? question.topic === name : question.topic.toLowerCase().includes(name.toLowerCase().split(" ")[0]))).map((question) => question.id);
    const attempts = records.filter((record) => questionIds.includes(record.questionId));
    return { name, attempts: attempts.length, score: recordsScore(attempts, estimatedScore(plan, index)) };
  }).filter((card) => card.name.toLowerCase().includes(query.trim().toLowerCase()));
  const examQuestions = questionsForExam(exam.id);
  const normalizedQuery = query.trim().toLowerCase();
  const reviewItems = records.map((record) => ({ record, question: QUESTIONS.find((question) => question.id === record.questionId) })).filter((item) => {
    if (!item.question) return false;
    const matchesFilter = reviewFilter === "all" || (reviewFilter === "correct" && item.record.correct) || (reviewFilter === "incorrect" && !item.record.correct) || (reviewFilter === "flagged" && item.record.flagged);
    const matchesQuery = !normalizedQuery || item.question.prompt.toLowerCase().includes(normalizedQuery) || item.question.topic.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
  const reviewCounts = {
    all: records.length,
    correct: records.filter((record) => record.correct).length,
    incorrect: records.filter((record) => !record.correct).length,
    flagged: records.filter((record) => record.flagged).length,
  };
  const resumeAt = Math.min(examQuestions.length, Math.max(1, records.length + 1));
  const destination = action === "review" ? `/review?exam=${exam.id}` : `/practice?exam=${exam.id}&question=${action === "resume" ? resumeAt : 1}${action === "restart" ? "&fresh=1" : ""}`;

  return <div className="min-w-0">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="inline-flex w-fit rounded-2xl bg-[var(--surface)] p-1">{(["subjects", "topics", "blueprint", "review"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`rounded-xl px-4 py-2.5 text-sm font-black capitalize transition ${view === item ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>{item}</button>)}</div><label className="relative w-full sm:max-w-sm"><span className="sr-only">Filter {view}</span><svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4" strokeLinecap="round"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "review" ? "Search answered questions…" : `Filter ${view}…`} className="min-h-12 w-full rounded-2xl border-2 border-[var(--line)] bg-white pl-12 pr-4 font-bold outline-none transition focus:border-[var(--ink)]"/></label></div>
    {view === "review" ? <div className="mt-5">
      <div className="flex flex-wrap gap-2">{(["all", "correct", "incorrect", "flagged"] as const).map((filter) => <button key={filter} type="button" onClick={() => setReviewFilter(filter)} className={`rounded-xl border-2 px-3 py-2 text-sm font-black capitalize transition ${reviewFilter === filter ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[#bbc1c8]"}`}>{filter} <span className={reviewFilter === filter ? "text-white/70" : "text-[var(--muted)]"}>{reviewCounts[filter]}</span></button>)}</div>
      {reviewItems.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{reviewItems.map(({ record, question }) => question ? <Link key={record.questionId} href={`/review?exam=${exam.id}&filter=${reviewFilter}&subject=all&question=${record.questionId}`} className="group rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[#bbc1c8] hover:shadow-[0_8px_20px_rgba(21,32,50,0.06)]"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">{question.topic}</p><div className="flex items-center gap-2">{record.flagged ? <span className="text-[#d18a00]" aria-label="Flagged">⚑</span> : null}<span className={`rounded-lg px-2 py-1 text-xs font-black ${record.correct ? "bg-[#e2f5ec] text-[#16865f]" : "bg-[#fde9ea] text-[#c83c43]"}`}>{record.correct ? "Correct" : "Incorrect"}</span></div></div><p className="mt-3 line-clamp-3 font-black leading-snug text-[var(--ink)]">{question.prompt}</p></Link> : null)}</div> : <div className="mt-4 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-8 text-center font-bold text-[var(--muted)]">No {reviewFilter} answers found.</div>}
    </div> : cards.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{cards.map((card, index) => <button key={card.name} type="button" onClick={() => { setSelected(card); setAction(card.attempts ? "resume" : "restart"); }} className="group rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#c8ced6] hover:bg-[var(--surface)] hover:shadow-[0_10px_24px_rgba(21,32,50,0.07)]"><div className="flex items-center justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-white text-sm font-black text-[var(--muted)] shadow-sm">{view === "blueprint" ? `${index + 1}` : card.name.slice(0, 2).toUpperCase()}</span><p className="text-3xl font-black">{view === "blueprint" ? `${Math.round(100 / cards.length)}%` : <>{card.score}<span className="text-lg">%</span></>}</p></div><p className="mt-5 text-xl font-black">{card.name}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dde2e8]"><div className="h-full rounded-full" style={{ width: `${view === "blueprint" ? Math.round(100 / cards.length) : card.score}%`, backgroundColor: view === "blueprint" ? "#22a8f0" : scoreColor(card.score) }}/></div></button>)}</div> : <div className="mt-5 rounded-3xl border-2 border-[var(--line)] bg-[var(--surface)] p-8 text-center font-bold text-[var(--muted)]">No {view} match “{query}”.</div>}
    {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="practice-dialog-title" className="animate-rise w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-[var(--muted)]">{exam.name}</p><h3 id="practice-dialog-title" className="mt-1 text-3xl font-black">{selected.name}</h3></div><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface)]">✕</button></div><div className="mt-6 rounded-2xl bg-[var(--surface)] p-5"><p className="text-xs font-black uppercase text-[var(--muted)]">Overall score</p><p className="mt-1 text-5xl font-black">{selected.score}%</p></div><div className="mt-5 grid gap-2 sm:grid-cols-3">{selected.attempts ? <button type="button" onClick={() => setAction("resume")} className={`rounded-xl border-2 px-3 py-3 text-sm font-black ${action === "resume" ? "border-[var(--ink)] bg-[var(--surface)]" : "border-[var(--line)]"}`}>Resume</button> : null}<button type="button" onClick={() => setAction("restart")} className={`rounded-xl border-2 px-3 py-3 text-sm font-black ${action === "restart" ? "border-[var(--ink)] bg-[var(--surface)]" : "border-[var(--line)]"}`}>Start over</button>{selected.attempts ? <button type="button" onClick={() => setAction("review")} className={`rounded-xl border-2 px-3 py-3 text-sm font-black ${action === "review" ? "border-[var(--ink)] bg-[var(--surface)]" : "border-[var(--line)]"}`}>Review</button> : null}</div><Link href={destination} className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white shadow-[0_4px_0_var(--brand-deep)]">{action === "review" ? "Open review" : action === "resume" ? "Resume practice" : "Start practice"}</Link></section></div> : null}
  </div>;
}

function ExamWorkspace({ plan, streak, records, studySeconds }: { plan: OnboardingState; streak: number; records: ReviewRecord[]; studySeconds: number }) {
  const exam = getExam(plan.examId);
  if (!exam) return null;
  const score = recordsScore(records, estimatedScore(plan));
  return <section className="w-full" aria-labelledby={`exam-${exam.id}`}><h2 id={`exam-${exam.id}`} className="sr-only">{exam.name} dashboard</h2><div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]"><SubjectPerformance plan={plan} records={records}/><ExamRankCard exam={exam} score={score} studyMinutes={studySeconds > 0 ? Math.max(1, Math.round(studySeconds / 60)) : 0} activeDays={streak}/></div></section>;
}

export default function DashboardPage() {
  const profile = useOnboardingStore();
  const plansSaved = useExamPlans();
  const allRecords = useReviewRecords();
  const streak = useStreak();
  const studySeconds = useStudySeconds();
  const [selectedExamId, setSelectedExamId] = useState<ExamId | null>(null);
  const plans = plansSaved.length ? plansSaved : profile.examId ? [profile] : [];
  const activePlan = plans.find((plan) => plan.examId === selectedExamId) ?? plans[0];
  const records = activePlan ? allRecords.filter((record) => record.examId === activePlan.examId) : [];
  const score = activePlan ? recordsScore(records, estimatedScore(activePlan)) : 0;
  const remaining = activePlan ? daysUntil(activePlan.examDate) : null;
  const correctAnswers = records.filter((record) => record.correct).length;
  const headerActions = activePlan ? <ExamSwitcher plans={plans} activePlan={activePlan} onSelect={setSelectedExamId} streak={streak} score={score} remaining={remaining} correctAnswers={correctAnswers} answeredQuestions={records.length}/> : <Link href="/onboarding?add=1&step=exam" className="rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-black text-white">Add exam</Link>;
  return <div className="min-h-dvh w-full bg-white"><SiteHeader compact actions={headerActions}/><main className="w-full px-5 pb-16 pt-8 sm:px-8 lg:px-12"><h1 className="mb-7 text-4xl font-black tracking-tight sm:text-5xl">Dashboard</h1>{!activePlan ? <section className="rounded-3xl bg-[var(--surface)] p-10 text-center"><h2 className="text-2xl font-black">Add your first exam</h2><Link href="/onboarding?add=1&step=exam" className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-[var(--brand)] px-6 font-extrabold text-white">Choose an exam</Link></section> : <ExamWorkspace plan={activePlan} streak={streak} records={records} studySeconds={studySeconds}/>}</main></div>;
}
