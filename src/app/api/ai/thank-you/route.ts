import { NextResponse } from "next/server";
import { buildThankYouMessage } from "@/lib/ai";
import { createOpenAIClient, getOpenAIModel, hasOpenAIKey } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    personName?: string;
    eventName?: string;
    memo?: string;
    nextAction?: string;
  };

  if (!body.companyName?.trim() || !body.personName?.trim()) {
    return NextResponse.json({ error: "会社名と氏名は必須です。" }, { status: 400 });
  }

  const fallbackMessage = buildThankYouMessage({
    companyName: body.companyName.trim(),
    personName: body.personName.trim(),
    eventName: body.eventName?.trim(),
    memo: body.memo?.trim(),
    nextAction: body.nextAction?.trim(),
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
        "あなたは日本の営業アシスタントです。名刺交換後に送るお礼LINEまたはお礼メールの本文だけを自然な日本語で作成してください。丁寧だが固すぎず、120〜220文字程度、売り込み過多にせず、次回アクションがあれば最後に1文だけ自然に添えてください。",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `会社名: ${body.companyName.trim()}`,
                `氏名: ${body.personName.trim()}`,
                `イベント: ${body.eventName?.trim() || "未指定"}`,
                `メモ: ${body.memo?.trim() || "なし"}`,
                `次回アクション: ${body.nextAction?.trim() || "なし"}`,
                "出力条件: 件名や説明は不要。送信本文のみ。",
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const message = response.output_text?.trim();

    if (!message) {
      return NextResponse.json(
        {
          error: "OpenAI API から本文を取得できませんでした。",
          fallbackMessage,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      mode: "openai",
      model: getOpenAIModel(),
      message,
      fallbackMessage,
    });
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
