import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requireServiceConfig } from "./supabase-env";

let adminClient: SupabaseClient | null = null;

/** کلاینت service-role را به‌صورت lazy می‌سازد (فقط سمت سرور). */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const { url, serviceKey } = requireServiceConfig();

  adminClient = createClient(url, serviceKey, {
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
