import { useEffect } from "react";
import { NavContent } from "./NavContent";

/** The slide-in site navigation for small screens. */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (      <div className={`drawer-root${open ? " drawer-open" : ""}`}>
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        id="mobile-nav"
        className="drawer"
        role="dialog"
        aria-modal={open}
        aria-label="Site navigation"
        inert={!open}
      >
        <div className="drawer-head">
          <span className="drawer-title">Menu</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        <div className="drawer-scroll">
          <NavContent onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

/** The top-right hamburger that opens it. */
export function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="hamburger"
      onClick={onClick}
      aria-label={open ? "Close navigation" : "Open navigation"}
      aria-expanded={open}
      aria-controls="mobile-nav"
    >
      <span className="hamburger-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
