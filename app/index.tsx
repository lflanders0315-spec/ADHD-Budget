import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/stores/appStore";
import { seedData } from "@/data/seed";

export default function IndexScreen() {
  const router = useRouter();
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  useEffect(() => {
    // Seed demo data if first launch
    seedData();

    if (onboardingComplete) {
      router.replace("/(tabs)/dashboard");
    } else {
      router.replace("/onboarding/welcome");
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
