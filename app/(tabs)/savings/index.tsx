import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header title="Savings" />
      <EmptyState
        icon="🎯"
        title="Your savings goals will appear here"
        message="Set small, achievable goals and watch them grow. We'll celebrate every milestone along the way."
      />
    </View>
  );
}
