import { TouchableOpacity, Text, View, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

type FocusItemType = "bill" | "savings" | "subscription" | "spending";

const TYPE_ICON: Record<FocusItemType, string> = {
  bill: "📋",
  savings: "🐷",
  subscription: "🔄",
  spending: "💳",
};

const TYPE_COLOR: Record<FocusItemType, string> = {
  bill: colors.statusDue,
  savings: colors.primary,
  subscription: colors.statusUpcoming,
  spending: colors.accent,
};

interface TodayFocusItemProps {
  title: string;
  subtitle?: string;
  completed: boolean;
  onToggle: () => void;
  type: FocusItemType;
}

export function TodayFocusItem({
  title,
  subtitle,
  completed,
  onToggle,
  type,
}: TodayFocusItemProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);
  const iconColor = TYPE_COLOR[type];
  const icon = TYPE_ICON[type];

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handleToggle = () => {
    // Gentle haptic-like scale bounce
    scale.value = withSequence(
      withTiming(0.94, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );

    if (!completed) {
      checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      checkScale.value = withTiming(0, { duration: 150 });
    }

    onToggle();
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      className="flex-row items-center px-4"
      style={{
        minHeight: 56,
        opacity: completed ? 0.6 : 1,
      }}
    >
      {/* Checkbox circle */}
      <Animated.View
        style={[{ transform: [{ scale: scale.value }] }]}
      >
        <View
          className="items-center justify-center rounded-full border-2 mr-3"
          style={{
            width: 28,
            height: 28,
            borderColor: completed ? colors.statusPaid : colors.border,
            backgroundColor: completed ? colors.statusPaid : "transparent",
          }}
        >
          <Animated.Text
            style={[
              { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
              checkStyle,
            ]}
          >
            ✓
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Type icon */}
      <View
        className="items-center justify-center rounded-lg mr-3"
        style={{
          width: 32,
          height: 32,
          backgroundColor: `${iconColor}20`,
        }}
      >
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-base text-text-primary"
          style={{
            textDecorationLine: completed ? "line-through" : "none",
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-text-secondary mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
