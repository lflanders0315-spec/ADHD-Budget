import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import type { SavingsGoal } from "@/models";
import { formatCurrency, formatDate, formatPercentage } from "@/utils/formatters";
import { colors, borderRadius } from "@/constants/theme";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onPress?: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({ goal, onPress }: SavingsGoalCardProps) {
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const percent = Math.min(100, Math.round(progress * 100));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  // Determine which milestone is next
  const nextMilestone = goal.milestones
    .filter((m) => !m.reached)
    .sort((a, b) => a.amount - b.amount)[0];

  const goalColor = goal.color ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(goal)}
      activeOpacity={0.9}
      className="bg-surface rounded-xl mb-3 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 72,
      }}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {goal.icon && (
              <Text className="text-xl mr-2">{goal.icon}</Text>
            )}
            <Text
              className="text-base font-semibold text-text-primary flex-1"
              numberOfLines={1}
            >
              {goal.name}
            </Text>
          </View>
          <Text className="text-base font-bold text-text-primary ml-2">
            {formatCurrency(goal.currentAmount)}
            <Text className="text-sm text-text-muted font-normal">
              {" "}/{" "}{formatCurrency(goal.targetAmount)}
            </Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View
          className="h-3 rounded-full bg-surface-muted overflow-hidden mb-2"
          style={{ borderRadius: 6 }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={[
              { backgroundColor: goalColor, borderRadius: 6 },
              barStyle,
            ]}
          />
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold" style={{ color: goalColor }}>
            {percent}%
          </Text>

          {/* Milestone indicator */}
          {nextMilestone && (
            <View className="flex-row items-center">
              <Text className="text-xs text-text-muted">Next: </Text>
              <Text className="text-xs text-text-secondary font-medium">
                {formatCurrency(nextMilestone.amount)}
              </Text>
            </View>
          )}

          {goal.deadline && (
            <Text className="text-xs text-text-muted">
              by {formatDate(goal.deadline)}
            </Text>
          )}
        </View>

        {/* Milestone dots */}
        {goal.milestones.length > 0 && (
          <View className="flex-row mt-3 gap-1.5">
            {goal.milestones.map((m, i) => (
              <View
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{
                  backgroundColor: m.reached ? goalColor : colors.border,
                }}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
