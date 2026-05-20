import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, Check, ChevronDown, Palette } from "lucide-react";
import useLogin from "../hooks/useLogin";
import { useThemeStore, THEMES, THEME_META } from "../store/useThemeStore";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { isPending, loginMutation } = useLogin();
  const { theme, setTheme } = useThemeStore();
  const themeMenuRef = useRef(null);
  const currentTheme = THEME_META[theme] || THEME_META.dark;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 mesh-bg">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "oklch(var(--b2) / 0.82)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} />
          Back to landing
        </Link>

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/TSlogo.png"
            alt="TalkStream logo"
            className="mb-3 h-14 w-14 rounded-2xl object-contain"
            style={{ boxShadow: "0 8px 32px oklch(var(--p)/0.3)" }}
          />
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to your TalkStream account</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isPending}
              className="btn-brand w-full py-3 flex items-center justify-center gap-2">
              {isPending && <Loader2 size={18} className="animate-spin" />}
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold hover:opacity-80" style={{ color: "oklch(var(--p))" }}>Create one</Link>
        </p>

        <div className="relative mt-8 flex justify-center" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "oklch(var(--b2) / 0.9)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              boxShadow: themeMenuOpen ? "0 16px 36px rgba(0,0,0,0.18)" : "none",
            }}
          >
            <Palette size={16} />
            <span>{currentTheme.label}</span>
            <ChevronDown
              size={14}
              className="transition-transform duration-200"
              style={{ transform: themeMenuOpen ? "rotate(180deg)" : "rotate(0)" }}
            />
          </button>

          {themeMenuOpen && (
            <div
              className="absolute bottom-full z-50 mb-3 w-72 overflow-hidden rounded-2xl shadow-2xl animate-fade-in"
              style={{
                background: "oklch(var(--b2))",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
              }}
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <Palette size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Choose theme
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {THEMES.map((name) => {
                  const meta = THEME_META[name];
                  const active = theme === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      data-theme={name}
                      onClick={() => {
                        setTheme(name);
                        setThemeMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150 hover:bg-base-300"
                      style={{ background: active ? "oklch(var(--p) / 0.12)" : "transparent" }}
                    >
                      <span className="flex h-5 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                        <span className="flex-1" style={{ background: "oklch(var(--p))" }} />
                        <span className="flex-1" style={{ background: "oklch(var(--s))" }} />
                        <span className="flex-1" style={{ background: "oklch(var(--a))" }} />
                        <span className="flex-1" style={{ background: "oklch(var(--n))" }} />
                      </span>
                      <span className="flex-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {meta.label}
                      </span>
                      {active && <Check size={13} style={{ color: "oklch(var(--p))", flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
