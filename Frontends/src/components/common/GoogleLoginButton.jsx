
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

const GoogleLoginButton = ({ role }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        toast.error("Google authentication failed");
        return;
      }

      setLoading(true);

      const response = await googleLogin(
        credentialResponse.credential,
        role
      );

      toast.success("Google login successful!");

      const loggedInRole = response?.role;

      if (loggedInRole === "jobseeker") {
        navigate("/jobseeker/dashboard", { replace: true });
      } else if (loggedInRole === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else {
        toast.error("Invalid user role");
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Google login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">

      {/* Custom Button Design */}
      <div
        className={`
          group relative flex w-full items-center justify-center
          gap-3 overflow-hidden rounded-xl
          border border-slate-200
          bg-white px-5 py-3.5
          text-sm font-semibold text-slate-700
          shadow-sm
          transition-all duration-300 ease-out
          hover:-translate-y-0.5
          hover:border-violet-300
          hover:bg-violet-50/40
          hover:shadow-[0_8px_20px_rgba(124,58,237,0.10)]
          ${loading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            >
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.79 7.18l7.73 6C44.39 38.02 46.98 31.9 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>

            <span className="tracking-[0.01em]">
              Continue with Google
            </span>
          </>
        )}
      </div>

      {/* Invisible official Google button overlay */}
      {!loading && (
        <div className="absolute inset-0 overflow-hidden opacity-0">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Google login failed")}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
