import { View, Text } from "react-native";
import type { BillStatus } from "@/models";

const statusConfig: Record<BillStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-status-paid/20", text: "text-status-paid", label: "Paid" },
  due: { bg: "bg-status-due/20", text: "text-status-due", label: "Due" },
  overdue: { bg: "bg-status-overdue/20", text: "text-status-overdue", label: "Overdue" },
  upcoming: { bg: "bg-status-upcoming/20", text: "text-status-upcoming", label: "Upcoming" },
};

interface StatusBadgeProps {
  status: BillStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <View className={`rounded-full px-3 py-1 ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}
