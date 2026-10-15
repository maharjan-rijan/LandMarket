const tones = {
  error: { border: "#e3b7af", bg: "var(--danger-wash)", color: "#8e2f21" },
  success: { border: "#b9d9c5", bg: "var(--terrace-wash)", color: "var(--terrace-dark)" },
  info: { border: "#bcd7e6", bg: "var(--river-wash)", color: "#1f4a63" },
};

export default function Alert({ type = "error", children }) {
  if (!children) return null;
  const t = tones[type];

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      style={{ border: `1px solid ${t.border}`, background: t.bg, color: t.color, borderRadius: "var(--r-md)", padding: ".75rem 1rem", fontSize: ".9rem" }}
    >
      {children}
    </div>
  );
}
