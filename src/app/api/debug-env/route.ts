import { NextResponse } from "next/server";
import { hasOpenAIKey } from "@/lib/openai";
import { hasSupabaseEnv } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    hasSupabaseEnv: hasSupabaseEnv(),
    hasOpenAIKey: hasOpenAIKey(),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasOpenAIModel: Boolean(process.env.OPENAI_MODEL),
  });
}
