"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "مشکلی پیش آمده است.");
      }

      if (isLogin) {
        // هدایت کاربر به صفحه آزمون پس از ورود موفق
        router.push("/quiz");
      } else {
        // تغییر حالت به ورود پس از ثبت‌نام موفق
        setIsLogin(true);
        alert("ثبت‌نام موفقیت‌آمیز بود! اکنون وارد شوید.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1a] flex items-center justify-center p-4" style={{ direction: "rtl" }}>
      <div className="w-full max-w-md bg-gradient-to-br from-[#0f1f3d]/95 to-[#070d1a]/98 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-slate-200 mb-6">
          {isLogin ? "ورود به حساب کاربری" : "ساخت حساب کاربری"}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                className="w-full bg-[#0d1527] border border-blue-500/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">ایمیل</label>
            <input
              type="email"
              required
              className="w-full bg-[#0d1527] border border-blue-500/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 text-left transition"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">رمز عبور</label>
            <input
              type="password"
              required
              className="w-full bg-[#0d1527] border border-blue-500/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 text-left transition"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
          >
            {loading ? "در حال پردازش..." : isLogin ? "ورود" : "ثبت‌نام"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "هنوز ثبت‌نام نکرده‌اید؟ " : "قبلاً ثبت‌نام کرده‌اید؟ "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-blue-400 hover:underline font-medium focus:outline-none"
          >
            {isLogin ? "ایجاد حساب جدید" : "ورود به حساب"}
          </button>
        </div>
      </div>
    </div>
  );
}
