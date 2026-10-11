import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { userRole, loading } = useAuth();
  const location = useLocation();

  // Wait for the session check to finish.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Checking your session
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we verify your account.
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login.
  if (!userRole) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Redirect users who don't have permission for this route.
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    const dashboard =
      userRole === "recruiter"
        ? "/recruiter/dashboard"
        : "/jobseeker/dashboard";

    return <Navigate to={dashboard} replace />;
  }

  // Allow access to the requested page.
  return <Outlet />;
}
