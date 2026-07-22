import { useCallback, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Bill } from "@/models";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { colors, borderRadius, spacing } from "@/constants/theme";

const CATEGORY_ICONS: Record<string, string> = {
  mortgage: "🏠",
  rent: "🏠",
  phone: "📱",
  internet: "🌐",
  insurance: "🛡️",
  credit_card: "💳",
  utilities: "⚡",
  medical: "🏥",
  other: "📋",
};

const STATUS_BORDER: Record<string, string> = {
  paid: colors.statusPaid,
  due: colors.statusDue,
  overdue: colors.statusOverdue,
  upcoming: colors.statusUpcoming,
};

interface BillCardProps {
  bill: Bill;
  onPress?: (bill: Bill) => void;
  onMarkPaid?: (bill: Bill) => void;
}

function SwipeAction({ onSwipe }: { onSwipe: () => void }) {
  return (
    <TouchableOpacity
      onPress={onSwipe}
      className="bg-status-paid items-center justify-center px-6 rounded-r-xl"
      style={{ minHeight: 48, minWidth: 80 }}
    >
      <Text className="text-white font-bold text-sm">✓ Paid</Text>
    </TouchableOpacity>
  );
}

export function BillCard({ bill, onPress, onMarkPaid }: BillCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleMarkPaid = useCallback(() => {
    swipeableRef.current?.close();
    onMarkPaid?.(bill);
  }, [bill, onMarkPaid]);

  const borderColor = STATUS_BORDER[bill.status] ?? colors.border;
  const categoryIcon = CATEGORY_ICONS[bill.category] ?? "📋";

  const dueDateLabel =
    bill.status === "paid"
      ? "Paid"
      : `Due ${bill.dueDate}${getOrdinalSuffix(bill.dueDate)}`;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() =>
        bill.status !== "paid" ? (
          <SwipeAction onSwipe={handleMarkPaid} />
        ) : null
      }
      rightThreshold={60}
      overshootRight={false}
    >
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={() => onPress?.(bill)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          className="bg-surface rounded-xl mb-3 overflow-hidden"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: borderColor,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            minHeight: 72,
          }}
        >
          <View className="flex-row items-center p-4">
            {/* Category icon */}
            <View
              className="items-center justify-center rounded-xl mr-3"
              style={{
                width: 44,
                height: 44,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text style={{ fontSize: 22 }}>{categoryIcon}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-text-primary flex-1 mr-2" numberOfLines={1}>
                  {bill.name}
                </Text>
                <Text className="text-base font-bold text-text-primary">
                  {formatCurrency(bill.amount)}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Text className="text-sm text-text-secondary">
                  {dueDateLabel}
                </Text>
                {bill.autopay && (
                  <View className="ml-2 px-2 py-0.5 rounded-full bg-primary-light">
                    <Text className="text-xs text-primary font-medium">
                      Auto
                    </Text>
                  </View>
                )}
                <View className="ml-auto">
                  <StatusBadge status={bill.status} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
