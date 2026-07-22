import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 48 }}>
      {icon && <Text style={{ fontSize: 40, marginBottom: 16 }}>{icon}</Text>}
      <Text style={{ fontSize: fontSize.xl, fontWeight: "700", color: colors.textPrimary, textAlign: "center" }}>
        {title}
      </Text>
      <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: "center", marginTop: 8 }}>
        {message}
      </Text>
    </View>
  );
}
