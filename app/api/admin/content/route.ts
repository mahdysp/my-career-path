import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import {
  DEFAULT_CONTENT,
  getSiteContent,
  setContentKey,
  type ContentKey,
} from "@/lib/site-content";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

/** کل محتوای قابل ویرایش سایت */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    return check.applyCookies(
      NextResponse.json({ content: await getSiteContent(), defaults: DEFAULT_CONTENT })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}

/** ذخیره‌ی یک کلید محتوا */
export async function PUT(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const { key, value } = (await req.json()) as { key?: string; value?: unknown };

    if (!key || !(key in DEFAULT_CONTENT)) {
      return NextResponse.json({ message: "کلید نامعتبر است." }, { status: 400 });
    }
    if (!value || typeof value !== "object") {
      return NextResponse.json({ message: "مقدار نامعتبر است." }, { status: 400 });
    }

    // سقف حجم تا یک ورودی خیلی بزرگ جدول را پر نکند
    if (JSON.stringify(value).length > 100_000) {
      return NextResponse.json({ message: "حجم محتوا بیش از حد است." }, { status: 400 });
    }

    await setContentKey(
      key as ContentKey,
      value as never,
      check.admin.user.id
    );

    await audit(check.admin, "content.update", {
      targetType: "content",
      targetId: key,
      req,
    });

    return check.applyCookies(NextResponse.json({ ok: true }));
  } catch (e) {
    return handleRouteError(e);
  }
}
