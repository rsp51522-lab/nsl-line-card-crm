export function buildLineShareUrl(message: string) {
  return `https://line.me/R/share?text=${encodeURIComponent(message)}`;
}

export function normalizeLineId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("https://line.me/")) {
    const match = trimmed.match(/\/(?:ti\/p|oaMessage)\/([^/?#]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : "";
  }

  if (trimmed.startsWith("@")) {
    return trimmed;
  }

  return trimmed.includes("/") ? "" : `@${trimmed}`;
}

export function buildLineOaMessageUrl(lineIdOrUrl: string, message?: string) {
  const lineId = normalizeLineId(lineIdOrUrl);
  if (!lineId) return "";

  const encodedId = encodeURIComponent(lineId);
  if (!message?.trim()) {
    return `https://line.me/R/oaMessage/${encodedId}`;
  }

  return `https://line.me/R/oaMessage/${encodedId}/?${encodeURIComponent(message.trim())}`;
}

export function hasLineMessagingEnv() {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET);
}
