import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CRM_ORIGIN = "https://business-card-line-app-nsl.vercel.app";
const DEFAULT_FROM_ADDRESS = "asano@nextsaleslab.com";
const recentSends = new Map<string, number>();

type Card = {
  id?: string | number;
  email?: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    cardId?: string;
    subject?: string;
    message?: string;
  } | null;

  const token = cleanText(body?.token, 256);
  const cardId = cleanText(body?.cardId, 128);
  const subject = cleanText(body?.subject, 200);
  const message = cleanText(body?.message, 5000);

  if (!token || !cardId || !subject || !message) {
    return NextResponse.json(
      { error: "宛先・件名・本文を確認してください。" },
      { status: 400 },
    );
  }

  const smtpUser = process.env.GMAIL_ADDRESS?.trim();
  const smtpPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const fromAddress = process.env.THANK_YOU_FROM_ADDRESS?.trim() || DEFAULT_FROM_ADDRESS;

  if (!smtpUser || !smtpPassword) {
    return NextResponse.json(
      { error: "送信元メールの接続設定が完了していません。" },
      { status: 503 },
    );
  }

  const lastSentAt = recentSends.get(cardId) ?? 0;
  if (Date.now() - lastSentAt < 60_000) {
    return NextResponse.json(
      { error: "同じ方への連続送信を防止しました。1分後に再度お試しください。" },
      { status: 429 },
    );
  }

  try {
    const cardsResponse = await fetch(
      `${CRM_ORIGIN}/api/cards?token=${encodeURIComponent(token)}&q=&sort=newest`,
      { cache: "no-store" },
    );
    const cardsPayload = (await cardsResponse.json()) as { cards?: Card[]; error?: string };

    if (!cardsResponse.ok) {
      return NextResponse.json(
        { error: cardsPayload.error || "名刺情報を確認できませんでした。" },
        { status: 401 },
      );
    }

    const card = cardsPayload.cards?.find((item) => String(item.id) === cardId);
    const recipient = card?.email?.trim();

    if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) {
      return NextResponse.json(
        { error: "この名刺には送信できるメールアドレスが登録されていません。" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: {
        name: "NSL相談所 浅野",
        address: fromAddress,
      },
      replyTo: fromAddress,
      to: recipient,
      subject,
      text: message,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    recentSends.set(cardId, Date.now());
    return NextResponse.json({ ok: true, message: "お礼メールを送信しました。" });
  } catch (error) {
    console.error("thank-you email send failed", error);
    return NextResponse.json(
      { error: "メールを送信できませんでした。送信元の設定をご確認ください。" },
      { status: 500 },
    );
  }
}
