import type { OnboardingState, QuestionReport, ReviewRecord } from "./types";

export const STORAGE_KEY = "drkard-onboarding-v1";
export const EXAM_PLANS_KEY = "drkard-exam-plans-v1";
export const XP_KEY = "drkard-xp-v1";
export const STREAK_KEY = "drkard-streak-v1";
export const REVIEW_KEY = "drkard-review-v1";
export const STUDY_SECONDS_KEY = "drkard-study-seconds-v1";
export const QUESTION_REPORTS_KEY = "drkard-question-reports-v1";

export const defaultOnboarding: OnboardingState = {
  examId: null,
  examDate: null,
  knowledgeLevel: null,
  dailyGoal: null,
  studyTime: null,
  completed: false,
};

export function loadReviewRecords(): ReviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReviewRecord(record: ReviewRecord) {
  if (typeof window === "undefined") return;
  const records = loadReviewRecords();
  const previous = records.find((item) => item.questionId === record.questionId);
  const next = [
    { ...record, flagged: previous?.flagged ?? record.flagged },
    ...records.filter((item) => item.questionId !== record.questionId),
  ];
  localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("drkard-storage"));
}

export function toggleReviewFlag(questionId: string) {
  if (typeof window === "undefined") return;
  const next = loadReviewRecords().map((record) =>
    record.questionId === questionId
      ? { ...record, flagged: !record.flagged }
      : record,
  );
  localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("drkard-storage"));
}

export function saveQuestionReport(report: QuestionReport) {
  if (typeof window === "undefined") return;
  try {
    const parsed = JSON.parse(localStorage.getItem(QUESTION_REPORTS_KEY) || "[]");
    const reports: QuestionReport[] = Array.isArray(parsed) ? parsed : [];
    const next = [report, ...reports.filter((item) => item.questionId !== report.questionId)];
    localStorage.setItem(QUESTION_REPORTS_KEY, JSON.stringify(next));
  } catch {
    localStorage.setItem(QUESTION_REPORTS_KEY, JSON.stringify([report]));
  }
  window.dispatchEvent(new Event("drkard-storage"));
}

export function loadStudySeconds(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(STUDY_SECONDS_KEY) || 0);
}

export function addStudySeconds(seconds: number): number {
  const next = loadStudySeconds() + Math.max(0, Math.round(seconds));
  localStorage.setItem(STUDY_SECONDS_KEY, String(next));
  window.dispatchEvent(new Event("drkard-storage"));
  return next;
}

export function loadOnboarding(): OnboardingState {
  if (typeof window === "undefined") return defaultOnboarding;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOnboarding;
    return { ...defaultOnboarding, ...JSON.parse(raw) };
  } catch {
    return defaultOnboarding;
  }
}

export function saveOnboarding(state: OnboardingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (state.examId) {
    const plans = loadExamPlans();
    const index = plans.findIndex((plan) => plan.examId === state.examId);
    const nextPlans = [...plans];
    if (index === -1) nextPlans.push(state);
    else nextPlans[index] = state;
    localStorage.setItem(EXAM_PLANS_KEY, JSON.stringify(nextPlans));
  }
  window.dispatchEvent(new Event("drkard-storage"));
}

export function loadExamPlans(): OnboardingState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXAM_PLANS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((plan): plan is Partial<OnboardingState> => Boolean(plan?.examId))
          .map((plan) => ({ ...defaultOnboarding, ...plan }));
      }
    }
    const legacy = loadOnboarding();
    return legacy.examId ? [legacy] : [];
  } catch {
    const legacy = loadOnboarding();
    return legacy.examId ? [legacy] : [];
  }
}

export function loadXp(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(XP_KEY) || 0);
}

export function addXp(amount: number): number {
  const next = loadXp() + amount;
  localStorage.setItem(XP_KEY, String(next));
  window.dispatchEvent(new Event("drkard-storage"));
  return next;
}

export function loadStreak(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(STREAK_KEY) || 0);
}

export function bumpStreak(): number {
  const next = Math.max(1, loadStreak() + 1);
  localStorage.setItem(STREAK_KEY, String(next));
  window.dispatchEvent(new Event("drkard-storage"));
  return next;
}
