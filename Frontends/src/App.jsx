import { Navigate, Route, Routes } from "react-router-dom";

// Public pages
import HomePage from "./pages/public/HomePage";
import Jobs from "./pages/public/Jobs";
import JobDetails from "./pages/JobDetailsPage";

// Authentication pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";

// Common components and layouts
import ProtectedRoute from "./components/common/ProtectedRoute";
import JobSeekerLayout from "./components/layout/JobSeekerLayout";
import RecruiterLayout from "./components/layout/RecruiterLayout";
import { useAuth } from "./context/AuthContext";

// Job seeker pages
import JobSeekerDashboard from "./pages/jobseeker/JobSeekerDashboard";
import MyApplicationsPage from "./pages/jobseeker/MyApplicationsPage";
import SavedJobsPage from "./pages/jobseeker/SavedJobsPage";
import JobSeekerProfile from "./pages/jobseeker/JobSeekerProfile";
import AIProfileAnalysisPage from "./pages/jobseeker/AIProfileAnalysisPage";
import AIJobMatchingPage from "./pages/jobseeker/AIJobMatchingPage";
import AICareerAssistantPage from "./pages/jobseeker/AICareerAssistantPage";

// Recruiter pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import RecruiterMyJobs from "./pages/recruiter/RecruiterMyJobs";
import RecruiterApplications from "./pages/recruiter/RecruiterApplications";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import RecruiterBilling from "./pages/recruiter/RecruiterBilling";
import RecruiterAnalytics from "./pages/recruiter/RecruiterAnalytics";

// Placeholder for pages not implemented yet
function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        This page will be implemented next.
      </p>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
      >
        Go Back
      </button>
    </div>
  );
}

// Jobs route:
// Job seekers get the sidebar layout.
// Other users get the public Jobs page.
function JobsRoute() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (userRole === "jobseeker") {
    return (
      <JobSeekerLayout>
        <Jobs embedded />
      </JobSeekerLayout>
    );
  }

  return <Jobs />;
}

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<HomePage />} />

      {/* Public job browsing */}
      <Route path="/jobs" element={<JobsRoute />} />

      <Route path="/jobs/:jobId" element={<JobDetails />} />

      {/* ================= AUTH ROUTES ================= */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/verify-otp" element={<VerifyOTP />} />

      <Route
        path="/forgot-password"
        element={<PlaceholderPage title="Password Recovery" />}
      />

      {/* ================= JOB SEEKER ROUTES ================= */}

      <Route element={<ProtectedRoute allowedRoles={["jobseeker"]} />}>
        <Route element={<JobSeekerLayout />}>
          <Route
            path="/jobseeker/dashboard"
            element={<JobSeekerDashboard />}
          />

          <Route
            path="/jobseeker/applications"
            element={<MyApplicationsPage />}
          />

          <Route
            path="/jobseeker/saved-jobs"
            element={<SavedJobsPage />}
          />

          <Route
            path="/jobseeker/profile"
            element={<JobSeekerProfile />}
          />

          <Route
            path="/ai/profile-analysis"
            element={<AIProfileAnalysisPage />}
          />

          <Route
            path="/ai/job-match"
            element={<AIJobMatchingPage />}
          />

          <Route
            path="/ai/career-assistant"
            element={<AICareerAssistantPage />}
          />

          {/* Backward-compatible route aliases */}

          <Route
            path="/dashboard"
            element={<Navigate to="/jobseeker/dashboard" replace />}
          />

          <Route
            path="/saved"
            element={<Navigate to="/jobseeker/saved-jobs" replace />}
          />

          <Route
            path="/applied"
            element={<Navigate to="/jobseeker/applications" replace />}
          />

          <Route
            path="/profile"
            element={<Navigate to="/jobseeker/profile" replace />}
          />
        </Route>
      </Route>

      {/* ================= RECRUITER ROUTES ================= */}

      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
        <Route element={<RecruiterLayout />}>
          <Route
            path="/recruiter/dashboard"
            element={<RecruiterDashboard />}
          />

          <Route
            path="/recruiter/create-job"
            element={<CreateJob />}
          />

          <Route
            path="/recruiter/my-jobs"
            element={<RecruiterMyJobs />}
          />

          <Route
            path="/recruiter/applications"
            element={<RecruiterApplications />}
          />

          <Route
            path="/recruiter/analytics"
            element={<RecruiterAnalytics />}
          />

          <Route
            path="/recruiter/profile"
            element={<RecruiterProfile />}
          />

          <Route
            path="/recruiter/payment"
            element={<RecruiterBilling />}
          />
        </Route>
      </Route>

      {/* ================= FALLBACK ROUTE ================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}