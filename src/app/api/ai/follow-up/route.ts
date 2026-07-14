import { NextResponse } from "next/server";
import { buildFollowUpSuggestion } from "@/lib/ai";
import { createOpenAIClient, getOpenAIModel, hasOpenAIKey } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    personName?: string;
    nextFollowUpType?: string;
    nextFollowUpDate?: string;
    memo?: string;
  };

  if (!body.companyName?.trim() || !body.personName?.trim()) {
    return NextResponse.json({ error: "会社名と氏名は必須です。" }, { status: 400 });
  }

  const fallbackMessage = buildFollowUpSuggestion({
    companyName: body.companyName.trim(),
    personName: body.personName.trim(),
    nextFollowUpType: body.nextFollowUpType?.trim(),
    nextFollowUpDate: body.nextFollowUpDate?.trim(),
    memo: body.memo?.trim(),
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
        "あなたは日本の営業アシスタントです。次回フォローの具体的な打ち手を日本語で3〜5文で提案してください。自然な連絡手段、切り口、送る内容、避けるべき強い売り込みを含めてください。",
      input: `会社名: ${body.companyName}\n氏名: ${body.personName}\n次回連絡種別: ${body.nextFollowUpType || "未設定"}\n次回連絡日: ${body.nextFollowUpDate || "未設定"}\nメモ: ${body.memo || "なし"}`,
    });

    const message = response.output_text?.trim();
    if (!message) {
      return NextResponse.json({ error: "OpenAI API から提案を取得できませんでした。", fallbackMessage }, { status: 502 });
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
