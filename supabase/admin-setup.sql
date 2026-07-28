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
-- ۶) اولین ادمین را بسازید
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
  (select exists(select 1 from storage.buckets where id = 'media')) as media_bucket;
