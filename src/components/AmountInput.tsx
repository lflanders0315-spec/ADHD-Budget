import { useState, useCallback } from "react";
import { View, Text, TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, borderRadius, spacing } from "@/constants/theme";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}

export function AmountInput({
  value,
  onChange,
  currency = "$",
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState(value > 0 ? value.toString() : "");
  const borderAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    borderAnimation.value = withTiming(1, { duration: 200 });
    if (value === 0) {
      setRawText("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderAnimation.value = withTiming(0, { duration: 200 });
    // Format on blur
    const num = parseFloat(rawText);
    if (!isNaN(num) && num > 0) {
      setRawText(num.toFixed(2));
      onChange(num);
    } else if (rawText === "" || isNaN(num)) {
      setRawText("");
      onChange(0);
    }
  };

  const handleChangeText = useCallback(
    (text: string) => {
      // Allow only digits and one decimal point
      const cleaned = text.replace(/[^0-9.]/g, "");
      // Prevent multiple decimal points
      const parts = cleaned.split(".");
      if (parts.length > 2) return;
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) return;

      setRawText(cleaned);

      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        onChange(num);
      }
    },
    [onChange]
  );

  const borderStyle = useAnimatedStyle(() => ({
    borderColor:
      borderAnimation.value === 1 ? colors.primary : colors.border,
  }));

  // Format the display value
  const displayValue = value > 0 ? formatDisplayValue(value) : "";

  return (
    <View className="mb-4">
      <Animated.View
        className="bg-surface rounded-xl border-2 px-5 py-4"
        style={[
          {
            minHeight: 80,
          },
          borderStyle,
        ]}
      >
        <View className="flex-row items-baseline">
          {/* Currency symbol — large */}
          <Text className="text-3xl font-bold text-text-primary mr-1">
            {currency}
          </Text>

          {/* Input field */}
          <TextInput
            className="flex-1 text-3xl font-bold text-text-primary"
            style={{ minHeight: 40 }}
            value={isFocused ? rawText : displayValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            caretHidden={false}
          />
        </View>

        {/* Formatted preview when editing */}
        {isFocused && rawText.length > 0 && !isNaN(parseFloat(rawText)) && (
          <Text className="text-sm text-text-secondary mt-1">
            = {currency}{parseFloat(rawText).toFixed(2)}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

function formatDisplayValue(amount: number): string {
  return amount.toFixed(2);
}
