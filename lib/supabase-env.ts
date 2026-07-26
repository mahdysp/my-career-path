/**
 * خواندن و اعتبارسنجی متغیرهای محیطی Supabase.
 *
 * نکته: متغیرهای `NEXT_PUBLIC_*` در زمان build داخل باندل کلاینت جاسازی می‌شوند،
 * ولی در Route Handlerها در زمان اجرا از process.env خوانده می‌شوند. اگر روی
 * Vercel این متغیرها برای محیط Production تعریف نشده باشند (یا بعد از آخرین
 * build اضافه شده باشند و ری‌دیپلوی نشده باشد)، اینجا undefined می‌مانند.
 *
 * برای انعطاف بیشتر، نام‌های بدون پیشوند هم به‌عنوان جایگزین پذیرفته می‌شوند.
 */

/** خطای پیکربندی — از خطای «نام کاربری/رمز اشتباه» قابل تفکیک است. */
export class SupabaseConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`پیکربندی سرور ناقص است. متغیرهای محیطی زیر تنظیم نشده‌اند: ${missing.join(", ")}`);
    this.name = "SupabaseConfigError";
    this.missing = missing;
  }
}

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

/** اگر پیکربندی ناقص باشد، خطای مشخص پرتاب می‌کند. */
export function requirePublicConfig(): { url: string; anonKey: string } {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length) throw new SupabaseConfigError(missing);

  return { url: url!, anonKey: anonKey! };
}

export function requireServiceConfig(): { url: string; serviceKey: string } {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) throw new SupabaseConfigError(missing);

  return { url: url!, serviceKey: serviceKey! };
}
