import { NextResponse } from "next/server";
import { Contact } from "@/lib/types";
import { createSupabaseServerClient, DEFAULT_OWNER_ID, hasSupabaseEnv } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    contactId?: string;
    activityDate?: string;
    activityType?: string;
    title?: string;
    detail?: string;
    nextAction?: string;
    nextFollowUpDate?: string;
  };

  if (!body.contactId || !body.activityDate || !body.activityType || !body.title) {
    return NextResponse.json({ error: "必須項目が不足しています。" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    const { addDemoActivity } = await import("@/lib/demo-store");
    await addDemoActivity({
      id: `demo-activity-${Date.now()}`,
      contactId: body.contactId,
      date: body.activityDate,
      type: body.activityType as Contact["activities"][number]["type"],
      title: body.title,
      detail: body.detail?.trim() || "",
      nextAction: body.nextAction?.trim() || undefined,
    });
    return NextResponse.json({
      mode: "mock",
      message: `デモモードで商談履歴「${body.title}」を追加しました。詳細画面に反映されます。`,
    });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("activity_logs").insert({
      contact_id: body.contactId,
      activity_date: body.activityDate,
      activity_type: body.activityType,
      title: body.title,
      detail: body.detail?.trim() || null,
      next_action: body.nextAction?.trim() || null,
      next_follow_up_date: body.nextFollowUpDate?.trim() || null,
      created_by: DEFAULT_OWNER_ID,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mode: "db", message: "商談履歴を保存しました。" });
  } catch {
    return NextResponse.json({ error: "商談履歴の保存に失敗しました。" }, { status: 500 });
  }
}
