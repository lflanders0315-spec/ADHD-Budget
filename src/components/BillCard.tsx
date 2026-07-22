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
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";
import { spacing } from "@/constants/theme";

const CATEGORY_ICONS: Record<string, string> = {
  mortgage: "🏠", rent: "🏠", phone: "📱", internet: "🌐",
  insurance: "🛡️", credit_card: "💳", utilities: "⚡", medical: "🏥", other: "📋",
};

const STATUS_BORDER: Record<string, string> = {
  paid: "#7CB77C", due: "#F0A04B", overdue: "#E07A6E", upcoming: "#8CB8D8",
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
      accessibilityLabel="Mark bill as paid"
      accessibilityRole="button"
      style={{
        backgroundColor: "#7CB77C",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        minHeight: 48,
        minWidth: 80,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>✓ Paid</Text>
    </TouchableOpacity>
  );
}

export function BillCard({ bill, onPress, onMarkPaid }: BillCardProps) {
  const { colors } = useTheme();
  const { reducedMotion } = useAccessibility();
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1);
  };

  const handleMarkPaid = useCallback(() => {
    swipeableRef.current?.close();
    onMarkPaid?.(bill);
  }, [bill, onMarkPaid]);

  const borderColor = STATUS_BORDER[bill.status] ?? colors.border;
  const categoryIcon = CATEGORY_ICONS[bill.category] ?? "📋";

  const dueDateLabel =
    bill.status === "paid" ? "Paid" : `Due ${bill.dueDate}${getOrdinalSuffix(bill.dueDate)}`;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() =>
        bill.status !== "paid" ? <SwipeAction onSwipe={handleMarkPaid} /> : null
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
          accessibilityLabel={`${bill.name}, ${formatCurrency(bill.amount)}, ${dueDateLabel}`}
          accessibilityHint={bill.status !== "paid" ? "Swipe left to mark as paid" : "Tap to view details"}
          accessibilityRole="button"
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 12,
            overflow: "hidden",
            borderLeftWidth: 4,
            borderLeftColor: borderColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            minHeight: 72,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            {/* Category icon */}
            <View style={{
              width: 44, height: 44, borderRadius: 12, alignItems: "center",
              justifyContent: "center", marginRight: 12, backgroundColor: colors.surfaceMuted,
            }}>
              <Text style={{ fontSize: 22 }}>{categoryIcon}</Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, flex: 1, marginRight: 8 }}
                  numberOfLines={1}
                >
                  {bill.name}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>
                  {formatCurrency(bill.amount)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>{dueDateLabel}</Text>
                {bill.autopay && (
                  <View style={{
                    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
                    borderRadius: 9999, backgroundColor: colors.primaryLight,
                  }}>
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "500" }}>Auto</Text>
                  </View>
                )}
                <View style={{ marginLeft: "auto" }}>
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
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
