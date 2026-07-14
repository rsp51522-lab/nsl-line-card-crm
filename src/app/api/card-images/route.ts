import { NextResponse } from "next/server";
import { BUSINESS_CARD_BUCKET, ensureBusinessCardBucket, hasSupabaseEnv } from "@/lib/supabase";

export const runtime = "nodejs";

function getExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && fromName !== fileName.toLowerCase()) return fromName;
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "画像保存先が未接続です。Supabase設定後に利用できます。" }, { status: 503 });
  }

  const formData = await request.formData();
  const side = String(formData.get("side") || "");
  const file = formData.get("file");

  if (side !== "front" && side !== "back") {
    return NextResponse.json({ error: "画像の種類が不正です。" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルのみ保存できます。" }, { status: 400 });
  }

  try {
    const supabase = await ensureBusinessCardBucket();
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = getExtension(file.name, file.type);
    const storagePath = `captured/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${side}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(BUSINESS_CARD_BUCKET).upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUSINESS_CARD_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      message: side === "front" ? "表面画像を保存しました。" : "裏面画像を保存しました。",
      side,
      storagePath,
      mimeType: file.type,
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "画像保存に失敗しました。" },
      { status: 500 },
    );
  }
}
