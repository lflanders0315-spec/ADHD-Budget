import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Savings" />
      <EmptyState
        icon="🎯"
        title="Your savings goals will appear here"
        message="Set small, achievable goals and watch them grow. We'll celebrate every milestone along the way."
      />
    </View>
  );
}
