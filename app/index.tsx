import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/stores/appStore";

export default function IndexScreen() {
  const router = useRouter();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (onboardingComplete) {
      router.replace("/(tabs)/dashboard");
    } else {
      // TODO: replace with onboarding screen once built
      router.replace("/(tabs)/dashboard");
    }
  }, [onboardingComplete, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#5B8C5A" />
      <Text className="text-base text-text-secondary mt-4">
        Getting things ready...
      </Text>
    </View>
  );
}
