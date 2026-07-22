import { View } from "react-native";
import { colors } from "@/constants/theme";

interface OnboardingProgressProps {
  /** Total number of steps */
  total: number;
  /** Current active step (1-based) */
  current: number;
}

/**
 * Simple dot progress indicator for onboarding.
 * Calm, subtle — designed to be visible but not distracting.
 */
export function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isCompleted = step < current;

        return (
          <View
            key={step}
            style={{
              width: isActive ? 10 : 8,
              height: isActive ? 10 : 8,
              borderRadius: isActive ? 5 : 4,
              backgroundColor: isActive
                ? colors.primary
                : isCompleted
                  ? colors.primaryLight
                  : colors.border,
              opacity: isActive ? 1 : 0.7,
            }}
          />
        );
      })}
    </View>
  );
}
