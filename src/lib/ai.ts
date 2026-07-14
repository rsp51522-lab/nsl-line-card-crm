type ThankYouInput = {
  companyName: string;
  personName: string;
  eventName?: string;
  memo?: string;
  nextAction?: string;
};

export function buildThankYouMessage(input: ThankYouInput) {
  const eventPart = input.eventName ? `${input.eventName}では` : "本日は";
  const memoPart = input.memo ? `、${input.memo.replace(/\s+/g, " ").slice(0, 50)}` : "";
  const nextPart = input.nextAction ? ` また、${input.nextAction}の件でも改めてご連絡いたします。` : "";

  return `${input.personName}様\n\n${eventPart}ありがとうございました。${input.companyName}のお話${memoPart}を伺えて、大変参考になりました。${nextPart}\n今後ともよろしくお願いいたします。\n\nNSL相談所 浅野`;
}

type SummaryInput = {
  companyName: string;
  personName: string;
  businessCategory?: string;
  memo?: string;
  referrer?: string;
};

export function buildContactSummary(input: SummaryInput) {
  return [
    `${input.companyName}は${input.businessCategory || "事業内容未分類"}の見込み顧客。`,
    `${input.personName}さんとの接点あり。`,
    input.referrer ? `紹介者は${input.referrer}。` : "紹介者情報は未登録。",
    input.memo ? `要点: ${input.memo.replace(/\s+/g, " ").slice(0, 70)}` : "要点メモは未登録。",
  ].join("\n");
}

type FollowUpInput = {
  companyName: string;
  personName: string;
  nextFollowUpType?: string;
  nextFollowUpDate?: string;
  memo?: string;
};

export function buildFollowUpSuggestion(input: FollowUpInput) {
  const type = input.nextFollowUpType || "連絡";
  const date = input.nextFollowUpDate || "近日中";
  const memo = input.memo ? `前回メモを踏まえると「${input.memo.replace(/\s+/g, " ").slice(0, 42)}」を切り口にすると自然です。` : "";

  return `${date}に${type}で接点を作るのが適切です。${input.personName}さんへは、前回のお礼を短く入れたうえで、具体的な次の提案を1つだけ送る流れがよいです。${memo}`;
}
