import { NextResponse } from "next/server";
import { DEFAULT_OWNER_ID, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { hasLineMessagingEnv } from "@/lib/line";
import { replyLineMessage, verifyLineWebhookSignature } from "@/lib/line-server";

export const runtime = "nodejs";

type LineWebhookEvent = {
  type?: string;
  replyToken?: string;
  source?: {
    type?: string;
    userId?: string;
  };
  message?: {
    type?: string;
    text?: string;
  };
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "LINE webhook endpoint is ready.",
  });
}

export async function POST(request: Request) {
  if (!hasLineMessagingEnv()) {
    return NextResponse.json({ error: "LINE環境変数が未設定です。" }, { status: 503 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature") || "";

  if (!verifyLineWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "LINE署名検証に失敗しました。" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { events?: LineWebhookEvent[] };
  const events = payload.events || [];

  try {
    const supabase = createSupabaseServerClient();

    for (const event of events) {
      const lineUserId = event.source?.userId || "";
      const replyToken = event.replyToken || "";
      const isUser = event.source?.type === "user";

      if (!lineUserId || !isUser) continue;

      if (event.type === "follow") {
        await supabase
          .from("users")
          .update({ line_user_id: lineUserId, updated_at: new Date().toISOString() })
          .eq("id", DEFAULT_OWNER_ID);

        if (replyToken) {
          await replyLineMessage(replyToken, [
            {
              type: "text",
              text: "友だち追加ありがとうございます。NSL LINE名刺CRM と連携しました。今後はこのLINEへ通知や下書き送信ができます。",
            },
          ]);
        }

        continue;
      }

      if (event.type === "message" && event.message?.type === "text") {
        const text = event.message.text?.trim() || "";
        const shouldConnect = text.includes("NSL連携") || text.toLowerCase() === "connect";

        if (shouldConnect) {
          await supabase
            .from("users")
            .update({ line_user_id: lineUserId, updated_at: new Date().toISOString() })
            .eq("id", DEFAULT_OWNER_ID);

          if (replyToken) {
            await replyLineMessage(replyToken, [
              {
                type: "text",
                text: "連携を完了しました。これで営業リマインドやAI下書きをこのLINEへ送れます。",
              },
            ]);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "LINE webhook処理に失敗しました。" },
      { status: 500 },
    );
  }
}
