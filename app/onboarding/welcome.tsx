import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { colors } from "@/constants/theme";

/**
 * Screen 1 of 4 — Welcome
 *
 * First impression matters. One clear action, no distractions.
 * Large emoji, warm greeting, single button.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Main content — centered vertically */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Friendly illustration */}
        <Text className="text-7xl mb-8" style={{ lineHeight: 96 }}>
          👋💰
        </Text>

        {/* Headline */}
        <Text
          className="font-bold text-center mb-4"
          style={{
            fontSize: 32,
            lineHeight: 42,
            color: colors.textPrimary,
          }}
        >
          Welcome to{"\n"}Budget Buddy
        </Text>

        {/* Subtitle */}
        <Text
          className="text-center max-w-sm"
          style={{
            fontSize: 18,
            lineHeight: 28,
            color: colors.textSecondary,
          }}
        >
          The simplest way to manage your money — designed for the way your brain works
        </Text>
      </View>

      {/* Bottom CTA */}
      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Button
          title="Let's go →"
          size="lg"
          onPress={() => router.push("/onboarding/name")}
          className="w-full min-h-[56px] rounded-xl"
        />
      </View>
    </View>
  );
}
