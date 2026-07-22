import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";

export default function BillsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Bills" />
      <EmptyState
        icon="💳"
        title="Your bills will appear here"
        message="Track what's due and when. No more surprise late fees — we'll remind you before anything is overdue."
      />
    </View>
  );
}
