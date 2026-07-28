import { getSupabaseAdmin } from "./supabase-admin";
import {
  decryptSecret,
  encryptSecret,
  isEncryptionConfigured,
  keyHint,
} from "./crypto-box";

/**
 * مدیریت سرویس‌دهنده‌های هوش مصنوعی سازگار با OpenAI.
 *
 * چرا این لایه وجود دارد: پیش از این، آدرس و مدل و کلید مستقیم داخل
 * Route Handlerها نوشته شده بود. هر تغییر سرویس یعنی تغییر کد و دیپلوی
 * دوباره؛ و اگر سرویس از کار می‌افتاد، کل آزمون از کار می‌افتاد.
 *
 * حالا: چند سرویس با اولویت مشخص ذخیره می‌شود و درخواست به‌ترتیب اولویت
 * روی آن‌ها امتحان می‌شود (failover). کلیدها با AES-256-GCM رمز شده‌اند و
 * هیچ‌وقت به کلاینت برنمی‌گردند.
 */

/* ────────────────────────── انواع ────────────────────────── */

export type AiProvider = {
  id: string;
  name: string;
  /** آدرس پایه سازگار با OpenAI — بدون /chat/completions انتهایی */
  baseUrl: string;
  model: string;
  enabled: boolean;
  /** کوچک‌تر = زودتر امتحان می‌شود */
  priority: number;
  timeoutMs: number;
  maxRetries: number;
  /** فقط نشانه‌ی چند رقم آخر کلید — برای نمایش در پنل */
  keyHint: string | null;
  hasKey: boolean;
  createdAt: string;
  updatedAt: string;
  lastOkAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
};

/** ردیف خام جدول — نام ستون‌ها snake_case است */
type Row = {
  id: string;
  name: string;
  base_url: string;
  model: string;
  enabled: boolean;
  priority: number;
  timeout_ms: number | null;
  max_retries: number | null;
  api_key_encrypted: string | null;
  api_key_hint: string | null;
  api_key_env: string | null;
  created_at: string;
  updated_at: string;
  last_ok_at: string | null;
  last_error_at: string | null;
  last_error: string | null;
};

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** پاسخ حتماً JSON باشد — روی سرویس‌هایی که پشتیبانی می‌کنند اعمال می‌شود */
  json?: boolean;
};

export type CompletionResult = {
  text: string;
  /** کدام سرویس در نهایت جواب داد */
  provider: string;
  providerId: string;
  model: string;
  /** سرویس‌هایی که قبل از موفقیت شکست خوردند */
  attempts: { provider: string; error: string }[];
};

/** هیچ سرویسی جواب نداد — پیام هر شکست برای عیب‌یابی نگه داشته می‌شود */
export class AllProvidersFailedError extends Error {
  readonly attempts: { provider: string; error: string }[];
  constructor(attempts: { provider: string; error: string }[]) {
    super(
      attempts.length
        ? `هیچ‌کدام از سرویس‌های هوش مصنوعی پاسخ ندادند (${attempts.length} تلاش).`
        : "هیچ سرویس هوش مصنوعی فعالی تنظیم نشده است."
    );
    this.name = "AllProvidersFailedError";
    this.attempts = attempts;
  }
}

/* ─────────────────── تشخیص نبودِ جدول ─────────────────── */

/**
 * اگر admin-setup.sql هنوز اجرا نشده باشد، جدول وجود ندارد.
 * این حالت باید از «خطای واقعی» تفکیک شود تا سایت با پیام راهنما بالا بیاید
 * نه با خطای مبهم دیتابیس.
 */
function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === "42P01" ||
    /relation .*ai_(providers|prompts).* does not exist/i.test(err.message ?? "") ||
    /could not find the table/i.test(err.message ?? "")
  );
}

export class SchemaMissingError extends Error {
  constructor(what: string) {
    super(
      `جدول ${what} در دیتابیس وجود ندارد. فایل supabase/admin-setup.sql را در ` +
        `Supabase → SQL Editor اجرا کنید.`
    );
    this.name = "SchemaMissingError";
  }
}

/* ────────────────────── خواندن سرویس‌ها ────────────────────── */

function toProvider(r: Row): AiProvider {
  return {
    id: r.id,
    name: r.name,
    baseUrl: r.base_url,
    model: r.model,
    enabled: r.enabled,
    priority: r.priority,
    timeoutMs: r.timeout_ms ?? 30_000,
    maxRetries: r.max_retries ?? 1,
    keyHint: r.api_key_hint,
    hasKey: Boolean(r.api_key_encrypted) || Boolean(r.api_key_env),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastOkAt: r.last_ok_at,
    lastErrorAt: r.last_error_at,
    lastError: r.last_error,
  };
}

/** همه‌ی سرویس‌ها به‌ترتیب اولویت — برای نمایش در پنل */
export async function listProviders(): Promise<AiProvider[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_providers")
    .select("*")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }

  return (data as Row[]).map(toProvider);
}

/**
 * کلید واقعی یک سرویس را برمی‌گرداند.
 *
 * دو منبع پشتیبانی می‌شود:
 *   ۱. ستون رمزشده در دیتابیس (از پنل وارد شده)
 *   ۲. نام یک متغیر محیطی — برای کسانی که ترجیح می‌دهند راز اصلاً وارد
 *      دیتابیس نشود. اولویت با متغیر محیطی است.
 */
function resolveKey(r: Row): string | null {
  if (r.api_key_env) {
    const v = process.env[r.api_key_env];
    if (v && v.trim()) return v.trim();
  }
  if (r.api_key_encrypted) {
    // رمزگشایی ممکن است شکست بخورد (کلید عوض شده) — بالادست مدیریت می‌شود
    return decryptSecret(r.api_key_encrypted);
  }
  return null;
}

/* ────────────────────── فراخوانی سرویس ────────────────────── */

/** خطای یک سرویس مشخص — پیام کوتاه و قابل نمایش */
function describeError(e: unknown): string {
  if (e instanceof Error) {
    if (e.name === "TimeoutError" || e.name === "AbortError") return "زمان پاسخ تمام شد";
    return e.message;
  }
  return String(e);
}

/** آیا این خطا با تلاش دوباره ممکن است حل شود؟ */
function isRetryable(status: number): boolean {
  // 429 = محدودیت نرخ، 5xx = مشکل موقت سمت سرویس
  return status === 429 || status === 408 || (status >= 500 && status < 600);
}

/** آدرس کامل chat/completions را از آدرس پایه می‌سازد */
export function completionsUrl(baseUrl: string): string {
  const base = baseUrl.trim().replace(/\/+$/, "");
  if (/\/chat\/completions$/.test(base)) return base;
  return `${base}/chat/completions`;
}

async function callOnce(
  r: Row,
  key: string,
  opts: CompletionOptions,
  timeoutMs: number
): Promise<string> {
  const body: Record<string, unknown> = {
    model: r.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4000,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch(completionsUrl(r.base_url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message ?? j?.message ?? JSON.stringify(j).slice(0, 200);
    } catch {
      detail = (await res.text().catch(() => "")).slice(0, 200);
    }
    const err = new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
    // برای تصمیم‌گیری درباره‌ی تلاش دوباره
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("پاسخ خالی بود");
  return text;
}

/** ثبت نتیجه‌ی آخرین تماس — برای نمایش وضعیت در پنل */
async function markResult(id: string, ok: boolean, error?: string) {
  try {
    const now = new Date().toISOString();
    await getSupabaseAdmin()
      .from("ai_providers")
      .update(
        ok
          ? { last_ok_at: now, last_error: null }
          : { last_error_at: now, last_error: (error ?? "").slice(0, 500) }
      )
      .eq("id", id);
  } catch {
    /* ثبت وضعیت نباید مسیر اصلی را از کار بیندازد */
  }
}

/**
 * درخواست را روی سرویس‌های فعال به‌ترتیب اولویت امتحان می‌کند.
 *
 * برای هر سرویس تا `max_retries` بار تلاش می‌شود، ولی فقط برای خطاهای
 * گذرا (۴۲۹ و ۵xx). خطای ۴۰۱ یعنی کلید غلط است و تلاش دوباره بی‌فایده —
 * بلافاصله سراغ سرویس بعدی می‌رویم.
 */
export async function complete(opts: CompletionOptions): Promise<CompletionResult> {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_providers")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Row[];
  const attempts: { provider: string; error: string }[] = [];

  for (const r of rows) {
    let key: string | null;
    try {
      key = resolveKey(r);
    } catch (e) {
      attempts.push({ provider: r.name, error: describeError(e) });
      continue;
    }
    if (!key) {
      attempts.push({ provider: r.name, error: "کلید تنظیم نشده است" });
      continue;
    }

    const timeoutMs = r.timeout_ms ?? 30_000;
    const tries = Math.max(1, Math.min(r.max_retries ?? 1, 4));

    for (let i = 0; i < tries; i++) {
      try {
        const text = await callOnce(r, key, opts, timeoutMs);
        void markResult(r.id, true);
        return {
          text,
          provider: r.name,
          providerId: r.id,
          model: r.model,
          attempts,
        };
      } catch (e) {
        const msg = describeError(e);
        const status = (e as Error & { status?: number }).status ?? 0;
        const last = i === tries - 1;

        // خطای دائمی (کلید غلط، مدل ناموجود) → تلاش دوباره بی‌فایده است
        if (!last && !isRetryable(status)) {
          attempts.push({ provider: r.name, error: msg });
          void markResult(r.id, false, msg);
          break;
        }

        if (last) {
          attempts.push({ provider: r.name, error: msg });
          void markResult(r.id, false, msg);
        } else {
          // مکث کوتاه فزاینده پیش از تلاش بعدی
          await new Promise((s) => setTimeout(s, 400 * (i + 1)));
        }
      }
    }
  }

  throw new AllProvidersFailedError(attempts);
}

/**
 * آزمون اتصال یک سرویس — واقعاً به سرویس وصل می‌شود.
 *
 * عمداً یک درخواست کامل و کوچک می‌فرستد (نه فقط ping): تنها راه مطمئن برای
 * اینکه بفهمیم کلید معتبر است، مدل وجود دارد و آدرس درست است.
 */
export async function testProvider(
  id: string,
  overrideKey?: string
): Promise<{ ok: boolean; ms: number; detail: string; model?: string }> {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_providers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }
  if (!data) throw new Error("سرویس پیدا نشد.");

  const r = data as Row;
  const started = Date.now();

  let key: string | null = null;
  try {
    key = overrideKey?.trim() ? overrideKey.trim() : resolveKey(r);
  } catch (e) {
    return { ok: false, ms: 0, detail: describeError(e) };
  }
  if (!key) {
    return { ok: false, ms: 0, detail: "کلید تنظیم نشده است." };
  }

  try {
    const text = await callOnce(
      r,
      key,
      {
        messages: [
          { role: "system", content: "You are a health check. Reply with exactly: OK" },
          { role: "user", content: "ping" },
        ],
        temperature: 0,
        maxTokens: 5,
      },
      Math.min(r.timeout_ms ?? 30_000, 20_000)
    );
    const ms = Date.now() - started;
    void markResult(r.id, true);
    return {
      ok: true,
      ms,
      model: r.model,
      detail: `پاسخ در ${ms} میلی‌ثانیه: ${text.trim().slice(0, 40)}`,
    };
  } catch (e) {
    const ms = Date.now() - started;
    const detail = describeError(e);
    void markResult(r.id, false, detail);
    return { ok: false, ms, detail };
  }
}

/* ────────────────────── نوشتن سرویس‌ها ────────────────────── */

export type ProviderInput = {
  name?: string;
  baseUrl?: string;
  model?: string;
  enabled?: boolean;
  priority?: number;
  timeoutMs?: number;
  maxRetries?: number;
  /** کلید جدید به‌صورت متن ساده — رمز می‌شود و خام ذخیره نمی‌شود */
  apiKey?: string;
  /** یا نام متغیر محیطی که کلید در آن است */
  apiKeyEnv?: string | null;
};

/** اعتبارسنجی مشترک ساخت و ویرایش */
function validate(input: ProviderInput, forCreate: boolean): string | null {
  if (forCreate || input.name !== undefined) {
    if (!input.name?.trim()) return "نام سرویس الزامی است.";
    if (input.name.trim().length > 60) return "نام سرویس بیش از حد بلند است.";
  }
  if (forCreate || input.baseUrl !== undefined) {
    const u = input.baseUrl?.trim();
    if (!u) return "آدرس سرویس الزامی است.";
    let parsed: URL;
    try {
      parsed = new URL(u);
    } catch {
      return "آدرس سرویس معتبر نیست.";
    }
    // جلوگیری از SSRF ساده: فقط http(s)
    if (!/^https?:$/.test(parsed.protocol)) return "آدرس باید با http یا https شروع شود.";
  }
  if (forCreate || input.model !== undefined) {
    if (!input.model?.trim()) return "نام مدل الزامی است.";
    if (input.model.trim().length > 120) return "نام مدل بیش از حد بلند است.";
  }
  if (input.timeoutMs !== undefined) {
    const t = Number(input.timeoutMs);
    if (!Number.isFinite(t) || t < 1000 || t > 120_000) {
      return "مهلت پاسخ باید بین ۱۰۰۰ تا ۱۲۰۰۰۰ میلی‌ثانیه باشد.";
    }
  }
  if (input.maxRetries !== undefined) {
    const n = Number(input.maxRetries);
    if (!Number.isInteger(n) || n < 1 || n > 4) return "تعداد تلاش باید بین ۱ تا ۴ باشد.";
  }
  if (input.apiKeyEnv) {
    if (!/^[A-Z0-9_]{2,64}$/.test(input.apiKeyEnv)) {
      return "نام متغیر محیطی فقط می‌تواند حروف بزرگ، رقم و زیرخط باشد.";
    }
  }
  return null;
}

/** بخش رمزنگاری‌شده‌ی ورودی را آماده می‌کند */
function keyFields(input: ProviderInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (input.apiKeyEnv !== undefined) {
    out.api_key_env = input.apiKeyEnv || null;
  }

  if (input.apiKey !== undefined) {
    const k = input.apiKey.trim();
    if (!k) {
      // رشته‌ی خالی یعنی «کلید ذخیره‌شده را پاک کن»
      out.api_key_encrypted = null;
      out.api_key_hint = null;
    } else {
      if (!isEncryptionConfigured()) {
        // بالادست به پیام این خطا نیاز دارد
        throw new Error(
          "برای ذخیره‌ی کلید، ابتدا متغیر محیطی AI_ENCRYPTION_KEY را تنظیم کنید " +
            "(خروجی: openssl rand -hex 32). یا به‌جای کلید، نام یک متغیر محیطی را وارد کنید."
        );
      }
      out.api_key_encrypted = encryptSecret(k);
      out.api_key_hint = keyHint(k);
    }
  }

  return out;
}

export async function createProvider(input: ProviderInput): Promise<AiProvider> {
  const bad = validate(input, true);
  if (bad) throw new Error(bad);

  const { data, error } = await getSupabaseAdmin()
    .from("ai_providers")
    .insert({
      name: input.name!.trim(),
      base_url: input.baseUrl!.trim(),
      model: input.model!.trim(),
      enabled: input.enabled ?? true,
      priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 100,
      timeout_ms: input.timeoutMs ?? 30_000,
      max_retries: input.maxRetries ?? 1,
      ...keyFields(input),
    })
    .select("*")
    .single();

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }
  return toProvider(data as Row);
}

export async function updateProvider(id: string, input: ProviderInput): Promise<AiProvider> {
  const bad = validate(input, false);
  if (bad) throw new Error(bad);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.baseUrl !== undefined) patch.base_url = input.baseUrl.trim();
  if (input.model !== undefined) patch.model = input.model.trim();
  if (input.enabled !== undefined) patch.enabled = input.enabled;
  if (input.priority !== undefined) patch.priority = Number(input.priority);
  if (input.timeoutMs !== undefined) patch.timeout_ms = Number(input.timeoutMs);
  if (input.maxRetries !== undefined) patch.max_retries = Number(input.maxRetries);
  Object.assign(patch, keyFields(input));

  const { data, error } = await getSupabaseAdmin()
    .from("ai_providers")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }
  if (!data) throw new Error("سرویس پیدا نشد.");
  return toProvider(data as Row);
}

export async function deleteProvider(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("ai_providers").delete().eq("id", id);
  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_providers");
    throw new Error(error.message);
  }
}

/* ────────────────────────── قالب‌ها ────────────────────────── */

export type AiPrompt = {
  id: string;
  key: string;
  title: string;
  description: string;
  system: string;
  template: string;
  /** نام متغیرهایی که در قالب مجازند — مثل {{query}} */
  variables: string[];
  temperature: number;
  maxTokens: number;
  updatedAt: string;
};

type PromptRow = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  system_prompt: string | null;
  template: string;
  variables: string[] | null;
  temperature: number | null;
  max_tokens: number | null;
  updated_at: string;
};

function toPrompt(r: PromptRow): AiPrompt {
  return {
    id: r.id,
    key: r.key,
    title: r.title,
    description: r.description ?? "",
    system: r.system_prompt ?? "",
    template: r.template,
    variables: r.variables ?? [],
    temperature: r.temperature ?? 0.7,
    maxTokens: r.max_tokens ?? 4000,
    updatedAt: r.updated_at,
  };
}

export async function listPrompts(): Promise<AiPrompt[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_prompts")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_prompts");
    throw new Error(error.message);
  }
  return (data as PromptRow[]).map(toPrompt);
}

export type PromptInput = {
  title?: string;
  description?: string;
  system?: string;
  template?: string;
  temperature?: number;
  maxTokens?: number;
};

export async function updatePrompt(key: string, input: PromptInput): Promise<AiPrompt> {
  if (input.template !== undefined && !input.template.trim()) {
    throw new Error("متن قالب نمی‌تواند خالی باشد.");
  }
  if (input.template !== undefined && input.template.length > 20_000) {
    throw new Error("متن قالب بیش از حد بلند است.");
  }
  if (input.temperature !== undefined) {
    const t = Number(input.temperature);
    if (!Number.isFinite(t) || t < 0 || t > 2) throw new Error("دما باید بین ۰ تا ۲ باشد.");
  }
  if (input.maxTokens !== undefined) {
    const n = Number(input.maxTokens);
    if (!Number.isInteger(n) || n < 64 || n > 32_000) {
      throw new Error("سقف توکن باید بین ۶۴ تا ۳۲۰۰۰ باشد.");
    }
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.system !== undefined) patch.system_prompt = input.system;
  if (input.template !== undefined) patch.template = input.template;
  if (input.temperature !== undefined) patch.temperature = Number(input.temperature);
  if (input.maxTokens !== undefined) patch.max_tokens = Number(input.maxTokens);

  const { data, error } = await getSupabaseAdmin()
    .from("ai_prompts")
    .update(patch)
    .eq("key", key)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) throw new SchemaMissingError("ai_prompts");
    throw new Error(error.message);
  }
  if (!data) throw new Error("قالب پیدا نشد.");
  return toPrompt(data as PromptRow);
}

/**
 * جای‌گذاری متغیرها در قالب.
 *
 * عمداً ساده و بدون اجرای کد: فقط {{name}} با مقدار جایگزین می‌شود.
 * متغیر ناشناخته دست‌نخورده می‌ماند تا در خروجی دیده شود و اشتباه پنهان نماند.
 */
export function renderTemplate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole
  );
}
