import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAppStore } from "@/stores/appStore";
import { useHydration } from "@/hooks/useHydration";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function IndexScreen() {
  const router = useRouter();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const { ready } = useHydration();

  useEffect(() => {
    if (!ready) return;

    if (onboardingComplete) {
      router.replace("/(tabs)/dashboard");
    } else {
      router.replace("/onboarding/welcome");
    }
  }, [ready, onboardingComplete, router]);

  // Show branded loading screen while hydrating
  if (!ready) {
    return <LoadingScreen />;
  }

  return null;
}
