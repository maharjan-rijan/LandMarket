import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/hooks/icons";

// One field component for input, select and textarea.
// <Input as="select"> takes <option> children.
export default function Input({
  label,
  name,
  type = "text",
  as = "input",
  error,
  hint,
  className = "",
  children,
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password" && as === "input";
  const Tag = as;

  const common = {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error
      ? `${name}-error`
      : hint
        ? `${name}-hint`
        : undefined,
    className: ["input", error && "input-error", isPassword && "has-toggle"]
      .filter(Boolean)
      .join(" "),
    ...props,
  };

  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}

      <div className="input-wrap">
        {as === "input" ? (
          <input type={isPassword && show ? "text" : type} {...common} />
        ) : (
          <Tag {...common}>{children}</Tag>
        )}

        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${name}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
