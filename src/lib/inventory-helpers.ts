import { ExpiryStatus, UnitType } from "./types";

export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expiryDateStr);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired",
      daysLeft: diffDays,
      badgeColor: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
      textColor: "text-red-600 dark:text-red-400",
      label: `Expired (${Math.abs(diffDays)}h lalu)`,
    };
  }

  if (diffDays <= 3) {
    return {
      status: "critical",
      daysLeft: diffDays,
      badgeColor: "bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-400",
      textColor: "text-rose-600 dark:text-rose-400",
      label: diffDays === 0 ? "Expired Hari Ini!" : `${diffDays} hari lagi`,
    };
  }

  if (diffDays <= 7) {
    return {
      status: "warning",
      daysLeft: diffDays,
      badgeColor: "bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300",
      textColor: "text-amber-600 dark:text-amber-400",
      label: `${diffDays} hari lagi`,
    };
  }

  return {
    status: "good",
    daysLeft: diffDays,
    badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
    label: `${diffDays} hari lagi`,
  };
}

export function formatQuantity(qty: number, unit: UnitType): string {
  if (unit === "gr") {
    if (qty >= 1000) {
      const kg = (qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1);
      return `${kg} kg`;
    }
    return `${qty.toLocaleString()} gr`;
  }

  if (unit === "ml") {
    if (qty >= 1000) {
      const l = (qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1);
      return `${l} Liter`;
    }
    return `${qty.toLocaleString()} ml`;
  }

  return `${qty.toLocaleString()} pcs`;
}

export function addDaysToDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
