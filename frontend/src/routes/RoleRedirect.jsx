import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Loader from "@/components/common/Loader";

// /dashboard -> the dashboard for whoever is logged in.
export default function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to={PATHS.login} state={{ from: { pathname: PATHS.dashboard } }} replace />;

  return <Navigate to={dashboardPath(user.role)} replace />;
}
