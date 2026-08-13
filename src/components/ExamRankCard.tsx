"use client";

import { useState } from "react";
import type { ExamOption } from "@/lib/types";

const RANK_SEEDS: Record<string, { rank: number; names: [string, string] }> = {
  sat: { rank: 18, names: ["Noah R", "Mia T"] }, act: { rank: 27, names: ["Manish K", "Tia J"] },
  mcat: { rank: 12, names: ["Amina S", "Leo P"] }, usmle: { rank: 21, names: ["Omar N", "Lina A"] },
  gre: { rank: 16, names: ["Maya K", "Evan D"] }, lsat: { rank: 9, names: ["Nora J", "Adam V"] },
};

export function ExamRankCard({ exam, score, studyMinutes, activeDays }: { exam: ExamOption; score: number; studyMinutes: number; activeDays: number }) {
  const [metric, setMetric] = useState<"score" | "streak" | "study">("score");
  const seed = RANK_SEEDS[exam.id];
  const userScore = Math.max(0, Math.min(100, score));
  const userValue = metric === "score" ? userScore : metric === "streak" ? activeDays : studyMinutes;
  const suffix = metric === "score" ? "%" : metric === "streak" ? "d" : "m";
  const rows = [
    { rank: seed.rank - 1, name: seed.names[0], value: metric === "score" ? Math.min(100, userValue + 12) : userValue + 3, tone: "bg-fuchsia-300" },
    { rank: seed.rank, name: "You", value: userValue, tone: "bg-[#436dff]", current: true },
    { rank: seed.rank + 1, name: seed.names[1], value: Math.max(0, userValue - (metric === "score" ? 8 : 1)), tone: "bg-violet-300" },
  ];

  return (
    <aside className="rounded-[1.5rem] border-2 border-[var(--line)] bg-white p-5" aria-label={`${exam.name} rank`}>
      <div className="flex items-center justify-between gap-4"><p className="text-lg font-black text-[var(--ink)]">{exam.name} ranking</p><span className="rounded-xl bg-[#fff4d6] px-3 py-1 text-xs font-black text-[#a86700]">#{seed.rank}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-[var(--surface)] p-1" aria-label="Ranking metric">{(["score", "streak", "study"] as const).map((item) => <button key={item} type="button" onClick={() => setMetric(item)} className={`rounded-xl px-2 py-2 text-xs font-black capitalize transition ${metric === item ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>{item}</button>)}</div>
      <div className="mt-4 space-y-1.5">
        {rows.map((row) => <div key={`${row.rank}-${row.name}`} className={`grid grid-cols-[1.75rem_2rem_1fr_auto] items-center gap-2 rounded-xl px-2.5 py-2 ${row.current ? "bg-[var(--surface)]" : ""}`}><span className="text-center text-xs font-bold text-[var(--muted)]">{row.rank}</span><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white ${row.tone}`}>{row.name[0]}</span><span className={`text-sm font-bold ${row.current ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{row.name}</span><span className="text-sm font-black text-[var(--ink)]">{row.value}{suffix}</span></div>)}
      </div>
    </aside>
  );
}
