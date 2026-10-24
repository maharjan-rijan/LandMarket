import { useState } from "react";
import { EyeIcon, EyeOffIcon, CloseIcon } from "@/hooks/icons";
import Button from "@/components/ui/Button";

// One field component for input, select, textarea, checkbox and radio.
//   <Input as="select">      takes <option> children.
//   <Input type="checkbox">  renders a bordered checkbox row with `label`.
//   hideLabel                keeps the label for screen readers only.
//   icon                     leading icon (e.g. <SearchIcon />).
//   onClear                  shows a clear button while the field has a value.
export default function Input({
  label,
  name,
  type = "text",
  as = "input",
  error,
  hint,
  hideLabel = false,
  icon,
  onClear,
  className = "",
  children,
  ...props
}) {
  const [show, setShow] = useState(false);

  if (type === "checkbox") {
    return (
      <label className={`check ${className}`}>
        <input type="checkbox" id={name} name={name} {...props} />
        {label}
      </label>
    );
  }

  // Native-looking controls skip the text-field styling.
  const bare = ["range", "file", "radio"].includes(type);
  const isPassword = type === "password" && as === "input";
  const hasClear = Boolean(onClear && props.value);
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
    className: [
      !bare && "input",
      error && "input-error",
      isPassword && "has-toggle",
      icon && "has-icon",
      hasClear && "has-clear",
    ]
      .filter(Boolean)
      .join(" "),
    ...props,
  };

  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={common.id} className={hideLabel ? "label sr-only" : "label"}>
          {label}
        </label>
      )}

      <div className="input-wrap">
        {icon && (
          <span className="input-icon" aria-hidden="true">
            {icon}
          </span>
        )}

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

        {hasClear && (
          <Button
            variant="icon"
            className="input-clear"
            aria-label="Clear search"
            onClick={onClear}
          >
            <CloseIcon size={18} />
          </Button>
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
