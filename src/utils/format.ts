export function formatBalance(quants: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(quants);
}

export function formatCurrency(value: number, currency = "USD"): string {
  if (value > 0 && value < 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 10,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTick(tick: number): string {
  return new Intl.NumberFormat("en-US").format(tick);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatQuPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  if (value === 0) return "0 QU";
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B QU`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M QU`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K QU`;
  if (value >= 1) {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} QU`;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} QU`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatEventTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return "—";
  const numeric = Number(timestamp);
  const date = Number.isFinite(numeric)
    ? new Date(numeric)
    : new Date(timestamp);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
