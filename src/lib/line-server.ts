import crypto from "node:crypto";

type LineTextMessage = {
  type: "text";
  text: string;
};

export function verifyLineWebhookSignature(body: string, signature: string) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac("sha256", secret).update(body).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function pushLineMessage(to: string, messages: LineTextMessage[]) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN が未設定です。");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LINE Push送信に失敗しました: ${text}`);
  }
}

export async function replyLineMessage(replyToken: string, messages: LineTextMessage[]) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN が未設定です。");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LINE Reply送信に失敗しました: ${text}`);
  }
}
