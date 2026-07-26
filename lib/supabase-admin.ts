import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * کلاینت service-role را به‌صورت lazy می‌سازد (فقط سمت سرور).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "متغیرهای محیطی NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY تنظیم نشده‌اند."
    );
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}

/** سازگاری با کدهای قبلی: `supabaseAdmin.from(...)` همچنان کار می‌کند ولی lazy است. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver);
  },
});
