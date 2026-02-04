import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/store/store";
import { DatabaseStatus } from "@/store/types";
import { UserRoles } from "@/store/types/auth";
import { Error403Page } from "@/views/error/403";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  role?: UserRoles | UserRoles[];
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (auth.status !== DatabaseStatus.ACTIVE) return <Error403Page />;

  // No role restriction
  if (role === undefined) return <Outlet />;

  const roles: UserRoles[] = Array.isArray(role) ? role : [role];
  if (roles?.length > 0 && !roles.includes(auth.role)) return <Error403Page />;

  return <Outlet />;
}