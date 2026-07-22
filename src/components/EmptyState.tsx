import { View, Text } from "react-native";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon && <Text className="text-4xl mb-4">{icon}</Text>}
      <Text className="text-xl font-bold text-text-primary text-center">
        {title}
      </Text>
      <Text className="text-base text-text-secondary text-center mt-2">
        {message}
      </Text>
    </View>
  );
}
