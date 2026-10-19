import { Link } from "react-router-dom";

const BASE = { icon: "icon-btn", chip: "chip" };

// variant: primary | accent | outline | ghost | danger | icon | chip
// - `to`     renders a <Link>
// - `as`     renders another element (e.g. as="label" htmlFor="file-id")
// - `active` marks a chip as selected (is-on + aria-pressed)
// Otherwise renders a <button type="button">.
export default function Button({
  variant = "primary",
  size,
  loading = false,
  active = false,
  to,
  as: Tag,
  className = "",
  children,
  ...props
}) {
  const cls = [
    BASE[variant] ?? `btn btn-${variant}`,
    size === "sm" && "btn-sm",
    active && "is-on",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  if (Tag) {
    return (
      <Tag className={cls} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={variant === "chip" ? active : undefined}
      {...props}
      disabled={loading || props.disabled}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
