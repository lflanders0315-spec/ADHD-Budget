import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { colors, borderRadius, spacing } from "@/constants/theme";
import { formatDateFull } from "@/utils/formatters";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  label: string;
  date: string; // ISO date string
  onChange: (date: string) => void;
}

export function DatePicker({ label, date, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = date ? new Date(date) : new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    return date ? new Date(date).getDate() : null;
  });

  const overlayOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(300);

  const open = useCallback(() => {
    const d = date ? new Date(date) : new Date();
    setViewDate({ month: d.getMonth(), year: d.getFullYear() });
    setSelectedDay(date ? d.getDate() : null);
    setIsOpen(true);
    overlayOpacity.value = withTiming(1, { duration: 200 });
    sheetTranslateY.value = withSpring(0, { damping: 25, stiffness: 200 });
  }, [date]);

  const close = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    sheetTranslateY.value = withTiming(300, { duration: 200 });
    setTimeout(() => setIsOpen(false), 250);
  }, []);

  const confirm = useCallback(() => {
    if (selectedDay !== null) {
      const newDate = new Date(viewDate.year, viewDate.month, selectedDay);
      onChange(newDate.toISOString().split("T")[0]);
    }
    close();
  }, [selectedDay, viewDate, onChange, close]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  // Build calendar grid
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1).getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const prevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const nextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const displayDate = date
    ? formatDateFull(date)
    : "Tap to select";

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.7}
        className="mb-4"
      >
        <Text className="text-sm font-semibold text-text-secondary mb-2">
          {label}
        </Text>
        <View
          className="bg-surface rounded-xl border-2 border-border px-4 flex-row items-center"
          style={{ minHeight: spacing.touch }}
        >
          <Text className="text-lg mr-3">📅</Text>
          <Text
            className="text-base flex-1"
            style={{
              color: date ? colors.textPrimary : colors.textMuted,
            }}
          >
            {displayDate}
          </Text>
          <Text className="text-text-muted text-sm">▼</Text>
        </View>
      </TouchableOpacity>

      {/* Modal picker sheet */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
            },
            overlayStyle,
          ]}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={close}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl px-5 pt-5 pb-8"
          style={[
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
              borderTopLeftRadius: borderRadius.lg,
              borderTopRightRadius: borderRadius.lg,
            },
            sheetStyle,
          ]}
        >
          {/* Month navigation */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={prevMonth}
              className="items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Text className="text-xl text-primary">‹</Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold text-text-primary">
              {MONTHS[viewDate.month]} {viewDate.year}
            </Text>

            <TouchableOpacity
              onPress={nextMonth}
              className="items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Text className="text-xl text-primary">›</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View className="flex-row mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <View key={d} className="flex-1 items-center py-2">
                <Text className="text-xs font-semibold text-text-muted">
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View className="flex-row flex-wrap">
            {days.map((day, i) => {
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                viewDate.month === today.getMonth() &&
                viewDate.year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <View key={i} className="w-[14.28%] items-center py-1">
                  {day !== null ? (
                    <TouchableOpacity
                      onPress={() => setSelectedDay(day)}
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                      }}
                    >
                      <Text
                        className="text-base"
                        style={{
                          color: isSelected
                            ? colors.textInverse
                            : isToday
                              ? colors.primary
                              : colors.textPrimary,
                          fontWeight: isSelected || isToday ? "bold" : "normal",
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 40, height: 40 }} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            onPress={confirm}
            className="bg-primary rounded-xl items-center justify-center mt-4"
            style={{ minHeight: spacing.touch }}
            disabled={selectedDay === null}
          >
            <Text
              className="text-base font-bold"
              style={{
                color: selectedDay !== null
                  ? colors.textInverse
                  : colors.textMuted,
              }}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}
