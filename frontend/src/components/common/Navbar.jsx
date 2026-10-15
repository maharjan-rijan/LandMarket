import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Logo from "@/components/common/Logo";
import Button from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/hooks/icons";

const links = [
  { to: PATHS.lands, label: "Lands" },
  { to: PATHS.vendors, label: "Sellers" },
  { to: PATHS.converter, label: "Area converter" },
];

const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="wrap">
        <nav className="nav-inner" aria-label="Main">
          <Logo />

          <div className="nav-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to={dashboardPath(user.role)} className={linkClass}>
                  Dashboard
                </NavLink>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to={PATHS.login} className={linkClass}>
                  Login
                </NavLink>
                <Button to={PATHS.register} size="sm">
                  Sell or buy land
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </nav>
      </div>

      {open && (
        <div className="mobile-menu">
          <div className="wrap flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={linkClass}
                onClick={close}
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink
                  to={dashboardPath(user.role)}
                  className={linkClass}
                  onClick={close}
                >
                  Dashboard
                </NavLink>
                <Button
                  variant="outline"
                  onClick={() => {
                    close();
                    logout();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to={PATHS.login} className={linkClass} onClick={close}>
                  Login
                </NavLink>
                <Button to={PATHS.register} onClick={close}>
                  Sell or buy land
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
