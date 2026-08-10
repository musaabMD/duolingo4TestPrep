import type { ExamOption } from "./types";

export const EXAMS: ExamOption[] = [
  {
    id: "sat",
    name: "SAT",
    short: "College Board",
    blurb: "Reading, writing, and math for college admissions.",
    topics: ["Algebra", "Reading", "Grammar", "Data analysis"],
  },
  {
    id: "act",
    name: "ACT",
    short: "ACT Inc.",
    blurb: "English, math, reading, and science reasoning.",
    topics: ["English", "Math", "Reading", "Science"],
  },
  {
    id: "mcat",
    name: "MCAT",
    short: "AAMC",
    blurb: "Biology, chem, physics, and critical analysis.",
    topics: ["Bio/Biochem", "Chem/Phys", "Psych/Soc", "CARS"],
  },
  {
    id: "usmle",
    name: "USMLE Step 1",
    short: "NBME",
    blurb: "Foundational sciences for medical licensing.",
    topics: ["Pathology", "Pharmacology", "Physiology", "Micro"],
  },
  {
    id: "gre",
    name: "GRE",
    short: "ETS",
    blurb: "Verbal, quantitative, and analytical writing.",
    topics: ["Verbal", "Quant", "Data", "Vocab"],
  },
  {
    id: "lsat",
    name: "LSAT",
    short: "LSAC",
    blurb: "Logical reasoning and reading for law school.",
    topics: ["LR", "Reading Comp", "Arguments", "Assumptions"],
  },
];

export function getExam(id: string | null | undefined) {
  return EXAMS.find((exam) => exam.id === id) ?? null;
}

export function daysUntil(examDate: string | null | undefined): number | null {
  if (!examDate) return null;
  const target = new Date(`${examDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRemaining(days: number | null): string {
  if (days === null) return "Set your exam date";
  if (days < 0) return `${Math.abs(days)} days past exam`;
  if (days === 0) return "Exam day — you've got this";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}
