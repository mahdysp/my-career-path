import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * رمزگذاری متقارن برای رازهایی که باید در دیتابیس بمانند (کلید API سرویس‌ها).
 *
 * چرا AES-256-GCM و نه فقط AES-CBC یا base64:
 *   GCM علاوه بر محرمانگی، «اصالت» را هم تضمین می‌کند. اگر کسی به دیتابیس
 *   دسترسی خواندن/نوشتن پیدا کند و یک بایت از متن رمزشده را عوض کند،
 *   رمزگشایی با خطا شکست می‌خورد و مقدار دستکاری‌شده وارد سیستم نمی‌شود.
 *   base64 اصلاً رمزگذاری نیست و CBC بدون MAC در برابر دستکاری کور است.
 *
 * قالب خروجی:  v1.<base64(iv‖tag‖ciphertext)>
 *   iv  = ۱۲ بایت، برای هر بار رمزگذاری تصادفی و یکتا
 *   tag = ۱۶ بایت برچسب اصالت GCM
 *
 * نسخه در ابتدای رشته می‌آید تا اگر روزی الگوریتم عوض شد، مقدارهای قدیمی
 * همچنان قابل تشخیص و رمزگشایی باشند.
 */

const VERSION = "v1";
const IV_LEN = 12; // اندازه‌ی توصیه‌شده‌ی nonce برای GCM
const TAG_LEN = 16;

/** نمک ثابت برای مشتق‌کردن کلید از عبارت عبور دلخواه */
const KDF_SALT = "karex.ai.secrets.v1";

/** برچسب پیش‌فرض AAD — متن رمزشده را به کاربردش گره می‌زند */
const DEFAULT_AAD = "ai-provider-key";

/**
 * نبودِ کلید رمزگذاری یک خطای پیکربندی است، نه خطای کاربر.
 * جدا نگه داشته می‌شود تا لایه‌ی API بتواند پیام راهنمای دقیق بدهد.
 */
export class EncryptionUnavailableError extends Error {
  constructor() {
    super(
      "کلید رمزگذاری تنظیم نشده است. متغیر محیطی AI_ENCRYPTION_KEY را مقداردهی کنید " +
        "(مثلاً خروجی دستور: openssl rand -hex 32)."
    );
    this.name = "EncryptionUnavailableError";
  }
}

/** متن رمزشده معتبر نیست یا با کلید فعلی باز نمی‌شود */
export class DecryptionFailedError extends Error {
  constructor(cause?: unknown) {
    super(
      "رمزگشایی کلید ذخیره‌شده ممکن نشد. احتمالاً AI_ENCRYPTION_KEY بعد از ذخیره‌ی " +
        "کلید عوض شده است. کلید سرویس را دوباره وارد کنید."
    );
    this.name = "DecryptionFailedError";
    this.cause = cause;
  }
}

function rawSecret(): string | undefined {
  const v = process.env.AI_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  return v && v.trim() ? v.trim() : undefined;
}

/** آیا سرور برای نگهداری کلید رمزشده آماده است؟ */
export function isEncryptionConfigured(): boolean {
  return Boolean(rawSecret());
}

let cachedKey: Buffer | null = null;
let cachedFrom: string | null = null;

/**
 * کلید ۳۲ بایتی AES را از متغیر محیطی می‌سازد.
 *
 * سه قالب ورودی پذیرفته می‌شود تا کاربر مجبور نباشد قالب خاصی بسازد:
 *   ۱. ۶۴ کاراکتر hex  → مستقیم استفاده می‌شود (خروجی openssl rand -hex 32)
 *   ۲. base64 با ۳۲ بایت → مستقیم استفاده می‌شود
 *   ۳. هر رشته‌ی دیگر    → با scrypt به ۳۲ بایت کشیده می‌شود
 */
function aesKey(): Buffer {
  const raw = rawSecret();
  if (!raw) throw new EncryptionUnavailableError();

  // کش تا scrypt در هر درخواست دوباره اجرا نشود (عمداً کند است)
  if (cachedKey && cachedFrom === raw) return cachedKey;

  let key: Buffer;

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    let fromB64: Buffer | null = null;
    try {
      const b = Buffer.from(raw, "base64");
      if (b.length === 32) fromB64 = b;
    } catch {
      /* base64 نبود */
    }
    // scrypt عمداً کند است تا عبارت عبور کوتاه هم به‌سختی brute-force شود
    key = fromB64 ?? scryptSync(raw, KDF_SALT, 32);
  }

  cachedKey = key;
  cachedFrom = raw;
  return key;
}

/** رمزگذاری یک راز. خروجی برای ذخیره در ستون text آماده است. */
export function encryptSecret(plain: string, aad: string = DEFAULT_AAD): string {
  if (!plain) throw new Error("مقدار خالی قابل رمزگذاری نیست.");

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", aesKey(), iv, { authTagLength: TAG_LEN });
  cipher.setAAD(Buffer.from(aad, "utf8"));

  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${VERSION}.${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

/** رمزگشایی مقداری که با encryptSecret ساخته شده است. */
export function decryptSecret(blob: string, aad: string = DEFAULT_AAD): string {
  if (!blob) throw new DecryptionFailedError();

  const dot = blob.indexOf(".");
  const version = dot === -1 ? "" : blob.slice(0, dot);
  if (version !== VERSION) {
    throw new DecryptionFailedError(`نسخه‌ی ناشناخته: ${version || "بدون نسخه"}`);
  }

  try {
    const buf = Buffer.from(blob.slice(dot + 1), "base64");
    if (buf.length <= IV_LEN + TAG_LEN) throw new Error("طول داده کمتر از حد لازم است");

    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ct = buf.subarray(IV_LEN + TAG_LEN);

    const decipher = createDecipheriv("aes-256-gcm", aesKey(), iv, { authTagLength: TAG_LEN });
    decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(tag);

    // اگر متن دستکاری شده باشد، final() اینجا throw می‌کند
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch (e) {
    if (e instanceof EncryptionUnavailableError) throw e;
    throw new DecryptionFailedError(e);
  }
}

/**
 * نشانه‌ی کوتاه کلید برای نمایش در پنل — مثل «••••7f3a».
 *
 * کل کلید هیچ‌وقت به کلاینت برنمی‌گردد؛ فقط همین چند کاراکتر آخر تا ادمین
 * بتواند تشخیص دهد کدام کلید ذخیره شده است.
 */
export function keyHint(plain: string): string {
  const t = plain.trim();
  if (t.length <= 4) return "••••";
  return `••••${t.slice(-4)}`;
}
