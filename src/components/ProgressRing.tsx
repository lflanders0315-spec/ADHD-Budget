import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";

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
  color,
  label,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const { reducedMotion } = useAccessibility();
  const ringColor = color ?? colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (reducedMotion) {
      animatedProgress.value = clampedProgress; // instant
    } else {
      animatedProgress.value = withDelay(200, withTiming(clampedProgress, { duration: 800 }));
    }
  }, [clampedProgress, reducedMotion]);

  const animatedProps = useAnimatedProps(() => {
    const dashOffset = circumference - (circumference * animatedProgress.value) / 100;
    return { strokeDashoffset: dashOffset };
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center} cy={center} r={radius}
            stroke={colors.borderLight} strokeWidth={strokeWidth} fill="none"
          />
          <AnimatedCircle
            cx={center} cy={center} r={radius}
            stroke={ringColor} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round" strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontWeight: "700", color: colors.textPrimary, fontSize: size * 0.22 }}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      </View>
      {label && (
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: "center" }}>
          {label}
        </Text>
      )}
    </View>
  );
}
