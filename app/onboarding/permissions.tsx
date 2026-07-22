import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { setupNotifications } from "@/services/notifications";
import { colors, shadows } from "@/constants/theme";

/**
 * Screen 3 of 4 — Permissions
 *
 * Requests notification permission in a friendly, transparent way.
 * Two large cards — no choice paralysis.
 */
export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      await setupNotifications();
      // After setup, trigger reschedule for any seed data already loaded
      const { rescheduleAllReminders } = await import(
        "@/services/notifications"
      );
      rescheduleAllReminders();
    } catch {
      // Silently continue — notifications are optional
    }
    setRequesting(false);
    router.push("/onboarding/ready");
  };

  const handleLater = () => {
    router.push("/onboarding/ready");
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Progress indicator */}
      <View className="pt-6 pb-2 items-center">
        <OnboardingProgress total={4} current={3} />
      </View>

      {/* Back button */}
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
          Stay on top{"\n"}of things
        </Text>

        {/* Explanation */}
        <Text
          className="text-center mb-10 px-2"
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
          }}
        >
          We'll remind you about bills, paychecks, and subscriptions — no spam, just
          gentle nudges when something needs your attention{" "}
          <Text style={{ fontSize: 20 }}>😊</Text>
        </Text>

        {/* Two cards */}
        <View className="gap-3">
          {/* Allow card */}
          <TouchableOpacity
            onPress={handleAllow}
            disabled={requesting}
            activeOpacity={0.7}
            className="rounded-xl px-6 py-5 items-center"
            style={{
              backgroundColor: colors.primaryLight,
              minHeight: 64,
              ...shadows.sm,
            }}
          >
            <Text
              className="font-bold text-center"
              style={{
                fontSize: 18,
                color: colors.primaryDark,
              }}
            >
              {requesting ? "Setting up..." : "Yes, remind me 👍"}
            </Text>
            <Text
              className="text-center mt-1"
              style={{
                fontSize: 14,
                color: colors.primary,
              }}
            >
              A few friendly reminders each month
            </Text>
          </TouchableOpacity>

          {/* Maybe later card */}
          <TouchableOpacity
            onPress={handleLater}
            activeOpacity={0.7}
            className="rounded-xl px-6 py-5 items-center border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              minHeight: 64,
              ...shadows.sm,
            }}
          >
            <Text
              className="font-semibold text-center"
              style={{
                fontSize: 18,
                color: colors.textSecondary,
              }}
            >
              Maybe later
            </Text>
            <Text
              className="text-center mt-1"
              style={{
                fontSize: 14,
                color: colors.textMuted,
              }}
            >
              You can always turn them on in Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
