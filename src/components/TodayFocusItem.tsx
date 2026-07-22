import { TouchableOpacity, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";

type FocusItemType = "bill" | "savings" | "subscription" | "spending";

const TYPE_ICON: Record<FocusItemType, string> = {
  bill: "📋", savings: "🐷", subscription: "🔄", spending: "💳",
};

const TYPE_COLOR_KEYS: Record<FocusItemType, keyof ReturnType<typeof useTheme>["colors"]> = {
  bill: "statusDue", savings: "primary", subscription: "statusUpcoming", spending: "accent",
};

interface TodayFocusItemProps {
  title: string;
  subtitle?: string;
  completed: boolean;
  onToggle: () => void;
  type: FocusItemType;
}

export function TodayFocusItem({
  title, subtitle, completed, onToggle, type,
}: TodayFocusItemProps) {
  const { colors } = useTheme();
  const { reducedMotion } = useAccessibility();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);
  const iconColorKey = TYPE_COLOR_KEYS[type];
  const iconColor = colors[iconColorKey] as string;
  const icon = TYPE_ICON[type];

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handleToggle = () => {
    if (!reducedMotion) {
      scale.value = withSequence(
        withTiming(0.94, { duration: 80 }),
        withTiming(1, { duration: 120 })
      );
    }

    if (!completed) {
      checkScale.value = reducedMotion ? 1 : withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      checkScale.value = reducedMotion ? 0 : withTiming(0, { duration: 150 });
    }

    onToggle();
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}${completed ? ", completed" : ""}`}
      accessibilityHint="Tap to mark as complete"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
        minHeight: 56, opacity: completed ? 0.6 : 1,
      }}
    >
      {/* Checkbox circle */}
      <Animated.View style={[{ transform: [{ scale: scale.value }] }]}>
        <View
          style={{
            width: 28, height: 28, borderRadius: 14, borderWidth: 2,
            alignItems: "center", justifyContent: "center", marginRight: 12,
            borderColor: completed ? colors.statusPaid : colors.border,
            backgroundColor: completed ? colors.statusPaid : "transparent",
          }}
        >
          <Animated.Text style={[{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }, checkStyle]}>
            ✓
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Type icon */}
      <View style={{
        width: 32, height: 32, borderRadius: 8, alignItems: "center",
        justifyContent: "center", marginRight: 12,
        backgroundColor: `${iconColor}20`,
      }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16, color: colors.textPrimary,
          textDecorationLine: completed ? "line-through" : "none",
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
