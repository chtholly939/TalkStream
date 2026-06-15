import { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown, Moon, Sun } from "lucide-react";
import { useThemeStore, THEMES, THEME_META } from "../store/useThemeStore";

export default function ThemeSelector({ collapsed = false, variant = "sidebar" }) {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = THEMES.filter((t) =>
    THEME_META[t].label.toLowerCase().includes(search.toLowerCase())
  );
  const dark = filtered.filter((t) => THEME_META[t].dark);
  const light = filtered.filter((t) => !THEME_META[t].dark);
  const currentMeta = THEME_META[theme] || THEME_META.dark;

  const isActiveDark = THEME_META[theme]?.dark ?? true;
  const labelColor = isActiveDark ? "#e5e7eb" : "#1f2937";

  // navbar variant button style matches the original LandingThemePicker
  const isNavbar = variant === "navbar";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? "Change theme" : ""}
        aria-label="Change theme"
        aria-expanded={open}
        className={
          isNavbar
            ? "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            : `sidebar-item w-full text-left ${collapsed ? "justify-center" : ""}`
        }
        style={
          isNavbar
            ? {
                background: "oklch(var(--b2) / 0.82)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                boxShadow: open ? "0 16px 34px rgba(0,0,0,0.18)" : "none",
              }
            : { color: "var(--text-secondary)" }
        }
      >
        <Palette size={16} />
        {!collapsed && (
          <>
            <span className={isNavbar ? "hidden max-w-24 truncate sm:inline" : "flex-1 text-sm"}>
              {isNavbar ? currentMeta.label : "Theme"}
            </span>
            {isNavbar ? (
              <ChevronDown
                size={14}
                className="hidden transition-transform duration-200 sm:block"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {currentMeta.emoji} {currentMeta.label}
                </span>
                <ChevronDown
                  size={13}
                  className="transition-transform duration-200"
                  style={{ transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--text-muted)" }}
                />
              </div>
            )}
          </>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            ...(isNavbar
              ? { right: 0, top: "calc(100% + 8px)" }
              : {
                  bottom: collapsed ? "0" : "calc(100% + 8px)",
                  left: collapsed ? "calc(100% + 8px)" : "0",
                }),
            width: "260px",
            background: "oklch(var(--b2))",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <Palette size={14} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>Choose Theme</span>
          </div>
          <div className="px-3 pt-3 pb-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search themes..." className="input-field text-xs py-2" autoFocus />
          </div>
          <div className="max-h-72 overflow-y-auto px-2 pb-3">
            {dark.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-2 py-1.5 mt-1">
                  <Moon size={10} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Dark</span>
                </div>
                {dark.map((t) => (
                  <ThemeOption key={t} name={t} meta={THEME_META[t]} active={theme === t} labelColor={labelColor}
                    onSelect={() => { setTheme(t); setOpen(false); setSearch(""); }} />
                ))}
              </>
            )}
            {light.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-2 py-1.5 mt-2">
                  <Sun size={10} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Light</span>
                </div>
                {light.map((t) => (
                  <ThemeOption key={t} name={t} meta={THEME_META[t]} active={theme === t} labelColor={labelColor}
                    onSelect={() => { setTheme(t); setOpen(false); setSearch(""); }} />
                ))}
              </>
            )}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>No themes match "{search}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeOption({ name, meta, active, onSelect, labelColor }) {
  return (
    <button onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150 text-left"
      style={{ background: active ? "oklch(var(--p) / 0.12)" : "transparent" }}>
      <div className="flex gap-0.5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10" style={{ width: 36, height: 20 }}>
        <div className="flex-1" style={{ background: "oklch(var(--p))" }} data-theme={name} />
        <div className="flex-1" style={{ background: "oklch(var(--s))" }} data-theme={name} />
        <div className="flex-1" style={{ background: "oklch(var(--a))" }} data-theme={name} />
        <div className="flex-1" style={{ background: "oklch(var(--n))" }} data-theme={name} />
      </div>
      <span className="flex-1 text-xs font-medium" style={{ color: labelColor }}>
        {meta.emoji} {meta.label}
      </span>
      {active && <Check size={13} style={{ color: "oklch(var(--p))", flexShrink: 0 }} />}
    </button>
  );
}