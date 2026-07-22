import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Settings" />
      <EmptyState
        icon="⚙️"
        title="Your settings"
        message="Customize notifications, preferences, and account details — all kept simple and easy to find."
      />
    </View>
  );
}
