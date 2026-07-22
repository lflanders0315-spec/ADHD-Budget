import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import type { TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-xl items-center justify-center min-h-touch";
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-accent",
    outline: "bg-transparent border border-primary",
    ghost: "bg-transparent",
  };
  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };
  const textColor = variant === "primary" ? "text-text-inverse" : "text-primary";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? "opacity-50" : ""} ${className ?? ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#5B8C5A"} />
      ) : (
        <Text className={`font-semibold text-base ${textColor}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
