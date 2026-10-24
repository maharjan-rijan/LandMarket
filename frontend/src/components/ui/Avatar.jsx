import { useEffect, useState } from "react";

// A person's picture, or the first letter of their name when there is none
// (or when the picture cannot be loaded).
export default function Avatar({ src, name = "", size = 44, className = "" }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const box = { width: size, height: size, flex: "none", borderRadius: "var(--r-md)" };

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        className={className}
        style={{ ...box, display: "block", objectFit: "cover", background: "var(--terrace-wash)" }}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div className={`avatar ${className}`} aria-hidden="true" style={{ ...box, fontSize: size * 0.4 }}>
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}
