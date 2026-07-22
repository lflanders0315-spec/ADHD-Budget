import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Paycheck } from "@/models";
import { formatCurrency, formatDate, formatRelativeDays } from "@/utils/formatters";
import { colors } from "@/constants/theme";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Every week",
  biweekly: "Every 2 weeks",
  monthly: "Every month",
  custom: "Custom",
};

interface PaycheckCardProps {
  paycheck: Paycheck;
  onPress?: (paycheck: Paycheck) => void;
}

export function PaycheckCard({ paycheck, onPress }: PaycheckCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const daysUntil = getDaysUntil(paycheck.nextPayDate);
  const daysLabel = formatRelativeDays(paycheck.nextPayDate);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => onPress?.(paycheck)}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        activeOpacity={0.9}
        className="bg-surface rounded-xl mb-3 overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
          minHeight: 72,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        }}
      >
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            {/* Source info */}
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">
                {paycheck.employer || paycheck.source}
              </Text>
              <Text className="text-sm text-text-secondary mt-0.5">
                {FREQUENCY_LABELS[paycheck.frequency] ?? paycheck.frequency}
              </Text>
            </View>

            {/* Net pay */}
            <View className="items-end ml-3">
              <Text className="text-xl font-bold text-primary">
                {formatCurrency(paycheck.netPay)}
              </Text>
              {paycheck.grossPay !== paycheck.netPay && (
                <Text className="text-xs text-text-muted">
                  Gross: {formatCurrency(paycheck.grossPay)}
                </Text>
              )}
            </View>
          </View>

          {/* Days-until-next-pay counter */}
          <View className="flex-row items-center mt-3 pt-3 border-t border-border-light">
            <View
              className="items-center justify-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor:
                  daysUntil <= 3 ? colors.accentLight : colors.primaryLight,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: daysUntil <= 3 ? colors.accent : colors.primary,
                }}
              >
                {daysLabel}
              </Text>
            </View>
            <Text className="text-sm text-text-secondary ml-3">
              Next pay: {formatDate(paycheck.nextPayDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
