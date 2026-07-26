import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * کلاینت عمومی Supabase را به‌صورت lazy می‌سازد.
 * ساخت کلاینت در زمان import انجام نمی‌شود تا build (مرحله‌ی collecting page data)
 * به‌خاطر نبود متغیرهای محیطی شکست نخورد.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "متغیرهای محیطی NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY تنظیم نشده‌اند."
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

/** سازگاری با کدهای قبلی: `supabase.auth...` همچنان کار می‌کند ولی lazy است. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});
