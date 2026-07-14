import { createClient } from "@supabase/supabase-js";

export const DEFAULT_OWNER_ID = "11111111-1111-1111-1111-111111111111";
export const BUSINESS_CARD_BUCKET = "business-card-images";

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function ensureBusinessCardBucket() {
  const supabase = createSupabaseServerClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(listError.message);
  }

  if (buckets?.some((bucket) => bucket.name === BUSINESS_CARD_BUCKET)) {
    return supabase;
  }

  const { error: createError } = await supabase.storage.createBucket(BUSINESS_CARD_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(createError.message);
  }

  return supabase;
}
