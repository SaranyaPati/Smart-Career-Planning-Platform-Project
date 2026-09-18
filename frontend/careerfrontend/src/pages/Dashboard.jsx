import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getProfile, getResumeStatus } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [resumeStatus, setResumeStatus] = useState({ has_resume: false, status: "none", count: 0 });

  const [profileScore, setProfileScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, resumeRes] = await Promise.all([
          getProfile(),
          getResumeStatus(),
        ]);
        const p = profileRes.data;
        setUsername(p.fullName || "User");

        // Calculate profile score based on filled fields
        const fields = [p.fullName, p.email, p.bio, p.skills, p.targetRole];
        const filled = fields.filter((f) => f && f.trim()).length;
        setProfileScore(Math.round((filled / fields.length) * 100));

        setResumeStatus(resumeRes.data);
      } catch (err) {
        console.warn("Dashboard: using fallback data.", err.message);
        setUsername("User");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resumeLabel = resumeStatus.has_resume
    ? resumeStatus.status.charAt(0).toUpperCase() + resumeStatus.status.slice(1)
    : "Not Uploaded";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 text-left">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg mb-8">
            <h2 className="text-3xl font-extrabold mb-2">
              Welcome Back, {loading ? "..." : username} 👋
            </h2>
            <p className="text-purple-100 font-medium">
              Track your career growth and profile progress.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                📄 Resume Status
              </h4>
              <p className={`text-3xl font-extrabold ${resumeStatus.has_resume ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                {loading ? "..." : resumeLabel}
              </p>
              {resumeStatus.count > 1 && (
                <p className="text-xs text-slate-500 mt-1">{resumeStatus.count} files uploaded</p>
              )}
            </div>



            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                📈 Profile Score
              </h4>
              <p className={`text-3xl font-extrabold ${profileScore >= 80 ? "text-green-600 dark:text-green-400" : profileScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                {loading ? "..." : `${profileScore}%`}
              </p>
              <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 font-semibold text-sm rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 transition"
            >
              Update Profile
            </button>
            <button
              onClick={() => navigate("/resume")}
              className="px-6 py-3 font-semibold text-sm rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Upload Resume
            </button>
            <button
              onClick={() => navigate("/jobs")}
              className="px-6 py-3 font-semibold text-sm rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              View Opportunities
            </button>
            <button
              onClick={() => navigate("/careers")}
              className="px-6 py-3 font-semibold text-sm rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Career Paths
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;