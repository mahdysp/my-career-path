import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { handleRouteError } from "@/lib/route-error";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { SchemaMissingError, testProvider } from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

/**
 * آزمون واقعی اتصال به یک سرویس.
 *
 * عمداً یک درخواست کوچک ولی کامل به سرویس می‌فرستد: تنها راه مطمئن برای
 * اینکه بفهمیم کلید معتبر است، مدل وجود دارد و آدرس درست جواب می‌دهد.
 * یک بررسی سطحی (مثل ping به دامنه) می‌تواند سبز باشد در حالی که کلید غلط است.
 *
 * محدودیت نرخ دارد چون هر تماس هزینه‌ی واقعی روی سرویس دارد.
 */
export async function POST(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  const limited = await checkRateLimitAsync(req, {
    name: "ai-test",
    limit: 12,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const { id, apiKey } = (await req.json()) as { id?: string; apiKey?: string };
    if (!id) return NextResponse.json({ message: "شناسه‌ی سرویس لازم است." }, { status: 400 });

    // apiKey اختیاری است: اجازه می‌دهد کلید تازه پیش از ذخیره آزمایش شود
    const result = await testProvider(id, apiKey);

    await audit(check.admin, "ai.provider.test", {
      targetType: "ai_provider",
      targetId: id,
      detail: { ok: result.ok, ms: result.ms },
      req,
    });

    return check.applyCookies(NextResponse.json(result));
  } catch (e) {
    if (e instanceof SchemaMissingError) {
      return NextResponse.json({ message: e.message, code: "SCHEMA_MISSING" }, { status: 503 });
    }
    return handleRouteError(e);
  }
}
