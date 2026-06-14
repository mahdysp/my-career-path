import { NextResponse } from "next/server";
// در صورت استفاده از کتابخانه‌هایی مثل bcrypt برای هش کردن رمز عبور:
// import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // ۱. اعتبارسنجی اولیه داده‌ها
    if (!email || !password) {
      return NextResponse.json(
        { message: "لطفاً ایمیل و رمز عبور را وارد کنید." },
        { status: 400 }
      );
    }

    // ۲. اتصال به دیتابیس و بررسی تکراری نبودن ایمیل (نمونه فرضی)
    // const existingUser = await db.user.findUnique({ where: { email } });
    // if (existingUser) return NextResponse.json({ message: "این ایمیل قبلاً ثبت شده است." }, { status: 400 });

    // ۳. هش کردن رمز عبور
    // const hashedPassword = await bcrypt.hash(password, 10);

    // ۴. ذخیره کاربر در دیتابیس
    // const newUser = await db.user.create({ data: { email, password: hashedPassword, name } });

    return NextResponse.json(
      { message: "ثبت‌نام با موفقیت انجام شد." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "خطایی در سرور رخ داده است." },
      { status: 500 }
    );
  }
}
