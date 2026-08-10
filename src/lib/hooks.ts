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
  window.addEventListener("drkard-storage", onStoreChange as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("drkard-storage", onStoreChange as EventListener);
  };
}

export function notifyStorage() {
  window.dispatchEvent(new Event("drkard-storage"));
}

export function useOnboardingStore(): OnboardingState {
  return useSyncExternalStore(subscribe, loadOnboarding, () => defaultOnboarding);
}

export function useXp(): number {
  return useSyncExternalStore(subscribe, loadXp, () => 0);
}

export function useStreak(): number {
  return useSyncExternalStore(subscribe, loadStreak, () => 0);
}
