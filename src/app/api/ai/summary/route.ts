import { NextResponse } from "next/server";
import { buildContactSummary } from "@/lib/ai";
import { createOpenAIClient, getOpenAIModel, hasOpenAIKey } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    personName?: string;
    businessCategory?: string;
    memo?: string;
    referrer?: string;
  };

  if (!body.companyName?.trim() || !body.personName?.trim()) {
    return NextResponse.json({ error: "会社名と氏名は必須です。" }, { status: 400 });
  }

  const fallbackMessage = buildContactSummary({
    companyName: body.companyName.trim(),
    personName: body.personName.trim(),
    businessCategory: body.businessCategory?.trim(),
    memo: body.memo?.trim(),
    referrer: body.referrer?.trim(),
  });

  if (!hasOpenAIKey()) {
    return NextResponse.json(
      {
        error: "OPENAI_API_KEY が未設定です。.env.local に API キーを設定してください。",
        fallbackMessage,
      },
      { status: 503 },
    );
  }

  try {
    const client = createOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      instructions:
        "あなたは日本の営業アシスタントです。名刺情報とメモから、営業担当がすぐ把握できる顧客要約を日本語で4行前後に要点整理してください。箇条書き中心で、推測は控えめにしてください。",
      input: `会社名: ${body.companyName}\n氏名: ${body.personName}\n業種: ${body.businessCategory || "未設定"}\n紹介者: ${body.referrer || "未設定"}\nメモ: ${body.memo || "なし"}`,
    });

    const message = response.output_text?.trim();
    if (!message) {
      return NextResponse.json({ error: "OpenAI API から要約を取得できませんでした。", fallbackMessage }, { status: 502 });
    }

    return NextResponse.json({ mode: "openai", model: getOpenAIModel(), message, fallbackMessage });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "OpenAI API 呼び出しに失敗しました。",
        fallbackMessage,
      },
      { status: 500 },
    );
  }
}
