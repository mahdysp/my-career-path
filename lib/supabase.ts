import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requirePublicConfig } from "./supabase-env";

let client: SupabaseClient | null = null;

/**
 * کلاینت عمومی Supabase را به‌صورت lazy می‌سازد.
 * ساخت کلاینت در زمان import انجام نمی‌شود تا build (مرحله‌ی collecting page data)
 * به‌خاطر نبود متغیرهای محیطی شکست نخورد.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const { url, anonKey } = requirePublicConfig();
  client = createClient(url, anonKey);
  return client;
}

/** سازگاری با کدهای قبلی: `supabase.auth...` همچنان کار می‌کند ولی lazy است. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});
