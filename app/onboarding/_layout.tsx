import { Stack } from "expo-router";

/**
 * Onboarding Stack navigator.
 * Uses slide-from-right animations for a natural forward-flow feel.
 * Headers are hidden — each screen manages its own layout.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF9F7" },
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    />
  );
}
