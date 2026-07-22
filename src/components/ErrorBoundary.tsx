import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled React render errors and shows a friendly recovery screen.
 * Never exposes stack traces or technical details to users.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log for debugging — in production we'd send to a service
    console.error("[ErrorBoundary]", error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.xl,
          }}
        >
          {/* Calm illustration */}
          <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>🧘</Text>

          <Text
            style={{
              fontSize: fontSize["2xl"],
              fontWeight: "700",
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: spacing.sm,
            }}
          >
            Something went wrong
          </Text>

          <Text
            style={{
              fontSize: fontSize.base,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: spacing.xl,
              lineHeight: 22,
            }}
          >
            No worries — these things happen. Let's give it another try.
          </Text>

          <TouchableOpacity
            onPress={this.handleRetry}
            activeOpacity={0.7}
            accessibilityLabel="Try again"
            accessibilityRole="button"
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.DEFAULT,
              minHeight: spacing.touch,
              minWidth: 160,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: fontSize.base,
                fontWeight: "600",
                color: colors.textInverse,
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
