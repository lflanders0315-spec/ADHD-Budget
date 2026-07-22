import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";

export default function PaychecksScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header title="Paychecks" />
      <EmptyState
        icon="💰"
        title="Your paychecks will appear here"
        message="Plan out when you get paid and where the money needs to go. One less thing to keep in your head."
      />
    </View>
  );
}
