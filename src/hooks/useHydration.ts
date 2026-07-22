import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { hasSeededData, seedData } from "@/data/seed";

/**
 * Hydration hook — runs once on app launch.
 *
 * - Waits for Zustand stores to hydrate from MMKV
 * - If onboarding is complete and no data has been seeded,
 *   populates stores with realistic demo content.
 * - Returns `ready: boolean` so the UI can defer rendering
 *   until the hydration pass is finished.
 */
export function useHydration(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  useEffect(() => {
    // Hydration happens synchronously on store creation (MMKV is sync).
    // We use a microtask to let the store subscriptions settle.
    const id = setTimeout(() => {
      if (onboardingComplete && !hasSeededData()) {
        seedData();
      }
      setReady(true);
    }, 0);

    return () => clearTimeout(id);
    // Run once on mount — onboardingComplete is stable after initial read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ready };
}
