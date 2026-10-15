import { useData } from "@/store/DataContext";
import { CloseIcon } from "@/hooks/icons";

// Shows the last API error in the corner of the screen, wherever the person has scrolled.
export default function ApiErrorToast() {
  const { error, clearError } = useData();
  if (!error) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 60,
        maxWidth: "26rem",
        display: "flex",
        alignItems: "flex-start",
        gap: ".75rem",
        padding: ".8rem 1rem",
        border: "1px solid #e3b7af",
        borderRadius: "var(--r-md)",
        background: "var(--danger-wash)",
        color: "#8e2f21",
        fontSize: ".9rem",
      }}
    >
      <p style={{ flex: 1 }}>{error}</p>
      <button
        type="button"
        className="icon-btn"
        style={{ width: "1.75rem", height: "1.75rem" }}
        onClick={clearError}
        aria-label="Dismiss message"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
