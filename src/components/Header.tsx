import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, fontSize } from "@/constants/theme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Reusable screen header — calm, large title, optional back button.
 */
export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-6 py-4"
      style={{
        minHeight: 56,
        borderBottomWidth: 0,
      }}
    >
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mr-3 items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text
              className="text-lg"
              style={{ color: colors.textPrimary }}
            >
              ←
            </Text>
          </TouchableOpacity>
        )}
        <Text
          className="font-bold flex-1"
          style={{
            fontSize: fontSize["3xl"],
            color: colors.textPrimary,
            letterSpacing: -0.5,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          activeOpacity={0.7}
          className="items-center justify-center rounded-full px-4"
          style={{
            minHeight: 40,
            backgroundColor: colors.primaryLight,
          }}
        >
          <Text
            className="font-semibold"
            style={{
              fontSize: fontSize.sm,
              color: colors.primaryDark,
            }}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
