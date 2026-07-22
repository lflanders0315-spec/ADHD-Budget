import { TouchableOpacity, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";

interface FABProps {
  onPress: () => void;
  label?: string;
  /** Override the absolute position (e.g. to clear a tab bar) */
  style?: ViewStyle;
}

export function FAB({ onPress, label, style }: FABProps) {
  const { colors } = useTheme();
  const { reducedMotion } = useAccessibility();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSequence(
      withSpring(1.05, { damping: 12, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 100,
        },
        style,
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel="Add new item"
        accessibilityHint="Opens a menu to add a bill, subscription, paycheck, savings goal, or spending entry"
        accessibilityRole="button"
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ fontSize: 30, color: colors.textInverse, fontWeight: "300", marginTop: -1 }}>
          +
        </Text>
      </TouchableOpacity>

      {label && (
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6, textAlign: "center" }}>
          {label}
        </Text>
      )}
    </Animated.View>
  );
}
