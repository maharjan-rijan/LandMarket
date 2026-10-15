import ContourBackdrop from "@/components/common/ContourBackdrop";
import PlotShape from "@/components/land/PlotShape";

// Shared wrapper for Login, Register and later Forgot/Reset password pages.
export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="auth-grid">
      <aside className="auth-side" aria-hidden="true">
        <ContourBackdrop />
        <div style={{ position: "relative", maxWidth: "26rem" }}>
          <h2 style={{ fontSize: "2.2rem" }}>Every plot on one sheet.</h2>
          <p className="text-muted mt-3">Boundary, road, area and papers, side by side, for buyers and sellers alike.</p>
        </div>
        <div className="hero-art" style={{ position: "relative", maxWidth: "28rem" }}>
          <div className="plot-sheet" style={{ borderBottom: 0 }}>
            <PlotShape seed="auth" areaAana={5} roadFt={20} animate />
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="w-full" style={{ maxWidth: "26rem" }}>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
          <div className="sheet sheet-pad mt-6">{children}</div>
          {footer && <p className="text-center text-sm text-muted mt-6">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
