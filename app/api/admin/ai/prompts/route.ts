import { NextRequest, NextResponse } from "next/server";
import { audit, checkAdmin, denied } from "@/lib/admin-auth";
import { handleRouteError } from "@/lib/route-error";
import {
  listPrompts,
  SchemaMissingError,
  updatePrompt,
  type PromptInput,
} from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

/** خواندن و ویرایش قالب‌های دستور */

export async function GET(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    return check.applyCookies(NextResponse.json({ prompts: await listPrompts() }));
  } catch (e) {
    if (e instanceof SchemaMissingError) {
      return NextResponse.json({ message: e.message, code: "SCHEMA_MISSING" }, { status: 503 });
    }
    return handleRouteError(e);
  }
}

export async function PUT(req: NextRequest) {
  const check = await checkAdmin(req);
  if (!check.ok) return denied(check);

  try {
    const { key, ...input } = (await req.json()) as PromptInput & { key?: string };
    if (!key) return NextResponse.json({ message: "کلید قالب لازم است." }, { status: 400 });

    const updated = await updatePrompt(key, input);

    await audit(check.admin, "ai.prompt.update", {
      targetType: "ai_prompt",
      targetId: key,
      req,
    });

    return check.applyCookies(NextResponse.json({ prompt: updated }));
  } catch (e) {
    if (e instanceof SchemaMissingError) {
      return NextResponse.json({ message: e.message, code: "SCHEMA_MISSING" }, { status: 503 });
    }
    if (e instanceof Error && !(e instanceof SyntaxError)) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return handleRouteError(e);
  }
}
