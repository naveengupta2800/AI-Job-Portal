import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./components/auth/Login";
import RegisterVerify from "./components/auth/Register";

/* ================= JOB SEEKER ================= */
import Navbar from "./components/jobseeker/Navbar.jsx";
import JobListingPage from "./components/jobseeker/JobListingPage.jsx";
import JobDetailsPage from "./components/jobseeker/JobDetailsPage.jsx";
import SavedJobsContainer from "./components/jobseeker/SavedJobsContainer.jsx";
import ProfilePage from "./components/jobseeker/ProfilePage.jsx";
import JobApply from "./components/jobseeker/JobApply.jsx";

/* ================= RECRUITER ================= */
import RecruiterSidebar from "./components/recruiter/RecruiterSidebar.jsx";
import Dashboard from "./components/recruiter/Dashboard.jsx";
import PaymentPlans from "./components/recruiter/PaymentPlans.jsx";
import CreateJobForm from "./components/recruiter/CreateJobForm.jsx";
import MyJobListings from "./components/recruiter/MyJobListings.jsx";
import ApplicationsView from "./components/recruiter/ApplicationsView.jsx";
import Profile from "./components/recruiter/Profile.jsx";

/* ================= UTILS ================= */
import api from "./components/utils/api";

/* ================= JOB SEEKER LAYOUT ================= */
const JobseekerLayout = ({
  children,
  savedCount,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar
        savedCount={savedCount}
        onLogout={onLogout}
      />

      <main className="pt-[95px]">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  const [savedJobIds, setSavedJobIds] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ================= LOGOUT ================= */
const handleLogout = async () => {
  try {
    const res = await fetch(
      "http://localhost:8000/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();

    console.log("Logout:", data);

    // Clear frontend state
    setUserRole(null);
    setSavedJobIds([]);
    setAppliedJobIds([]);

  } catch (err) {
    console.error("Logout error:", err);

    // Even if request fails,
    // clear frontend session state
    setUserRole(null);
    setSavedJobIds([]);
    setAppliedJobIds([]);
  }
};

  /* ================= GET ROLE ================= */
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await api.get("/api/auth/get-role", {
          withCredentials: true,
        });

        if (res.data?.role) {
          setUserRole(res.data.role);
        }
      } catch (err) {
        console.log(err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm font-medium text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/* ==================================================
            AUTH
        ================================================== */}
        {!userRole && (
          <>
            <Route
  path="/login"
  element={
    <Login setUserRole={setUserRole} />
  }
/>

            <Route
              path="/register"
              element={<RegisterVerify />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />
          </>
        )}

        {/* ==================================================
            JOB SEEKER
        ================================================== */}
        {userRole === "jobseeker" && (
          <>
            <Route
              path="/"
              element={
                <JobseekerLayout
  savedCount={savedJobIds.length}
  onLogout={handleLogout}
>
                  <JobListingPage
                    jobs={jobs}
                    savedJobIds={savedJobIds}
                    onToggleSave={(id) =>
                      setSavedJobIds((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => x !== id)
                          : [...prev, id]
                      )
                    }
                    onApply={(id) =>
                      setAppliedJobIds((prev) =>
                        prev.includes(id)
                          ? prev
                          : [...prev, id]
                      )
                    }
                  />
                </JobseekerLayout>
              }
            />

            <Route
              path="/job/:id"
              element={
                <JobseekerLayout
  savedCount={savedJobIds.length}
  onLogout={handleLogout}
>
                  <JobDetailsPage
                    savedJobIds={savedJobIds}
                    onToggleSave={(id) =>
                      setSavedJobIds((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => x !== id)
                          : [...prev, id]
                      )
                    }
                    onApply={(id) =>
                      setAppliedJobIds((prev) =>
                        prev.includes(id)
                          ? prev
                          : [...prev, id]
                      )
                    }
                  />
                </JobseekerLayout>
              }
            />

            <Route
              path="/saved"
              element={
                <JobseekerLayout
  savedCount={savedJobIds.length}
  onLogout={handleLogout}
>
                  <SavedJobsContainer
                    onApply={(id) =>
                      setAppliedJobIds((prev) =>
                        prev.includes(id)
                          ? prev
                          : [...prev, id]
                      )
                    }
                  />
                </JobseekerLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <JobseekerLayout
  savedCount={savedJobIds.length}
  onLogout={handleLogout}
>
                  <ProfilePage
                    savedJobs={jobs.filter((j) =>
                      savedJobIds.includes(j._id)
                    )}
                    appliedJobs={jobs.filter((j) =>
                      appliedJobIds.includes(j._id)
                    )}
                  />
                </JobseekerLayout>
              }
            />

            <Route
              path="/applied"
              element={
                <JobseekerLayout
  savedCount={savedJobIds.length}
  onLogout={handleLogout}
>
                  <JobApply
                    jobs={jobs}
                    appliedJobIds={appliedJobIds}
                  />
                </JobseekerLayout>
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </>
        )}

        {/* ==================================================
            RECRUITER
        ================================================== */}
    
{userRole === "recruiter" && (
  <Route
    path="/*"
    element={
      <div className="rounded-2xl grid min-h-screen grid-cols-[280px_minmax(0,1fr)] bg-[#f5f5f5]">

        {/* ================= SIDEBAR ================= */}
        <div className="relative">
          <div className="sticky top-0 h-screen p-4">
            <RecruiterSidebar onLogout={handleLogout} />
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <main className="min-w-0 overflow-x-hidden">
          <Routes>

            {/* Dashboard */}
            <Route
              path="/"
              element={
                <Dashboard
                  jobs={jobs}
                  applicants={applicants}
                />
              }
            />
            
 <Route
  path="payment"
  element={
    <PaymentPlans
      onSuccess={(payment) => {
        console.log("Payment successful:", payment);
      }}
    />
  }
/>
            {/* Create Job */}
            <Route
              path="create-job"
              element={<CreateJobForm />}
            />

            {/* My Jobs */}
            <Route
              path="my-jobs"
              element={
                <MyJobListings
                  jobs={jobs}
                />
              }
            />

            {/* Applications */}
            <Route
              path="applications"
              element={
                <ApplicationsView
                  applicants={applicants}
                />
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={<Profile />}
            />

            {/* Unknown */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </main>

      </div>
    }
  />
)}
      </Routes>
    </Router>
  );
}

export default App;