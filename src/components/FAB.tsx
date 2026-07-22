import { TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

interface FABProps {
  onPress: () => void;
  label?: string;
}

export function FAB({ onPress, label }: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 12, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  };

  return (
    <Animated.View
      className="absolute bottom-6 right-6"
      style={[
        {
          zIndex: 100,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="items-center justify-center rounded-2xl"
        style={{
          width: 56,
          height: 56,
          backgroundColor: colors.primary,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text className="text-3xl text-white font-light" style={{ marginTop: -1 }}>
          +
        </Text>
      </TouchableOpacity>

      {label && (
        <Text className="text-xs text-text-secondary mt-1.5 text-center">
          {label}
        </Text>
      )}
    </Animated.View>
  );
}
