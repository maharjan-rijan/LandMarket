import { getStrength } from "@/lib/password";

// Three bars and a word under the password field: Weak, Medium or Strong.
export default function PasswordStrength({ password }) {
  const { level, label, tips } = getStrength(password);
  if (!level) return null;

  return (
    <div className="strength" data-level={level} role="status" aria-live="polite">
      <div className="strength-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <p className="strength-label">
        Password strength: <strong>{label}</strong>
        {tips.length > 0 && <span className="strength-tip"> Tip: {tips[0]}.</span>}
      </p>
    </div>
  );
}
