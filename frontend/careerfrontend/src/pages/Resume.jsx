import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  getResumes,
  uploadResume,
  deleteResume,
  analyzeResume,
  getProfile,
} from "../services/authService";
import {
  JobDescriptionModal,
  ApplyModal,
  SuccessBanner,
} from "../components/JobModals";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOCATION_BADGE = {
  remote: { bg: "#dcfce7", color: "#15803d", label: "Remote" },
  hybrid: { bg: "#dbeafe", color: "#1d4ed8", label: "Hybrid" },
  onsite: { bg: "#ffedd5", color: "#c2410c", label: "On-site" },
};

const scoreColor = (s) => {
  if (s >= 70) return { bg: "#dcfce7", color: "#15803d", label: "Excellent" };
  if (s >= 45) return { bg: "#fef9c3", color: "#854d0e", label: "Good" };
  return { bg: "#fee2e2", color: "#b91c1c", label: "Partial" };
};

const statusColor = (s) => {
  if (s === "uploaded") return { bg: "#ede9fe", color: "#7c3aed" };
  if (s === "reviewed") return { bg: "#dcfce7", color: "#15803d" };
  return { bg: "#fef3c7", color: "#b45309" };
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ─── Component ────────────────────────────────────────────────────────────────
function Resume() {
  const [resumes, setResumes]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [message, setMessage]           = useState({ type: "", text: "" });
  const [title, setTitle]               = useState("");
  const [selectedFile, setSelectedFile] = useState(null);   // file preview state
  const [dragOver, setDragOver]         = useState(false);
  const fileInputRef = useRef();

  // Analysis state
  const [analyzing, setAnalyzing]       = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [profile, setProfile]           = useState(null);

  // Apply flow state — step 1: description modal, step 2: apply form
  const [descJob, setDescJob]           = useState(null);
  const [applyJob, setApplyJob]         = useState(null);
  const [successJob, setSuccessJob]     = useState(null);
  const [appliedIds, setAppliedIds]     = useState(new Set());

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchResumes = async () => {
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch (e) {
      console.warn("Could not load resumes", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    getProfile().then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  // ── File selection helpers ──────────────────────────────────────────────────
  const onFileChange = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setMessage({ type: "error", text: "Only PDF, DOC or DOCX files are accepted." });
      return;
    }
    setSelectedFile(file);
    setMessage({ type: "", text: "" });
  };

  const handleFileInputChange = (e) => {
    onFileChange(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onFileChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  // Reset the entire upload form
  const resetUpload = () => {
    setSelectedFile(null);
    setTitle("");
    setMessage({ type: "", text: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Apply flow handlers ──────────────────────────────────────────────────────
  // Step 1: open description modal
  const handleApplyNowClick = (job) => {
    setDescJob(job);
    setApplyJob(null);
  };

  // Step 2: from description → open apply form
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
    const job = analysisResult?.recommendations?.find((j) => j.id === jobId);
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
    setDescJob(null);
    setSuccessJob(job?.title || "the job");
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return setMessage({ type: "error", text: "Please select or drop a file first." });
    }

    setUploading(true);
    setMessage({ type: "", text: "" });
    setAnalysisResult(null);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      if (title.trim()) fd.append("title", title.trim());

      const uploadRes = await uploadResume(fd);
      const newId = uploadRes.data?.id;

      // Reset form immediately after success
      resetUpload();
      setMessage({ type: "success", text: "✅ Resume uploaded successfully! Analyzing now…" });

      // Refresh resume list
      const freshResumes = await getResumes();
      setResumes(freshResumes.data);

      // Auto-analyze
      if (newId) {
        await runAnalysis(newId);
      }
    } catch (err) {
      // Show the REAL error from the server
      const serverError =
        err?.response?.data?.file?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        `Upload failed (HTTP ${err?.response?.status || "unknown"}).`;

      setMessage({ type: "error", text: serverError });
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setMessage({ type: "success", text: "Resume deleted." });
      if (activeResumeId === id) {
        setAnalysisResult(null);
        setActiveResumeId(null);
      }
      fetchResumes();
    } catch {
      setMessage({ type: "error", text: "Delete failed." });
    }
  };

  // ── Analyze ─────────────────────────────────────────────────────────────────
  const runAnalysis = async (id) => {
    setAnalyzing(true);
    setAnalyzeError("");
    setActiveResumeId(id);
    try {
      const res = await analyzeResume(id);
      setAnalysisResult(res.data);
    } catch (err) {
      setAnalyzeError(
        err?.response?.data?.error ||
        "Analysis failed. Make sure jobs are available in the system."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", maxWidth: "1100px" }}>

          {/* ── Page Header ── */}
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            📄 Resume Manager
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem", marginBottom: "2rem" }}>
            Upload your resume (PDF or DOCX) to get AI-powered job recommendations.
          </p>

          {/* ── Upload Card ── */}
          <div style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: "2rem",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 1.25rem" }}>
              ⬆ Upload New Resume
            </h3>

            {/* ── Status message ── */}
            {message.text && (
              <div style={{
                marginBottom: "1.25rem",
                padding: "0.875rem 1rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                color:      message.type === "success" ? "#15803d"  : "#b91c1c",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                display: "flex", alignItems: "flex-start", gap: "0.5rem",
              }}>
                <span style={{ flexShrink: 0 }}>
                  {message.type === "success" ? "✅" : "❌"}
                </span>
                <span style={{ lineHeight: 1.5 }}>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* ── Drag-and-drop zone ── */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#7c3aed" : selectedFile ? "#22c55e" : "#c4b5fd"}`,
                  borderRadius: "1rem",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                  background: dragOver ? "#f5f3ff" : selectedFile ? "#f0fdf4" : "#faf5ff",
                  cursor: selectedFile ? "default" : "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: "none" }}
                />

                {selectedFile ? (
                  /* File selected — show preview */
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "0.75rem",
                      background: "#dcfce7", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.75rem", flexShrink: 0,
                    }}>
                      {selectedFile.name.endsWith(".pdf") ? "📕" : "📘"}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.9375rem" }}>
                        {selectedFile.name}
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                        {formatBytes(selectedFile.size)} · {selectedFile.name.split(".").pop().toUpperCase()}
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                        ✓ Ready to upload
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                      style={{
                        marginLeft: "auto",
                        background: "#fef2f2", color: "#b91c1c",
                        border: "none", borderRadius: "0.5rem",
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  /* No file yet */
                  <div>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                      {dragOver ? "📂" : "☁️"}
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#4c1d95", fontSize: "0.9375rem" }}>
                      {dragOver ? "Drop your resume here" : "Drag & drop your resume here"}
                    </p>
                    <p style={{ margin: "0.35rem 0 0.875rem", fontSize: "0.8125rem", color: "#94a3b8" }}>
                      or click to browse — PDF, DOC, DOCX
                    </p>
                    <span style={{
                      display: "inline-block",
                      padding: "0.45rem 1.25rem",
                      background: "#7c3aed", color: "#fff",
                      borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700,
                      cursor: "pointer",
                    }}>
                      Choose File
                    </span>
                  </div>
                )}
              </div>

              {/* ── Title field ── */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                  Resume Title
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.35rem" }}>(optional — auto-filled from filename if blank)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedFile ? selectedFile.name : "e.g. Software Engineer Resume 2025"}
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #e2e8f0", borderRadius: "0.75rem",
                    fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
                    color: "#0f172a", background: "#f8fafc",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              {/* ── Submit button ── */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  style={{
                    padding: "0.75rem 2rem",
                    background: uploading || !selectedFile
                      ? "#a78bfa"
                      : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff", border: "none", borderRadius: "0.75rem",
                    fontWeight: 700, fontSize: "0.9rem",
                    cursor: uploading || !selectedFile ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}
                >
                  {uploading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #fff", borderRadius: "50%",
                        display: "inline-block", animation: "spin 0.8s linear infinite",
                      }} />
                      Uploading & Analyzing…
                    </>
                  ) : "⬆ Upload & Analyze Resume"}
                </button>

                {selectedFile && !uploading && (
                  <button
                    type="button"
                    onClick={resetUpload}
                    style={{
                      padding: "0.75rem 1.25rem",
                      background: "#f1f5f9", color: "#475569",
                      border: "none", borderRadius: "0.75rem",
                      fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Resume List ── */}
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
            📂 Your Resumes
          </h3>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading…</p>
          ) : resumes.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "3rem",
              border: "2px dashed #e2e8f0", borderRadius: "1rem",
            }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📂</p>
              <p style={{ color: "#94a3b8", fontWeight: 500 }}>No resumes uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {resumes.map((r) => {
                const sc = statusColor(r.status);
                const isActive = activeResumeId === r.id;
                return (
                  <div
                    key={r.id}
                    style={{
                      background: "#fff",
                      border: isActive ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                      borderRadius: "1rem",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: isActive ? "0 0 0 3px #ede9fe" : "0 1px 3px rgba(0,0,0,0.05)",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    {/* Left */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "0.625rem",
                        background: "#ede9fe", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "1.5rem", flexShrink: 0,
                      }}>📄</div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1e293b", margin: 0, fontSize: "0.9375rem" }}>
                          {r.title || r.file_name}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.15rem 0 0" }}>
                          {r.file_name} · {new Date(r.uploaded_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                      <span style={{
                        padding: "0.25rem 0.75rem", borderRadius: "9999px",
                        fontSize: "0.75rem", fontWeight: 600,
                        background: sc.bg, color: sc.color,
                      }}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>

                      {/* Analyze button */}
                      <button
                        onClick={() => runAnalysis(r.id)}
                        disabled={analyzing && activeResumeId === r.id}
                        style={{
                          padding: "0.35rem 0.875rem",
                          fontSize: "0.75rem", fontWeight: 700,
                          borderRadius: "0.5rem", border: "none", cursor: "pointer",
                          background: isActive ? "#7c3aed" : "#ede9fe",
                          color: isActive ? "#fff" : "#7c3aed",
                          transition: "all 0.2s",
                        }}
                      >
                        {analyzing && activeResumeId === r.id ? "⏳ Analyzing…" : "🔍 Analyze"}
                      </button>

                      {r.file_url && (
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "0.35rem 0.875rem",
                            fontSize: "0.75rem", fontWeight: 600,
                            borderRadius: "0.5rem", background: "#f1f5f9",
                            color: "#475569", textDecoration: "none",
                          }}
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{
                          padding: "0.35rem 0.875rem",
                          fontSize: "0.75rem", fontWeight: 600,
                          borderRadius: "0.5rem", border: "none", cursor: "pointer",
                          background: "#fef2f2", color: "#b91c1c",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Analysis Panel ── */}
          {analyzing && !analysisResult && (
            <div style={{
              padding: "2.5rem", textAlign: "center",
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1rem",
            }}>
              <div style={{
                width: 52, height: 52, margin: "0 auto 1rem",
                border: "4px solid #ede9fe", borderTop: "4px solid #7c3aed",
                borderRadius: "50%", animation: "spin 0.9s linear infinite",
              }} />
              <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
                Analyzing your resume and matching jobs…
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.8125rem", marginTop: "0.35rem" }}>
                This may take a few seconds
              </p>
            </div>
          )}

          {analyzeError && !analyzing && (
            <div style={{
              padding: "1rem 1.25rem", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: "0.75rem",
              color: "#b91c1c", fontWeight: 600, fontSize: "0.875rem",
            }}>
              ⚠️ {analyzeError}
            </div>
          )}

          {analysisResult && !analyzing && (
            <div>
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                borderRadius: "1rem", padding: "1.5rem",
                marginBottom: "1.5rem", color: "#fff",
              }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 800 }}>
                  🎯 Recommended Jobs for You
                </h3>
                <p style={{ margin: 0, opacity: 0.85, fontSize: "0.875rem" }}>
                  {analysisResult.recommendations.length} matching positions found based on your resume
                </p>

                {/* Keywords */}
                {analysisResult.keywords_found?.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.75, margin: "0 0 0.5rem" }}>
                      SKILLS DETECTED IN YOUR RESUME
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {analysisResult.keywords_found.slice(0, 20).map((kw, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "0.2rem 0.6rem",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "9999px",
                            fontSize: "0.7rem", fontWeight: 600,
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* No recommendations */}
              {analysisResult.recommendations.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "3rem",
                  border: "2px dashed #e2e8f0", borderRadius: "1rem",
                }}>
                  <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</p>
                  <p style={{ color: "#64748b", fontWeight: 500 }}>
                    No strong matches found. Try uploading a more detailed resume or ask your admin to add more jobs.
                  </p>
                </div>
              ) : (
                /* Job Cards Grid */
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1rem",
                }}>
                  {analysisResult.recommendations.map((job) => {
                    const locBadge = LOCATION_BADGE[job.location_type] || LOCATION_BADGE.onsite;
                    const sc = scoreColor(job.match_score);
                    return (
                      <div
                        key={job.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "1rem",
                          padding: "1.25rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                        }}
                      >
                        {/* Top row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1, marginRight: "0.75rem" }}>
                            <h4 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: "1rem", lineHeight: 1.3 }}>
                              {job.title}
                            </h4>
                            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", fontWeight: 600, color: "#7c3aed" }}>
                              {job.company}
                            </p>
                          </div>
                          <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            padding: "0.35rem 0.6rem",
                            background: sc.bg, borderRadius: "0.625rem", flexShrink: 0,
                          }}>
                            <span style={{ fontSize: "1rem", fontWeight: 800, color: sc.color, lineHeight: 1 }}>
                              {job.match_score}%
                            </span>
                            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: sc.color, marginTop: "0.1rem" }}>
                              {sc.label}
                            </span>
                          </div>
                        </div>

                        {/* Match bar */}
                        <div style={{ background: "#f1f5f9", borderRadius: "9999px", height: 6, overflow: "hidden" }}>
                          <div style={{
                            width: `${job.match_score}%`, height: "100%",
                            background: job.match_score >= 70 ? "#22c55e" : job.match_score >= 45 ? "#eab308" : "#f87171",
                            borderRadius: "9999px", transition: "width 0.6s ease",
                          }} />
                        </div>

                        {/* Badges */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                          <span style={{
                            padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700,
                            background: locBadge.bg, color: locBadge.color,
                          }}>
                            {locBadge.label}
                          </span>
                          {job.location && (
                            <span style={{
                              padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600,
                              background: "#f1f5f9", color: "#475569",
                            }}>
                              📍 {job.location}
                            </span>
                          )}
                          {job.salary_range && (
                            <span style={{
                              padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600,
                              background: "#f0fdf4", color: "#15803d",
                            }}>
                              💰 {job.salary_range}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {job.description && (
                          <p style={{
                            fontSize: "0.8125rem", color: "#64748b",
                            margin: 0, lineHeight: 1.55,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {job.description}
                          </p>
                        )}

                        {/* Skills */}
                        {(job.matched_skills?.length > 0 || job.missing_skills?.length > 0) && (
                          <div>
                            {job.matched_skills?.length > 0 && (
                              <div>
                                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#15803d", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                  ✅ Matched skills ({job.matched_skills.length})
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.5rem" }}>
                                  {job.matched_skills.map((s, i) => (
                                    <span key={i} style={{
                                      padding: "0.2rem 0.55rem",
                                      background: "#dcfce7", color: "#15803d",
                                      borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600,
                                      border: "1px solid #bbf7d0",
                                    }}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {job.missing_skills?.length > 0 && (
                              <div>
                                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                  ⬜ Skills to develop ({job.missing_skills.length})
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                                  {job.missing_skills.slice(0, 5).map((s, i) => (
                                    <span key={i} style={{
                                      padding: "0.2rem 0.55rem",
                                      background: "#f1f5f9", color: "#94a3b8",
                                      borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600,
                                      border: "1px solid #e2e8f0",
                                    }}>
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
                          </div>
                        )}

                        {/* Apply button */}
                        {appliedIds.has(job.id) ? (
                          <div style={{
                            textAlign: "center", padding: "0.65rem",
                            background: "#f0fdf4", color: "#15803d",
                            borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem",
                            border: "1px solid #bbf7d0", marginTop: "auto",
                          }}>
                            ✅ Applied Successfully
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyNowClick(job)}
                            style={{
                              display: "block", width: "100%",
                              padding: "0.65rem",
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                              color: "#fff", borderRadius: "0.625rem",
                              fontWeight: 700, fontSize: "0.875rem",
                              border: "none", cursor: "pointer",
                              transition: "opacity 0.2s", marginTop: "auto",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            View Details & Apply →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </main>
      </div>

      {/* ── Step 1: Job Description Modal ── */}
      {descJob && (
        <JobDescriptionModal
          job={descJob}
          onClose={() => setDescJob(null)}
          onProceed={handleProceedToApply}
        />
      )}

      {/* ── Step 2: Apply Form Modal ── */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          prefill={profile}
          resumes={resumes}
          onClose={() => { setApplyJob(null); setDescJob(null); }}
          onBack={handleBackToDesc}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* ── Success Banner ── */}
      {successJob && (
        <SuccessBanner
          jobTitle={successJob}
          onClose={() => setSuccessJob(null)}
        />
      )}
    </div>
  );
}

export default Resume;
