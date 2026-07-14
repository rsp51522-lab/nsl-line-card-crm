export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function rankStars(rank: number) {
  return "★".repeat(rank) + "☆".repeat(5 - rank);
}

export function statusLabel(status: string) {
  switch (status) {
    case "due_today":
      return "今日対応";
    case "overdue":
      return "期限超過";
    case "completed":
      return "完了";
    default:
      return "予定あり";
  }
}
