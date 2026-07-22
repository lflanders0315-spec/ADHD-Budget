import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { useAppStore } from "@/stores/appStore";
import { colors } from "@/constants/theme";

/**
 * Screen 2 of 4 — Name
 *
 * Asks for the user's first name. Friendly, low-pressure.
 * Can skip — defaults to "there".
 */
export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setDisplayName = useAppStore((s) => s.setDisplayName);

  const [name, setName] = useState("");

  const handleNext = () => {
    if (name.trim()) {
      setDisplayName(name.trim());
    }
    // If no name provided, displayName stays "" — dashboard handles it gracefully
    router.push("/onboarding/permissions");
  };

  const handleSkip = () => {
    router.push("/onboarding/permissions");
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Progress indicator */}
      <View className="pt-6 pb-2 items-center">
        <OnboardingProgress total={4} current={2} />
      </View>

      {/* Back button — subtle top-left */}
      <View className="px-6 pt-2">
        <Text
          className="text-base font-semibold"
          style={{ color: colors.primary }}
          onPress={() => router.back()}
        >
          ← Back
        </Text>
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center px-8">
        {/* Heading */}
        <Text
          className="font-bold text-center mb-2"
          style={{
            fontSize: 28,
            lineHeight: 38,
            color: colors.textPrimary,
          }}
        >
          What should we{"\n"}call you?
        </Text>

        {/* Subtitle */}
        <Text
          className="text-center mb-8"
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
          }}
        >
          Just your first name is perfect
        </Text>

        {/* Name input */}
        <FormInput
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="First name"
          icon="😊"
        />
      </View>

      {/* Bottom actions */}
      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Button
          title={name.trim() ? "Next →" : "Skip for now →"}
          size="lg"
          onPress={handleNext}
          className="w-full min-h-[56px] rounded-xl mb-3"
        />

        {/* Subtle skip link when name is entered */}
        {name.trim().length > 0 && (
          <Text
            className="text-center text-base font-semibold py-2"
            style={{ color: colors.textMuted }}
            onPress={handleSkip}
          >
            Skip
          </Text>
        )}
      </View>
    </View>
  );
}
