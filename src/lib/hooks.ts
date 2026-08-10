import { useSyncExternalStore } from "react";
import {
  defaultOnboarding,
  loadOnboarding,
  loadStreak,
  loadXp,
  STORAGE_KEY,
  STREAK_KEY,
  XP_KEY,
} from "./storage";
import type { OnboardingState } from "./types";

let cachedOnboarding: OnboardingState = defaultOnboarding;
let cachedOnboardingRaw: string | null = null;
let cachedXp = 0;
let cachedXpRaw: string | null = null;
let cachedStreak = 0;
let cachedStreakRaw: string | null = null;

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

function subscribe(onStoreChange: () => void) {
  const handler = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEY ||
      event.key === XP_KEY ||
      event.key === STREAK_KEY ||
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
