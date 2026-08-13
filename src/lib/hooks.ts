import { useSyncExternalStore } from "react";
import {
  defaultOnboarding,
  EXAM_PLANS_KEY,
  loadExamPlans,
  loadOnboarding,
  loadStreak,
  loadStudySeconds,
  loadReviewRecords,
  loadXp,
  STORAGE_KEY,
  STREAK_KEY,
  REVIEW_KEY,
  STUDY_SECONDS_KEY,
  XP_KEY,
} from "./storage";
import type { OnboardingState, ReviewRecord } from "./types";

let cachedOnboarding: OnboardingState = defaultOnboarding;
let cachedOnboardingRaw: string | null = null;
let cachedXp = 0;
let cachedXpRaw: string | null = null;
let cachedStreak = 0;
let cachedStreakRaw: string | null = null;
let cachedExamPlans: OnboardingState[] = [];
let cachedExamPlansRaw: string | undefined;
const emptyExamPlans: OnboardingState[] = [];
let cachedReviewRecords: ReviewRecord[] = [];
let cachedReviewRaw: string | null = null;
const emptyReviewRecords: ReviewRecord[] = [];
let cachedStudySeconds = 0;
let cachedStudySecondsRaw: string | null = null;

function readOnboardingSnapshot(): OnboardingState {
  if (typeof window === "undefined") return defaultOnboarding;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedOnboardingRaw) return cachedOnboarding;
  cachedOnboardingRaw = raw;
  cachedOnboarding = loadOnboarding();
  return cachedOnboarding;
}

function readXpSnapshot(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(XP_KEY);
  if (raw === cachedXpRaw) return cachedXp;
  cachedXpRaw = raw;
  cachedXp = loadXp();
  return cachedXp;
}

function readStreakSnapshot(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STREAK_KEY);
  if (raw === cachedStreakRaw) return cachedStreak;
  cachedStreakRaw = raw;
  cachedStreak = loadStreak();
  return cachedStreak;
}

function readExamPlansSnapshot(): OnboardingState[] {
  if (typeof window === "undefined") return emptyExamPlans;
  const plansRaw = localStorage.getItem(EXAM_PLANS_KEY);
  const legacyRaw = localStorage.getItem(STORAGE_KEY);
  const raw = `${plansRaw ?? "none"}:${legacyRaw ?? "none"}`;
  if (raw === cachedExamPlansRaw) return cachedExamPlans;
  cachedExamPlansRaw = raw;
  cachedExamPlans = loadExamPlans();
  return cachedExamPlans;
}

function readReviewSnapshot(): ReviewRecord[] {
  if (typeof window === "undefined") return emptyReviewRecords;
  const raw = localStorage.getItem(REVIEW_KEY);
  if (raw === cachedReviewRaw) return cachedReviewRecords;
  cachedReviewRaw = raw;
  cachedReviewRecords = loadReviewRecords();
  return cachedReviewRecords;
}

function readStudySecondsSnapshot(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STUDY_SECONDS_KEY);
  if (raw === cachedStudySecondsRaw) return cachedStudySeconds;
  cachedStudySecondsRaw = raw;
  cachedStudySeconds = loadStudySeconds();
  return cachedStudySeconds;
}

function subscribe(onStoreChange: () => void) {
  const handler = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEY ||
      event.key === EXAM_PLANS_KEY ||
      event.key === XP_KEY ||
      event.key === STREAK_KEY ||
      event.key === REVIEW_KEY ||
      event.key === STUDY_SECONDS_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handler);
  window.addEventListener("drkard-storage", onStoreChange);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("drkard-storage", onStoreChange);
  };
}

export function useOnboardingStore(): OnboardingState {
  return useSyncExternalStore(
    subscribe,
    readOnboardingSnapshot,
    () => defaultOnboarding,
  );
}

export function useXp(): number {
  return useSyncExternalStore(subscribe, readXpSnapshot, () => 0);
}

export function useStreak(): number {
  return useSyncExternalStore(subscribe, readStreakSnapshot, () => 0);
}

export function useExamPlans(): OnboardingState[] {
  return useSyncExternalStore(subscribe, readExamPlansSnapshot, () => emptyExamPlans);
}

export function useReviewRecords(): ReviewRecord[] {
  return useSyncExternalStore(subscribe, readReviewSnapshot, () => emptyReviewRecords);
}

export function useStudySeconds(): number {
  return useSyncExternalStore(subscribe, readStudySecondsSnapshot, () => 0);
}
