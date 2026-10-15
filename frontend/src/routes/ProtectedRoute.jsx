import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Loader from "@/components/common/Loader";

// <ProtectedRoute />                      any logged-in user
// <ProtectedRoute roles={["seller"]} />   only those roles
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  // Not logged in: go to login and remember where they wanted to go
  if (!user) {
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  // Wrong role: send them to their own dashboard. If that is where they already
  // are (unknown role), go home instead, so the redirect can never loop.
  if (roles && !roles.includes(user.role)) {
    const home = dashboardPath(user.role);
    return <Navigate to={home === location.pathname ? PATHS.home : home} replace />;
  }

  return <Outlet />;
}
