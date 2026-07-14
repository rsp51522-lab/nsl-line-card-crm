import { NextResponse } from "next/server";
import { addDemoTag } from "@/lib/demo-store";
import { createSupabaseServerClient, DEFAULT_OWNER_ID, hasSupabaseEnv } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; color?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "タグ名は必須です。" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    await addDemoTag(name);
    return NextResponse.json({
      mode: "mock",
      message: `デモモードでタグ「${name}」を追加しました。タグ一覧に反映されます。`,
    });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("tags").insert({
      owner_user_id: DEFAULT_OWNER_ID,
      name,
      color: body.color?.trim() || "#163a70",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mode: "db", message: `タグ「${name}」を追加しました。` });
  } catch {
    return NextResponse.json({ error: "タグ追加に失敗しました。" }, { status: 500 });
  }
}
