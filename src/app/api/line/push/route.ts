import { NextResponse } from "next/server";
import { DEFAULT_OWNER_ID, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { hasLineMessagingEnv } from "@/lib/line";
import { pushLineMessage } from "@/lib/line-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    to?: string;
    target?: "owner";
  };

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "送信本文が必要です。" }, { status: 400 });
  }

  if (!hasLineMessagingEnv()) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET が未設定です。" },
      { status: 503 },
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  try {
    const supabase = createSupabaseServerClient();
    let lineUserId = body.to?.trim() || "";

    if (!lineUserId && body.target === "owner") {
      const { data: user, error } = await supabase
        .from("users")
        .select("line_user_id")
        .eq("id", DEFAULT_OWNER_ID)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      lineUserId = user?.line_user_id || "";
    }

    if (!lineUserId) {
      return NextResponse.json({ error: "送信先のLINEユーザーIDが未連携です。" }, { status: 400 });
    }

    await pushLineMessage(lineUserId, [{ type: "text", text: message }]);

    return NextResponse.json({ message: "LINEへ送信しました。" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "LINE送信に失敗しました。" },
      { status: 500 },
    );
  }
}
