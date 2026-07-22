/**
 * Currency and date formatters for Budget Buddy ADHD.
 * All outputs are ADHD-friendly: simple, readable, no jargon.
 */

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return currencyFormatter.format(amount);
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDays(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `in ${diffDays} days`;
  return formatDate(dateString);
}

// ---------------------------------------------------------------------------
// Percentages
// ---------------------------------------------------------------------------

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
