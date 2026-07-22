import { View, Text } from "react-native";
import { Card } from "./Card";

interface TodaysFocusCardProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TodaysFocusCard({
  title,
  subtitle,
  actionLabel,
  onAction,
}: TodaysFocusCardProps) {
  return (
    <Card className="mb-4">
      <Text className="text-lg font-bold text-text-primary">{title}</Text>
      <Text className="text-sm text-text-secondary mt-1">{subtitle}</Text>
      {actionLabel && onAction && (
        <View className="mt-3">
          <Text
            className="text-primary font-semibold text-sm"
            onPress={onAction}
          >
            {actionLabel} →
          </Text>
        </View>
      )}
    </Card>
  );
}
