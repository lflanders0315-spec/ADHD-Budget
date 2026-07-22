import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { useAppStore } from "@/stores/appStore";
import { colors } from "@/constants/theme";

/**
 * Screen 4 of 4 — Ready
 *
 * Summary of what the app does, celebration, and final CTA.
 * On tap, marks onboarding complete and navigates to the dashboard.
 */
export default function ReadyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const handleStart = () => {
    setOnboardingComplete(true);
    router.replace("/(tabs)/dashboard");
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Progress indicator */}
      <View className="pt-6 pb-2 items-center">
        <OnboardingProgress total={4} current={4} />
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center px-8">
        {/* Celebration */}
        <Text className="text-6xl text-center mb-4" style={{ lineHeight: 80 }}>
          🎉
        </Text>

        {/* Headline */}
        <Text
          className="font-bold text-center mb-6"
          style={{
            fontSize: 28,
            lineHeight: 38,
            color: colors.textPrimary,
          }}
        >
          You're all set!
        </Text>

        {/* Summary of features */}
        <View className="mb-10 gap-3">
          <FeatureRow emoji="💳" text="Track your bills" />
          <FeatureRow emoji="💰" text="Watch your paychecks" />
          <FeatureRow emoji="🎯" text="Reach savings goals" />
          <FeatureRow emoji="📺" text="Monitor subscriptions" />
        </View>
      </View>

      {/* Bottom CTA */}
      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Button
          title="Start budgeting →"
          size="lg"
          onPress={handleStart}
          className="w-full min-h-[56px] rounded-xl"
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Feature row helper
// ---------------------------------------------------------------------------

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3 px-2">
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 17,
          lineHeight: 24,
          color: colors.textPrimary,
          fontWeight: "500",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
