export default function Avatar({ src, name, size = "md", showStatus, isOnline }) {
  const sizes = { xs:"h-7 w-7 text-xs", sm:"h-9 w-9 text-xs", md:"h-11 w-11 text-sm", lg:"h-14 w-14 text-base", xl:"h-20 w-20 text-xl" };
  const dotSizes = { xs:"h-2 w-2", sm:"h-2.5 w-2.5", md:"h-3 w-3", lg:"h-3.5 w-3.5", xl:"h-4 w-4" };
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "?";
  return (
    <div className={`relative flex-shrink-0 ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="h-full w-full rounded-full flex items-center justify-center font-semibold"
          style={{ background: "oklch(var(--b3))", color: "var(--text-secondary)" }}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span className={`${dotSizes[size]} absolute bottom-0 right-0 rounded-full border-2`}
          style={{ borderColor: "oklch(var(--b2))", background: isOnline ? "#00e676" : "var(--text-muted)" }} />
      )}
    </div>
  );
}
