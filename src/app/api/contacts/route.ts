import { NextResponse } from "next/server";
import { addDemoContact } from "@/lib/demo-store";
import { Contact } from "@/lib/types";
import { createSupabaseServerClient, DEFAULT_OWNER_ID, hasSupabaseEnv } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    personName?: string;
    department?: string;
    position?: string;
    postalCode?: string;
    address?: string;
    email?: string;
    phone?: string;
    mobilePhone?: string;
    fax?: string;
    websiteUrl?: string;
    eventName?: string;
    exchangedAt?: string;
    nextFollowUpDate?: string;
    nextFollowUpType?: string;
    memo?: string;
  };

  if (!body.companyName?.trim() || !body.personName?.trim()) {
    return NextResponse.json({ error: "会社名と氏名は必須です。" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    const id = `${body.companyName.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const contact: Contact = {
      id,
      companyName: body.companyName.trim(),
      personName: body.personName.trim(),
      department: body.department?.trim() || "",
      position: body.position?.trim() || "",
      postalCode: body.postalCode?.trim() || "",
      address: body.address?.trim() || "",
      email: body.email?.trim() || "",
      phone: body.phone?.trim() || "",
      mobilePhone: body.mobilePhone?.trim() || "",
      fax: body.fax?.trim() || "",
      websiteUrl: body.websiteUrl?.trim() || "",
      instagramUrl: "",
      lineUrl: "",
      facebookUrl: "",
      memo: body.memo?.trim() || "",
      aiSummary: [],
      tags: [],
      customerRank: 3,
      referrer: "",
      businessCategory: "",
      firstRegisteredAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      nextFollowUpDate: body.nextFollowUpDate?.trim() || "",
      nextFollowUpType: body.nextFollowUpType?.trim() || "",
      followUpStatus: "scheduled",
      exchangedAt: body.exchangedAt?.trim() || "",
      eventName: body.eventName?.trim() || "",
      frontImageLabel: "表面未登録",
      backImageLabel: "裏面未登録",
      ocrWarnings: [],
      activities: [],
      salesRecords: [],
    };
    await addDemoContact(contact);
    return NextResponse.json({
      mode: "mock",
      message: `デモモードで「${body.companyName} / ${body.personName}」を追加しました。一覧と検索に反映されます。`,
      id,
    });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("contacts").insert({
      owner_user_id: DEFAULT_OWNER_ID,
      company_name: body.companyName.trim(),
      person_name: body.personName.trim(),
      department: body.department?.trim() || null,
      position: body.position?.trim() || null,
      postal_code: body.postalCode?.trim() || null,
      address: body.address?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      mobile_phone: body.mobilePhone?.trim() || null,
      fax: body.fax?.trim() || null,
      website_url: body.websiteUrl?.trim() || null,
      business_card_event_name: body.eventName?.trim() || null,
      business_card_exchanged_at: body.exchangedAt?.trim() || null,
      next_follow_up_date: body.nextFollowUpDate?.trim() || null,
      next_follow_up_type: body.nextFollowUpType?.trim() || null,
      memo: body.memo?.trim() || null,
      first_registered_at: new Date().toISOString().slice(0, 10),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mode: "db", message: "名刺データを保存しました。" });
  } catch {
    return NextResponse.json({ error: "名刺データの保存に失敗しました。" }, { status: 500 });
  }
}
