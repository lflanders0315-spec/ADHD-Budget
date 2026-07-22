import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { colors, borderRadius } from "@/constants/theme";

// Extend animated types so we can pass a Reanimated shared value directly to SVGCircle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Diameter of the ring (default 120) */
  size?: number;
  /** Stroke thickness (default 10) */
  strokeWidth?: number;
  /** Ring color (defaults to theme primary) */
  color?: string;
  /** Optional label shown below the percentage */
  label?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = colors.primary,
  label,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    animatedProgress.value = withDelay(200, withTiming(clampedProgress, { duration: 800 }));
  }, [clampedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const dashOffset = circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset: dashOffset,
    };
  });

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        {/* Center content */}
        <View className="absolute inset-0 items-center justify-center">
          <Text
            className="font-bold text-text-primary"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      </View>
      {label && (
        <Text className="text-sm text-text-secondary mt-2 text-center">
          {label}
        </Text>
      )}
    </View>
  );
}
