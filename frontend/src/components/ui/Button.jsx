import { Link } from "react-router-dom";

// Renders a <Link> when `to` is passed, otherwise a <button>.
export default function Button({ variant = "primary", size, loading = false, to, className = "", children, ...props }) {
  const cls = ["btn", `btn-${variant}`, size === "sm" && "btn-sm", className].filter(Boolean).join(" ");

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...props} disabled={loading || props.disabled}>
      {loading ? "Please wait..." : children}
    </button>
  );
}
