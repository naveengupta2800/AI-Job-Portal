import React, { useEffect, useState } from "react";
import SavedJobsPage from "./SavedJobsPage";

export default function SavedJobsContainer({ onApply }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/save/saved", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSavedJobs(data.savedJobs); // update state
      } else {
        alert(data.message || "Failed to fetch saved jobs");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while fetching saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      const isAlreadySaved = savedJobs.some(j => j._id === jobId);
     const url = `http://localhost:8000/api/save/${isAlreadySaved ? "unsave" : "save"}/${jobId}`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to update saved job");

      fetchSavedJobs(); // refresh saved jobs after toggle
    } catch (err) {
      console.error(err);
      alert("Server error while updating saved job");
    }
  };

  if (loading) return <p>Loading saved jobs...</p>;

  return (
    <SavedJobsPage
      jobs={savedJobs}
      onToggleSave={handleToggleSave}
      onApply={onApply}
    />
  );
}
