import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  getResumes,
  analyzeResume,
  saveJob,
  unsaveJob,
  getProfile,
} from "../services/authService";
import {
  JobDescriptionModal,
  ApplyModal,
  SuccessBanner,
  scoreStyle,
} from "../components/JobModals";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOC_BADGE = {
  remote: { bg: "#dcfce7", color: "#15803d" },
  hybrid: { bg: "#dbeafe", color: "#1d4ed8" },
  onsite: { bg: "#ffedd5", color: "#c2410c" },
};

// ─── Main Jobs Page ───────────────────────────────────────────────────────────
export default function Jobs() {
  const navigate = useNavigate();

  const [resumes, setResumes]           = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");
  const [savingId, setSavingId]         = useState(null);
  const [toast, setToast]               = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [profile, setProfile]           = useState(null);

  // Apply flow state — step 1: description, step 2: form
  const [descJob, setDescJob]           = useState(null);  // open description modal
  const [applyJob, setApplyJob]         = useState(null);  // open apply form modal
  const [successJob, setSuccessJob]     = useState(null);  // show success banner
  const [appliedIds, setAppliedIds]     = useState(new Set());

  // ── load profile + resumes on mount ─────────────────────────────────────
  useEffect(() => {
    getProfile().then((r) => setProfile(r.data)).catch(() => {});
    getResumes()
      .then((res) => {
        const list = res.data;
        setResumes(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          runAnalysis(list[0].id);
        }
      })
      .catch(() => setError("Could not load your resumes."))
      .finally(() => setLoadingResumes(false));
  }, []); // eslint-disable-line

  // ── analyze ──────────────────────────────────────────────────────────────
  const runAnalysis = async (id) => {
    setAnalyzing(true);
    setResult(null);
    setError("");
    try {
      const res = await analyzeResume(id);
      setResult(res.data);
      const ids = new Set(
        (res.data.recommendations || [])
          .filter((j) => j.has_applied)
          .map((j) => j.id)
      );
      setAppliedIds(ids);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        "Analysis failed. Make sure your resume file is readable (PDF/DOCX)."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResumeChange = (id) => {
    setSelectedId(id);
    runAnalysis(id);
  };

  // ── save / unsave ─────────────────────────────────────────────────────────
  const handleSave = async (job) => {
    setSavingId(job.id);
    try {
      if (job.is_saved) {
        await unsaveJob(job.id);
        showToast("Removed from saved.");
      } else {
        await saveJob(job.id);
        showToast("Job saved! ⭐");
      }
      setResult((prev) => ({
        ...prev,
        recommendations: prev.recommendations.map((j) =>
          j.id === job.id ? { ...j, is_saved: !j.is_saved } : j
        ),
      }));
    } catch {
      showToast("Action failed. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  // ── apply flow handlers ───────────────────────────────────────────────────
  // Step 1: open description
  const handleApplyNowClick = (job) => {
    setDescJob(job);
    setApplyJob(null);
  };

  // Step 2: from description → open form
  const handleProceedToApply = () => {
    setApplyJob(descJob);
    setDescJob(null);
  };

  // Back from form → description
  const handleBackToDesc = () => {
    setDescJob(applyJob);
    setApplyJob(null);
  };

  // Successful submission
  const handleApplySuccess = (jobId) => {
    const job = result.recommendations.find((j) => j.id === jobId);
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
    setDescJob(null);
    setSuccessJob(job?.title || "the job");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", maxWidth: "1100px" }}>

          {/* Header */}
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            💼 Job Opportunities
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
            Jobs matched to your resume — click Apply Now to view details and apply.
          </p>

          {/* Toast */}
          {toast && (
            <div style={{
              position: "fixed", top: "5rem", right: "1.5rem",
              padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
              background: "#7c3aed", color: "#fff", fontWeight: 700,
              fontSize: "0.875rem", zIndex: 999,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}>
              {toast}
            </div>
          )}

          {/* No resume */}
          {!loadingResumes && resumes.length === 0 && (
            <div style={{
              textAlign: "center", padding: "4rem 2rem",
              background: "#fff", border: "2px dashed #e2e8f0",
              borderRadius: "1.25rem",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
              <h3 style={{ color: "#1e293b", fontWeight: 700, marginBottom: "0.5rem" }}>
                No Resume Found
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                Upload your resume first — we'll analyze it and show matching jobs.
              </p>
              <button
                onClick={() => navigate("/resume")}
                style={{
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  color: "#fff", border: "none", borderRadius: "0.75rem",
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                Upload Resume →
              </button>
            </div>
          )}

          {/* Resume selector */}
          {resumes.length > 1 && (
            <div style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: "0.875rem", padding: "1rem 1.25rem",
              marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", flexShrink: 0 }}>
                🗂 Resume:
              </span>
              <select
                value={selectedId || ""}
                onChange={(e) => handleResumeChange(Number(e.target.value))}
                style={{
                  flex: 1, padding: "0.5rem 0.875rem",
                  border: "1px solid #e2e8f0", borderRadius: "0.5rem",
                  fontSize: "0.875rem", color: "#1e293b",
                  background: "#f8fafc", cursor: "pointer", outline: "none",
                }}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || r.file_name} — {new Date(r.uploaded_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <button
                onClick={() => runAnalysis(selectedId)}
                disabled={analyzing}
                style={{
                  padding: "0.5rem 1rem", background: "#7c3aed",
                  color: "#fff", border: "none", borderRadius: "0.5rem",
                  fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  flexShrink: 0, opacity: analyzing ? 0.6 : 1,
                }}
              >
                {analyzing ? "Analyzing…" : "🔍 Re-analyze"}
              </button>
            </div>
          )}

          {/* Spinner */}
          {analyzing && (
            <div style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: "1.25rem", padding: "3.5rem",
              textAlign: "center",
            }}>
              <div style={{
                width: 52, height: 52, margin: "0 auto 1rem",
                border: "4px solid #ede9fe",
                borderTop: "4px solid #7c3aed",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }} />
              <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "1rem" }}>
                Analyzing your resume…
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                Matching skills against available job listings
              </p>
            </div>
          )}

          {/* Error */}
          {error && !analyzing && (
            <div style={{
              padding: "1rem 1.25rem", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: "0.875rem",
              color: "#b91c1c", fontWeight: 600, fontSize: "0.875rem",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {result && !analyzing && (
            <div>
              {/* Detected skills banner */}
              {result.keywords_found?.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
                  borderRadius: "1rem", padding: "1.25rem 1.5rem",
                  marginBottom: "1.5rem", color: "#fff",
                }}>
                  <p style={{ margin: "0 0 0.5rem", fontWeight: 700, fontSize: "0.8rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Skills detected in your resume
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {result.keywords_found.map((kw, i) => (
                      <span key={i} style={{
                        padding: "0.2rem 0.65rem", borderRadius: "9999px",
                        background: "rgba(255,255,255,0.22)",
                        fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Count row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9375rem", margin: 0 }}>
                  {result.recommendations.length > 0
                    ? `${result.recommendations.length} job${result.recommendations.length > 1 ? "s" : ""} matched to your resume`
                    : "No matching jobs found"}
                </p>
                <button
                  onClick={() => navigate("/resume")}
                  style={{
                    padding: "0.4rem 0.875rem", fontSize: "0.75rem",
                    fontWeight: 700, borderRadius: "0.5rem",
                    background: "#ede9fe", color: "#7c3aed",
                    border: "none", cursor: "pointer",
                  }}
                >
                  ✏️ Update Resume
                </button>
              </div>

              {/* No matches */}
              {result.recommendations.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "3.5rem 2rem",
                  border: "2px dashed #e2e8f0", borderRadius: "1.25rem",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
                  <h3 style={{ color: "#1e293b", fontWeight: 700, marginBottom: "0.5rem" }}>No strong matches yet</h3>
                  <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                    Your skills didn't match enough jobs at a confident level.
                    Try updating your resume with more specific technical skills.
                  </p>
                  <button
                    onClick={() => navigate("/resume")}
                    style={{
                      padding: "0.7rem 1.75rem",
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      color: "#fff", border: "none", borderRadius: "0.75rem",
                      fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Update Resume →
                  </button>
                </div>
              )}

              {/* Job cards */}
              {result.recommendations.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.125rem",
                }}>
                  {result.recommendations.map((job) => {
                    const loc        = LOC_BADGE[job.location_type] || LOC_BADGE.onsite;
                    const sc         = scoreStyle(job.match_score);
                    const hasApplied = appliedIds.has(job.id);

                    return (
                      <div
                        key={job.id}
                        style={{
                          background: "#fff", border: "1px solid #e2e8f0",
                          borderRadius: "1rem", padding: "1.25rem",
                          display: "flex", flexDirection: "column", gap: "0.75rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                        }}
                      >
                        {/* Title + star */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1, marginRight: "0.75rem" }}>
                            <h3 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: "1rem", lineHeight: 1.3 }}>
                              {job.title}
                            </h3>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.8125rem", fontWeight: 600, color: "#7c3aed" }}>
                              {job.company}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSave(job)}
                            disabled={savingId === job.id}
                            title={job.is_saved ? "Unsave" : "Save"}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              fontSize: "1.4rem", color: job.is_saved ? "#f59e0b" : "#cbd5e1",
                              flexShrink: 0,
                            }}
                          >
                            {job.is_saved ? "★" : "☆"}
                          </button>
                        </div>

                        {/* Score bar */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: sc.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {sc.label}
                            </span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: sc.color }}>
                              {job.match_score}%
                            </span>
                          </div>
                          <div style={{ background: "#f1f5f9", borderRadius: "9999px", height: 7, overflow: "hidden" }}>
                            <div style={{
                              width: `${job.match_score}%`, height: "100%",
                              background: job.match_score >= 70 ? "#22c55e" : job.match_score >= 45 ? "#eab308" : "#f87171",
                              borderRadius: "9999px", transition: "width 0.7s ease",
                            }} />
                          </div>
                        </div>

                        {/* Badges */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                          <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: loc.bg, color: loc.color }}>
                            {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1)}
                          </span>
                          {job.location && (
                            <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, background: "#f1f5f9", color: "#475569" }}>
                              📍 {job.location}
                            </span>
                          )}
                          {job.salary_range && (
                            <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, background: "#f0fdf4", color: "#15803d" }}>
                              💰 {job.salary_range}
                            </span>
                          )}
                        </div>

                        {/* Description preview (2 lines) */}
                        {job.description && (
                          <p style={{
                            fontSize: "0.8125rem", color: "#64748b", margin: 0,
                            lineHeight: 1.55, display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {job.description}
                          </p>
                        )}

                        {/* Matched skills */}
                        {job.matched_skills?.length > 0 && (
                          <div>
                            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#15803d", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              ✅ Your matching skills ({job.matched_skills.length})
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                              {job.matched_skills.map((s, i) => (
                                <span key={i} style={{ padding: "0.2rem 0.55rem", background: "#dcfce7", color: "#15803d", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, border: "1px solid #bbf7d0" }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing skills */}
                        {job.missing_skills?.length > 0 && (
                          <div>
                            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              📚 Skills to develop ({job.missing_skills.length})
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                              {job.missing_skills.slice(0, 5).map((s, i) => (
                                <span key={i} style={{ padding: "0.2rem 0.55rem", background: "#f1f5f9", color: "#94a3b8", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, border: "1px solid #e2e8f0" }}>
                                  {s}
                                </span>
                              ))}
                              {job.missing_skills.length > 5 && (
                                <span style={{ padding: "0.2rem 0.55rem", background: "#f1f5f9", color: "#94a3b8", borderRadius: "9999px", fontSize: "0.7rem" }}>
                                  +{job.missing_skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Apply button */}
                        {hasApplied ? (
                          <div style={{
                            textAlign: "center", padding: "0.7rem",
                            background: "#f0fdf4", color: "#15803d",
                            borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.875rem",
                            border: "1px solid #bbf7d0", marginTop: "auto",
                          }}>
                            ✅ Applied Successfully
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyNowClick(job)}
                            style={{
                              display: "block", width: "100%",
                              padding: "0.7rem",
                              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                              color: "#fff", border: "none", borderRadius: "0.75rem",
                              fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                              marginTop: "auto", transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            Apply Now →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </div>

      {/* Step 1 — Job Description Modal */}
      {descJob && (
        <JobDescriptionModal
          job={descJob}
          onClose={() => setDescJob(null)}
          onProceed={handleProceedToApply}
        />
      )}

      {/* Step 2 — Apply Form Modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          prefill={{ full_name: profile?.full_name || profile?.username || "", email: profile?.email || "" }}
          resumes={resumes}
          onClose={() => setApplyJob(null)}
          onBack={handleBackToDesc}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* Success Modal */}
      {successJob && (
        <SuccessBanner
          jobTitle={successJob}
          onClose={() => setSuccessJob(null)}
        />
      )}
    </div>
  );
}
