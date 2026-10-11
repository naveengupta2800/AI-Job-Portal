
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await verifyOTP(otp);

      toast.success(data.message || "Email verified successfully!");

      if (data.role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else if (data.role === "jobseeker") {
        navigate("/jobseeker/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "OTP verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
        <Link to="/" className="mb-10 inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <BriefcaseBusiness size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Career<span className="text-violet-600">AI</span>
          </span>
        </Link>

        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <MailCheck size={32} />
        </div>

        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
          Email verification
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter the 6-digit verification code sent to your registered email
          address.
        </p>

        {email && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <MailCheck size={19} className="shrink-0 text-slate-500" />
            <span className="break-all text-sm font-semibold text-slate-700">
              {email}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Verification code
            </label>

            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.45em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm leading-5 text-emerald-800">
            <ShieldCheck size={19} className="mt-0.5 shrink-0" />
            <p>
              Your email helps us verify your account and keep your career
              profile secure.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-violet-200/70 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify and continue"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified?{" "}
          <Link
            to="/login"
            className="font-bold text-violet-600 hover:text-violet-700"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          The verification code expires after 10 minutes.
        </p>
      </div>
    </main>
  );
}
