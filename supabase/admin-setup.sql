-- ═══════════════════════════════════════════════════════════════════
--  راه‌اندازی پنل مدیریت Karex
--
--  این فایل را یک‌بار در Supabase → SQL Editor اجرا کنید.
--  همه‌ی دستورها idempotent هستند (اجرای دوباره مشکلی ایجاد نمی‌کند).
-- ═══════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────
-- ۱) نقش کاربر
-- ───────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

-- حذف نرم: کاربر مسدود می‌شود ولی داده‌اش می‌ماند
alter table public.profiles
  add column if not exists banned_at timestamptz;

alter table public.profiles
  add column if not exists notes text;


-- ───────────────────────────────────────────────────────────────────
-- ۲) محتوای قابل ویرایش سایت
--
--  به‌جای یک جدول با ستون‌های ثابت، یک انبار کلید/مقدار JSON است تا
--  اضافه کردن بخش جدید به سایت نیازی به مهاجرت دیتابیس نداشته باشد.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

comment on table public.site_content is
  'محتوای قابل ویرایش صفحه‌ی اصلی — کلید مثل "showcase" یا "hero"';


-- ───────────────────────────────────────────────────────────────────
-- ۳) دفتر رویدادها
--
--  هر عمل حساس ادمین اینجا ثبت می‌شود. بدون این، اگر داده‌ای پاک شود
--  هیچ راهی برای فهمیدن اینکه چه کسی و کِی، وجود ندارد.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.admin_audit_log (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null,
  target_type text,
  target_id   text,
  detail      jsonb,
  ip          text
);

create index if not exists admin_audit_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_actor_idx
  on public.admin_audit_log (actor_id);


-- ───────────────────────────────────────────────────────────────────
-- ۴) امنیت سطح ردیف
--
--  همه‌ی نوشتن‌ها از سمت سرور با کلید service-role انجام می‌شود که RLS
--  را دور می‌زند. این سیاست‌ها فقط جلوی دسترسی مستقیم کلاینت را می‌گیرند.
-- ───────────────────────────────────────────────────────────────────

alter table public.site_content    enable row level security;
alter table public.admin_audit_log enable row level security;

-- محتوای سایت برای همه خواندنی است (صفحه‌ی اصلی عمومی است)
drop policy if exists "site_content readable by all" on public.site_content;
create policy "site_content readable by all"
  on public.site_content for select
  using (true);

-- دفتر رویدادها از سمت کلاینت اصلاً خواندنی نیست
drop policy if exists "audit log is server only" on public.admin_audit_log;
create policy "audit log is server only"
  on public.admin_audit_log for select
  using (false);


-- ───────────────────────────────────────────────────────────────────
-- ۵) مخزن فایل رسانه
--
--  اگر ساختن bucket از اینجا خطا داد، از داشبورد Supabase → Storage
--  یک bucket عمومی به نام media بسازید.
-- ───────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,  -- ۱۰ مگابایت
  array['image/png','image/jpeg','image/webp','image/avif','image/gif','image/svg+xml','video/mp4','video/webm']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- خواندن عمومی فایل‌ها؛ نوشتن فقط سمت سرور (service-role)
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');


-- ───────────────────────────────────────────────────────────────────
-- ۶) سرویس‌دهنده‌های هوش مصنوعی
--
--  چند سرویس سازگار با OpenAI با اولویت مشخص. درخواست به‌ترتیب priority
--  روی سرویس‌های فعال امتحان می‌شود؛ اگر یکی از کار بیفتد، بعدی جای آن را
--  می‌گیرد (failover) و آزمون کاربر قطع نمی‌شود.
--
--  کلید API هرگز خام ذخیره نمی‌شود:
--    api_key_encrypted  متن رمزشده با AES-256-GCM (کلید در AI_ENCRYPTION_KEY)
--    api_key_hint       فقط چهار رقم آخر، برای تشخیص در پنل
--    api_key_env        جایگزین: نام متغیر محیطی، تا راز اصلاً وارد دیتابیس نشود
-- ───────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

create table if not exists public.ai_providers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  base_url           text not null,
  model              text not null,
  enabled            boolean not null default true,
  -- کوچک‌تر = زودتر امتحان می‌شود
  priority           integer not null default 100,
  timeout_ms         integer not null default 30000,
  max_retries        integer not null default 1,
  api_key_encrypted  text,
  api_key_hint       text,
  api_key_env        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- آخرین نتیجه‌ی تماس واقعی — برای نمایش وضعیت در پنل
  last_ok_at         timestamptz,
  last_error_at      timestamptz,
  last_error         text
);

comment on table public.ai_providers is
  'سرویس‌های هوش مصنوعی سازگار با OpenAI، به‌ترتیب اولویت با failover';
comment on column public.ai_providers.api_key_encrypted is
  'رمزشده با AES-256-GCM — هرگز خام ذخیره یا به کلاینت ارسال نمی‌شود';

alter table public.ai_providers
  drop constraint if exists ai_providers_timeout_check;
alter table public.ai_providers
  add constraint ai_providers_timeout_check
  check (timeout_ms between 1000 and 120000);

alter table public.ai_providers
  drop constraint if exists ai_providers_retries_check;
alter table public.ai_providers
  add constraint ai_providers_retries_check
  check (max_retries between 1 and 4);

create index if not exists ai_providers_order_idx
  on public.ai_providers (enabled, priority, created_at);


-- ───────────────────────────────────────────────────────────────────
-- ۷) قالب‌های دستور (prompt)
--
--  متن دستورها از کد بیرون کشیده شده تا تغییر لحن یا قواعد آزمون نیازی
--  به دیپلوی دوباره نداشته باشد. هر قالب با یک key ثابت شناخته می‌شود که
--  کد به آن ارجاع می‌دهد.
--
--  variables فهرست متغیرهای مجاز است؛ در متن به شکل {{query}} می‌آیند.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.ai_prompts (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,
  title         text not null,
  description   text,
  system_prompt text,
  template      text not null,
  variables     text[] not null default '{}',
  temperature   real not null default 0.7,
  max_tokens    integer not null default 4000,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.ai_prompts is
  'قالب‌های دستور هوش مصنوعی — قابل ویرایش از پنل بدون تغییر کد';

alter table public.ai_prompts
  drop constraint if exists ai_prompts_temperature_check;
alter table public.ai_prompts
  add constraint ai_prompts_temperature_check
  check (temperature between 0 and 2);

alter table public.ai_prompts
  drop constraint if exists ai_prompts_tokens_check;
alter table public.ai_prompts
  add constraint ai_prompts_tokens_check
  check (max_tokens between 64 and 32000);

-- دو قالبی که کد به آن‌ها نیاز دارد. on conflict do nothing تا اجرای
-- دوباره‌ی این فایل ویرایش‌های شما را بازنویسی نکند.
insert into public.ai_prompts (key, title, description, system_prompt, template, variables, temperature, max_tokens)
values
  (
    'quiz.generate',
    'ساخت سوالات آزمون',
    'دستوری که سوالات آزمون مسیریابی شغلی را بر اساس حوزه‌ی انتخابی کاربر می‌سازد.',
    'You are a career counseling expert. Always respond with valid JSON only, no markdown, no extra text.',
    'شما یک متخصص مسیریابی شغلی هستید. کاربر می‌خواهد مسیر شغلی خود را در حوزه "{{query}}" کشف کند.

{{count}} سوال ترکیبی طراحی کن که:
- علایق، مهارت‌ها، شخصیت و اهداف کاربر را بسنجد
- مرتبط با حوزه "{{query}}" باشد
- به فارسی روان و ساده نوشته شده باشد
- از ساده به پیچیده پیش برود

فرمت خروجی باید دقیقاً این JSON باشد و هیچ متن اضافه یا markdown نداشته باشد:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "dimension": "I",
      "text": "متن سوال",
      "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"]
    },
    {
      "id": 2,
      "type": "likert",
      "dimension": "S",
      "text": "چقدر از کار تیمی لذت می‌بری؟",
      "scale": {
        "min": 1,
        "max": 5,
        "minLabel": "اصلاً",
        "maxLabel": "خیلی زیاد"
      }
    }
  ]
}

قواعد «dimension» (مدل RIASEC هالند) — این فیلد برای همه سوالات الزامی است:
  R = عمل‌گرا: ساختن، تعمیر، کار با ابزار و تجهیزات
  I = پژوهشگر: تحلیل، پژوهش، حل مسائل پیچیده
  A = هنرمند: خلاقیت، طراحی، بیان بصری
  S = اجتماعی: آموزش، کمک و خدمت به دیگران
  E = متهور: رهبری، مذاکره، توسعه کسب‌وکار
  C = منظم: نظم، داده، کار مبتنی بر رویه

مهم:
- هر شش بُعد باید حداقل یک سوال داشته باشد و توزیع تا حد امکان یکنواخت باشد.
- در سوالات چندگزینه‌ای، گزینه‌ها را از «بیشترین همسویی با آن بُعد» به
  «کمترین» مرتب کن؛ یعنی گزینه اول قوی‌ترین نشانه‌ی آن بُعد باشد.

برای {{count}} سوال، حدوداً {{mcCount}} تا multiple_choice و {{likertCount}} تا likert بیاور. فقط JSON خالص برگردان.',
    array['query', 'count', 'mcCount', 'likertCount'],
    0.7,
    4000
  ),
  (
    'quiz.analyze',
    'تحلیل نتیجه‌ی آزمون',
    'دستوری که از پاسخ‌های کاربر یک تحلیل شغلی کامل می‌سازد. درصد تطابق در کد محاسبه می‌شود، نه اینجا.',
    'You are a career counseling expert. Always respond with valid JSON only, no markdown, no extra text.',
    'شما یک مشاور ارشد مسیریابی شغلی هستید. کاربر آزمون مسیریابی شغلی در حوزه "{{query}}" را تکمیل کرده است.

پاسخ‌های کاربر:
{{qaText}}

بر اساس این پاسخ‌ها، یک تحلیل جامع و دقیق به فارسی ارائه بده.

فرمت خروجی باید دقیقاً این JSON باشد و هیچ متن اضافه یا markdown نداشته باشد:
{
  "summary": "یک پاراگراف کوتاه (۲-۳ جمله) درباره شخصیت و مسیر شغلی کاربر",
  "personality_traits": [
    {"trait": "نام ویژگی", "description": "توضیح کوتاه", "score": 85}
  ],
  "career_paths": [
    {
      "title": "عنوان مسیر شغلی",
      "holland_code": "IRC",
      "description": "توضیح این مسیر و چرا مناسب این کاربر است",
      "required_skills": ["مهارت ۱", "مهارت ۲", "مهارت ۳"],
      "avg_salary": "مثلاً ۱۵-۳۰ میلیون تومان"
    }
  ],
  "roadmap": [
    {
      "phase": "فاز ۱",
      "title": "عنوان فاز",
      "duration": "مثلاً ۳-۶ ماه",
      "steps": ["قدم ۱", "قدم ۲", "قدم ۳"]
    }
  ],
  "strengths": ["نقطه قوت ۱", "نقطه قوت ۲", "نقطه قوت ۳"],
  "areas_to_improve": ["حوزه بهبود ۱", "حوزه بهبود ۲"]
}

حتماً:
- برای هر مسیر شغلی، «holland_code» را بنویس: سه حرف از مدل RIASEC هالند،
  به ترتیب اهمیت برای آن شغل. حروف مجاز:
  R (عمل‌گرا)، I (پژوهشگر)، A (هنرمند)، S (اجتماعی)، E (متهور)، C (منظم).
  مثال: توسعه‌دهنده نرم‌افزار = "ICR" ، طراح رابط کاربری = "AIC".
  درصد تطابق را خودت محاسبه نکن؛ سیستم آن را از پاسخ‌های کاربر حساب می‌کند.
- حداقل ۳ مسیر شغلی پیشنهاد بده
- حداقل ۳ فاز در نقشه راه داشته باش
- همه چیز را به فارسی روان بنویس
- فقط JSON خالص برگردان',
    array['query', 'qaText'],
    0.7,
    4000
  )
on conflict (key) do nothing;


-- ───────────────────────────────────────────────────────────────────
-- ۸) امنیت سطح ردیف برای جدول‌های هوش مصنوعی
--
--  هر دو جدول کاملاً سمت-سروری هستند. کلید رمزشده هم نباید از سمت
--  کلاینت خواندنی باشد، حتی رمزشده.
-- ───────────────────────────────────────────────────────────────────

alter table public.ai_providers enable row level security;
alter table public.ai_prompts   enable row level security;

drop policy if exists "ai_providers server only" on public.ai_providers;
create policy "ai_providers server only"
  on public.ai_providers for select
  using (false);

drop policy if exists "ai_prompts server only" on public.ai_prompts;
create policy "ai_prompts server only"
  on public.ai_prompts for select
  using (false);


-- ───────────────────────────────────────────────────────────────────
-- ۹) اولین ادمین را بسازید
--
--  ایمیل زیر را با ایمیل خودتان عوض کنید و این خط را اجرا کنید.
--  (اگر ADMIN_EMAILS را در Vercel تنظیم کنید، این مرحله اختیاری است.)
-- ───────────────────────────────────────────────────────────────────

-- update public.profiles
--   set role = 'admin'
--   where email = 'you@example.com';


-- بررسی نهایی
select
  (select count(*) from public.profiles where role = 'admin') as admin_count,
  (select count(*) from public.site_content)                  as content_rows,
  (select exists(select 1 from storage.buckets where id = 'media')) as media_bucket,
  (select count(*) from public.ai_providers)                  as ai_providers,
  (select count(*) from public.ai_prompts)                    as ai_prompts;
