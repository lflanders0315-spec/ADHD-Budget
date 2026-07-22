import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

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
  const { colors, fontSize } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 56,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={{
              marginRight: 12,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              width: 40,
              height: 40,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 18, color: colors.textPrimary }}>←</Text>
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontWeight: "700",
            flex: 1,
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
          accessibilityLabel={rightAction.label}
          accessibilityRole="button"
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            paddingHorizontal: 16,
            minHeight: 40,
            backgroundColor: colors.primaryLight,
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: fontSize.sm,
              color: colors.primary,
            }}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
