import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/roles";
import Loader from "@/components/common/Loader";

// Keeps logged-in users away from Login and Register.
export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  return <Outlet />;
}
