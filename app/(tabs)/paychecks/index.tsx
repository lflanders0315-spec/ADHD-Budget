import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";

export default function PaychecksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Paychecks" />
      <EmptyState
        icon="💰"
        title="Your paychecks will appear here"
        message="Plan out when you get paid and where the money needs to go. One less thing to keep in your head."
      />
    </View>
  );
}
