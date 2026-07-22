import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useTheme } from "@/hooks/useTheme";

/**
 * Branded loading screen shown during initial app hydration.
 * Gentle pulsing animation, on-brand calm feel.
 */
export function LoadingScreen() {
  const { colors, fontSize } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Brand icon */}
      <Animated.View style={{ opacity: pulseAnim }}>
        <Text style={{ fontSize: 64, marginBottom: 24 }}>💰</Text>
      </Animated.View>

      {/* App name */}
      <Text
        style={{
          fontSize: fontSize["2xl"],
          fontWeight: "700",
          color: colors.textPrimary,
          marginBottom: 8,
        }}
      >
        Budget Buddy
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: fontSize.sm,
          color: colors.textSecondary,
        }}
      >
        Getting things ready for you...
      </Text>
    </View>
  );
}
