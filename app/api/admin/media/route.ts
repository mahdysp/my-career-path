import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

const BUCKET = "media";
const MAX_BYTES = 10 * 1024 * 1024; // ۱۰ مگابایت

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
]);

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** فهرست فایل‌های آپلودشده */
export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.storage.from(BUCKET).list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      /* اگر bucket ساخته نشده باشد، به‌جای خطای مبهم راهنمایی بده */
      const missing = /not found|does not exist/i.test(error.message);
      return NextResponse.json(
        {
          files: [],
          error: missing
            ? "مخزن media وجود ندارد. فایل supabase/admin-setup.sql را در Supabase اجرا کنید."
            : error.message,
        },
        { status: missing ? 200 : 500 }
      );
    }

    const files = (data ?? [])
      .filter((f) => f.id) // پوشه‌ها id ندارند
      .map((f) => ({
        name: f.name,
        size: (f.metadata as { size?: number } | null)?.size ?? 0,
        type: (f.metadata as { mimetype?: string } | null)?.mimetype ?? "",
        createdAt: f.created_at,
        url: db.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      }));

    return check.applyCookies(NextResponse.json({ files }));
  } catch (e) {
    return handleRouteError(e);
  }
}

/** آپلود فایل تازه */
export async function POST(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "فایلی ارسال نشد." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: `حجم فایل بیش از ${MAX_BYTES / 1024 / 1024} مگابایت است.` },
        { status: 400 }
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { message: `نوع فایل «${file.type || "نامشخص"}» پشتیبانی نمی‌شود.` },
        { status: 400 }
      );
    }

    /* نام امن: نام اصلی فقط برای خوانایی نگه داشته می‌شود؛ یکتایی از
       زمان و یک رشته‌ی تصادفی می‌آید تا آپلود هم‌نام رونویسی نکند. */
    const base = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9آ-ی\-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48)
      .replace(/^-|-$/g, "") || "file";
    const stamp = new Date().toISOString().slice(0, 10);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${stamp}-${base}-${rand}.${EXT[file.type]}`;

    const db = getSupabaseAdmin();
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      const missing = /not found|does not exist|bucket/i.test(error.message);
      return NextResponse.json(
        {
          message: missing
            ? "مخزن media وجود ندارد. فایل supabase/admin-setup.sql را در Supabase اجرا کنید."
            : error.message,
        },
        { status: 400 }
      );
    }

    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

    await audit(check.admin, "media.upload", {
      targetType: "media",
      targetId: path,
      detail: { size: file.size, type: file.type },
      req,
    });

    return check.applyCookies(
      NextResponse.json({ ok: true, file: { name: path, url, size: file.size, type: file.type } })
    );
  } catch (e) {
    return handleRouteError(e);
  }
}

/** حذف فایل */
export async function DELETE(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const name = req.nextUrl.searchParams.get("name");
    if (!name) return NextResponse.json({ message: "نام فایل لازم است." }, { status: 400 });

    const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([name]);
    if (error) throw new Error(error.message);

    await audit(check.admin, "media.delete", { targetType: "media", targetId: name, req });

    return check.applyCookies(NextResponse.json({ ok: true }));
  } catch (e) {
    return handleRouteError(e);
  }
}
