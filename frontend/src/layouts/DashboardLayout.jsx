import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { DASHBOARD_NAV } from "@/config/dashboardNav";
import { ROLES, ROLE_LABELS, ROLE_TONES } from "@/lib/roles";
import Loader from "@/components/common/Loader";
import Navbar from "@/components/common/Navbar";
import VerifyNotice from "@/components/auth/VerifyNotice";
import SampleNotice from "@/components/dashboard/SampleNotice";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

// One layout for every role: the sidebar comes from config/dashboardNav.js.
export default function DashboardLayout() {
  const { user } = useAuth();
  const { myStore, loading } = useData();

  const items = DASHBOARD_NAV[user.role] ?? DASHBOARD_NAV[ROLES.USER];
  const displayName =
    user.role === ROLES.SELLER ? myStore?.name || user.name : user.name;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div className="wrap flex-1">
        <div className="dash">
          <aside className="dash-aside" aria-label="Dashboard menu">
            <div className="dash-who">
              <Avatar src={user.avatar_url} name={displayName} />
              <div className="min-w-0">
                <p className="font-semibold truncate">{displayName}</p>
                <Badge tone={ROLE_TONES[user.role] ?? "gray"}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </Badge>
              </div>
            </div>
            <nav className="dash-nav" aria-label="Dashboard">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `dash-link${isActive ? " active" : ""}`
                  }
                >
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main id="main" className="dash-main">
            <VerifyNotice />
            <SampleNotice />
            {loading ? <Loader /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
