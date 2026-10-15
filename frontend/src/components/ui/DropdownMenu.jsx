import { ChevronDownIcon } from "@/hooks/icons";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const GAP = 4;
const EDGE = 8;

export default function DropdownMenu({
  label = "Actions",
  items,
  align = "right",
  size = "sm",
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();

  // indexes of the items that can be chosen
  const enabled = items
    .map((it, i) => (it.disabled ? null : i))
    .filter((i) => i !== null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    setPos(null);
    setActive(-1);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = (fromEnd = false) => {
    setOpen(true);
    setActive(enabled.length ? enabled[fromEnd ? enabled.length - 1 : 0] : -1);
  };

  // Place the menu once it has been drawn and measured (it starts hidden at the corner).
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const b = triggerRef.current.getBoundingClientRect();
    const { width, height } = menuRef.current.getBoundingClientRect();

    let left = align === "right" ? b.right - width : b.left;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE));

    const roomBelow = window.innerHeight - b.bottom;
    const flipUp = roomBelow < height + EDGE && b.top > height + EDGE;

    setPos({ left, top: flipUp ? b.top - height - GAP : b.bottom + GAP });
  }, [open, align]);

  // Move keyboard focus to the highlighted item. preventScroll: scrolling would close the menu.
  useEffect(() => {
    if (open && pos && active >= 0)
      itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, pos, active]);

  // Close on outside click, on scroll and on resize (the menu is placed with fixed coordinates).
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      )
        close(false);
    };
    const dismiss = () => close(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open, close]);

  const onTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu(e.key === "ArrowUp");
    }
  };

  const onMenuKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      close(false);
      return;
    }
    if (!enabled.length) return;

    const at = enabled.indexOf(active);
    let next = null;
    if (e.key === "ArrowDown") next = enabled[(at + 1) % enabled.length];
    else if (e.key === "ArrowUp")
      next = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];

    if (next !== null) {
      e.preventDefault();
      setActive(next);
    }
  };

  const choose = (item) => {
    if (item.disabled) return;
    close();
    item.onSelect();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`btn btn-outline${size === "sm" ? " btn-sm" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
        <ChevronDownIcon size={16} aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            style={{
              position: "fixed",
              zIndex: 50,
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              visibility: pos ? "visible" : "hidden",
              minWidth: "11rem",
              padding: ".25rem",
              background: "var(--surface)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--r-md)",
              boxShadow: "0 10px 28px rgba(23, 51, 42, 0.16)",
            }}
          >
            {items.map((item, i) => (
              <Fragment key={item.label}>
                {item.separatorBefore && (
                  <div
                    role="separator"
                    style={{
                      height: 1,
                      margin: ".25rem 0",
                      background: "var(--line)",
                    }}
                  />
                )}
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onClick={() => choose(item)}
                  onMouseEnter={() => !item.disabled && setActive(i)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    padding: ".5rem .75rem",
                    border: 0,
                    borderRadius: "var(--r-sm)",
                    background:
                      active === i
                        ? item.danger
                          ? "var(--danger-wash)"
                          : "var(--terrace-wash)"
                        : "transparent",
                    color: item.danger ? "var(--danger)" : "var(--ink)",
                    font: "inherit",
                    fontSize: ".9rem",
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    opacity: item.disabled ? 0.55 : 1,
                  }}
                >
                  {item.label}
                  {item.hint && (
                    <span
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 400,
                        color: "var(--muted)",
                      }}
                    >
                      {item.hint}
                    </span>
                  )}
                </button>
              </Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
