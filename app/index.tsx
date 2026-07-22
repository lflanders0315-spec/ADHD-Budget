import { View, Text } from "react-native";
import { useAppStore } from "@/stores/appStore";

export default function HomeScreen() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-3xl font-bold text-text-primary text-center">
        Budget Buddy ADHD
      </Text>
      <Text className="text-base text-text-secondary text-center mt-3">
        The simplest financial app{'\n'}for brains that get overwhelmed.
      </Text>
      {!onboardingComplete && (
        <View className="mt-8 bg-primary-light rounded-xl px-6 py-4 min-h-touch justify-center">
          <Text className="text-primary-dark text-base font-semibold">
            Welcome! Let's get you set up.
          </Text>
        </View>
      )}
    </View>
  );
}
