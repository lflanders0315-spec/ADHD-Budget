import { useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { colors, borderRadius, spacing } from "@/constants/theme";

// Category display config: color mapping and emoji icons
const CATEGORY_CONFIG: Record<
  string,
  { color: string; bg: string; icon: string }
> = {
  // Bill categories
  mortgage: { color: colors.primaryDark, bg: colors.primaryLight, icon: "🏠" },
  rent: { color: colors.primaryDark, bg: colors.primaryLight, icon: "🏠" },
  phone: { color: colors.info, bg: "#E8F0F8", icon: "📱" },
  internet: { color: colors.info, bg: "#E8F0F8", icon: "🌐" },
  insurance: { color: colors.warning, bg: colors.accentLight, icon: "🛡️" },
  credit_card: { color: colors.statusDue, bg: colors.accentLight, icon: "💳" },
  utilities: { color: colors.accent, bg: colors.accentLight, icon: "⚡" },
  medical: { color: colors.danger, bg: "#FDE8E5", icon: "🏥" },
  other_bill: {
    color: colors.textSecondary,
    bg: colors.surfaceMuted,
    icon: "📋",
  },
  // Subscription categories
  streaming: { color: colors.danger, bg: "#FDE8E5", icon: "🎬" },
  software: { color: colors.info, bg: "#E8F0F8", icon: "💻" },
  gym: { color: colors.success, bg: "#E8F5E8", icon: "🏋️" },
  phone_apps: { color: colors.primary, bg: colors.primaryLight, icon: "📲" },
  shopping: { color: colors.accent, bg: colors.accentLight, icon: "🛍️" },
  other_subscription: {
    color: colors.textSecondary,
    bg: colors.surfaceMuted,
    icon: "📦",
  },
  // Spending categories
  food: { color: colors.accent, bg: colors.accentLight, icon: "🍔" },
  gas: { color: colors.info, bg: "#E8F0F8", icon: "⛽" },
  shopping_spend: {
    color: colors.statusDue,
    bg: colors.accentLight,
    icon: "🛍️",
  },
  entertainment: {
    color: colors.primary,
    bg: colors.primaryLight,
    icon: "🎮",
  },
  medical_spend: { color: colors.danger, bg: "#FDE8E5", icon: "🏥" },
  other_spend: {
    color: colors.textSecondary,
    bg: colors.surfaceMuted,
    icon: "💸",
  },
};

function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIG[category] ?? {
      color: colors.textSecondary,
      bg: colors.surfaceMuted,
      icon: "📌",
    }
  );
}

function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CategoryPickerProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryPicker({
  categories,
  selected,
  onSelect,
}: CategoryPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      }}
      className="mb-4"
    >
      {categories.map((category) => {
        const config = getCategoryConfig(category);
        const isSelected = category === selected;
        const label = formatCategoryLabel(category);

        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            activeOpacity={0.7}
            className="flex-row items-center rounded-full px-4"
            style={{
              backgroundColor: isSelected ? config.color : config.bg,
              minHeight: spacing.touch - 4,
              borderWidth: isSelected ? 0 : 1.5,
              borderColor: isSelected ? "transparent" : colors.borderLight,
            }}
          >
            <Text className="text-base mr-1.5">{config.icon}</Text>
            <Text
              className="text-sm font-semibold"
              style={{
                color: isSelected ? colors.textInverse : config.color,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
