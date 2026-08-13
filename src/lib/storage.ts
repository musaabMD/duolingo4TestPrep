import type { OnboardingState } from "./types";

export const STORAGE_KEY = "drkard-onboarding-v1";
export const XP_KEY = "drkard-xp-v1";
export const STREAK_KEY = "drkard-streak-v1";

export const defaultOnboarding: OnboardingState = {
  examId: null,
  examDate: null,
  dailyGoal: null,
  studyTime: null,
  completed: false,
};

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
  window.dispatchEvent(new Event("drkard-storage"));
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
