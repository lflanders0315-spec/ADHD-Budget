import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Today" />
      <EmptyState
        icon="🏠"
        title="Your dashboard"
        message="Here you'll see what needs your attention today — just the top few things, nothing overwhelming."
      />
    </View>
  );
}
