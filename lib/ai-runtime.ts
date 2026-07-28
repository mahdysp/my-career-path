import { getSupabaseAdmin } from "./supabase-admin";
import {
  AllProvidersFailedError,
  complete,
  renderTemplate,
  SchemaMissingError,
  type ChatMessage,
  type CompletionResult,
} from "./ai-providers";

/**
 * پل بین مسیرهای API و لایه‌ی سرویس‌دهنده‌ها.
 *
 * چرا جداست: مسیرهای quiz نباید بدانند قالب از کجا می‌آید یا کدام سرویس
 * جواب داده. آن‌ها فقط می‌گویند «این قالب را با این متغیرها اجرا کن».
 *
 * سازگاری با گذشته عمدی است: اگر جدول‌ها هنوز ساخته نشده‌اند یا هیچ سرویسی
 * تنظیم نشده، از GROQ_API_KEY محیطی استفاده می‌شود. بدون این، اجرای مهاجرت
 * دیتابیس تبدیل به پیش‌نیاز اجباری می‌شد و سایت موجود از کار می‌افتاد.
 */

type PromptRow = {
  key: string;
  system_prompt: string | null;
  template: string;
  temperature: number | null;
  max_tokens: number | null;
};

/** قالب‌های جایگزین وقتی دیتابیس در دسترس نیست */
type Fallback = { system: string; template: string; temperature: number; maxTokens: number };

async function loadPrompt(key: string): Promise<PromptRow | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("ai_prompts")
      .select("key, system_prompt, template, temperature, max_tokens")
      .eq("key", key)
      .maybeSingle();

    if (error) return null;
    return (data as PromptRow) ?? null;
  } catch {
    return null;
  }
}

/**
 * اجرای یک قالب روی اولین سرویس سالم.
 *
 * اگر هیچ سرویسی در دیتابیس نباشد ولی GROQ_API_KEY تنظیم شده باشد، همان
 * مسیر قدیمی استفاده می‌شود تا نصب‌های موجود بدون تغییر کار کنند.
 */
export async function runPrompt(
  key: string,
  vars: Record<string, string | number>,
  fallback: Fallback
): Promise<CompletionResult> {
  const row = await loadPrompt(key);

  const system = row?.system_prompt ?? fallback.system;
  const template = row?.template ?? fallback.template;
  const temperature = row?.temperature ?? fallback.temperature;
  const maxTokens = row?.max_tokens ?? fallback.maxTokens;

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: renderTemplate(template, vars) },
  ];

  try {
    return await complete({ messages, temperature, maxTokens });
  } catch (e) {
    // جدول نیست یا سرویسی تنظیم نشده → مسیر قدیمی
    const noProviders =
      e instanceof SchemaMissingError ||
      (e instanceof AllProvidersFailedError && e.attempts.length === 0);

    if (noProviders && process.env.GROQ_API_KEY) {
      return legacyGroq(messages, temperature, maxTokens);
    }
    throw e;
  }
}

/** مسیر قدیمی — مستقیم به Groq با کلید محیطی */
async function legacyGroq(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<CompletionResult> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message ?? JSON.stringify(j).slice(0, 200);
    } catch {
      /* بدنه JSON نبود */
    }
    throw new AllProvidersFailedError([
      { provider: "Groq (متغیر محیطی)", error: `HTTP ${res.status}${detail ? ` — ${detail}` : ""}` },
    ]);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) {
    throw new AllProvidersFailedError([{ provider: "Groq (متغیر محیطی)", error: "پاسخ خالی بود" }]);
  }

  return {
    text,
    provider: "Groq (متغیر محیطی)",
    providerId: "env",
    model: "llama-3.1-8b-instant",
    attempts: [],
  };
}

/**
 * پاک کردن حصار markdown و استخراج JSON.
 *
 * بعضی مدل‌ها با وجود دستور صریح، پاسخ را داخل ```json می‌پیچند یا یک جمله‌ی
 * توضیحی جلوش می‌گذارند. به‌جای شکست، اولین شیء JSON را بیرون می‌کشیم.
 */
export function parseJsonLoose<T>(text: string): T {
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as T;
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(clean.slice(start, end + 1)) as T;
    }
    throw new Error("پاسخ سرویس JSON معتبر نبود.");
  }
}

/** پیام فارسی مناسب کاربر از خطای سرویس‌ها */
export function aiErrorMessage(e: unknown): string {
  if (e instanceof SchemaMissingError) {
    return "سرویس هوش مصنوعی هنوز راه‌اندازی نشده است. با پشتیبانی تماس بگیرید.";
  }
  if (e instanceof AllProvidersFailedError) {
    return e.attempts.length
      ? "سرویس هوش مصنوعی در دسترس نیست. لطفاً چند لحظه بعد دوباره تلاش کنید."
      : "سرویس هوش مصنوعی هنوز پیکربندی نشده است. با پشتیبانی تماس بگیرید.";
  }
  return "خطا در ارتباط با سرویس هوش مصنوعی. لطفاً دوباره تلاش کنید.";
}
