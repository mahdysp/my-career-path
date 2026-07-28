import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { handleRouteError } from "@/lib/route-error";
import { isEncryptionConfigured } from "@/lib/crypto-box";
import {
  createProvider,
  deleteProvider,
  listProviders,
  SchemaMissingError,
  updateProvider,
  type ProviderInput,
} from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

/**
 * مدیریت سرویس‌دهنده‌های هوش مصنوعی.
 *
 * نکته‌ی امنیتی: هیچ‌کدام از این پاسخ‌ها کلید API را برنمی‌گردانند — نه خام
 * و نه رمزشده. فقط `keyHint` (چهار رقم آخر) برای تشخیص بصری فرستاده می‌شود.
 */

/** جدول نبودن یک خطای پیکربندی است، نه خرابی — پیام راهنما می‌دهیم */
function schemaResponse(e: SchemaMissingError) {
  return NextResponse.json({ message: e.message, code: "SCHEMA_MISSING" }, { status: 503 });
}

export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const providers = await listProviders();
    return check.applyCookies(
      NextResponse.json({
        providers,
        // پنل باید بداند آیا اصلاً می‌شود کلید ذخیره کرد
        encryption: isEncryptionConfigured(),
      })
    );
  } catch (e) {
    if (e instanceof SchemaMissingError) return schemaResponse(e);
    return handleRouteError(e);
  }
}

export async function POST(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const body = (await req.json()) as ProviderInput;
    const created = await createProvider(body);

    await audit(check.admin, "ai.provider.create", {
      targetType: "ai_provider",
      targetId: created.id,
      // کلید عمداً ثبت نمی‌شود — فقط اینکه کلیدی داده شده یا نه
      detail: { name: created.name, model: created.model, hasKey: created.hasKey },
      req,
    });

    return check.applyCookies(NextResponse.json({ provider: created }));
  } catch (e) {
    if (e instanceof SchemaMissingError) return schemaResponse(e);
    if (e instanceof Error && !(e instanceof SyntaxError)) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return handleRouteError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const { id, ...input } = (await req.json()) as ProviderInput & { id?: string };
    if (!id) return NextResponse.json({ message: "شناسه‌ی سرویس لازم است." }, { status: 400 });

    const updated = await updateProvider(id, input);

    await audit(check.admin, "ai.provider.update", {
      targetType: "ai_provider",
      targetId: id,
      detail: {
        name: updated.name,
        enabled: updated.enabled,
        // فقط این واقعیت که کلید عوض شد، نه خود کلید
        keyChanged: input.apiKey !== undefined,
      },
      req,
    });

    return check.applyCookies(NextResponse.json({ provider: updated }));
  } catch (e) {
    if (e instanceof SchemaMissingError) return schemaResponse(e);
    if (e instanceof Error && !(e instanceof SyntaxError)) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return handleRouteError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "شناسه‌ی سرویس لازم است." }, { status: 400 });

    await deleteProvider(id);

    await audit(check.admin, "ai.provider.delete", {
      targetType: "ai_provider",
      targetId: id,
      req,
    });

    return check.applyCookies(NextResponse.json({ ok: true }));
  } catch (e) {
    if (e instanceof SchemaMissingError) return schemaResponse(e);
    return handleRouteError(e);
  }
}
