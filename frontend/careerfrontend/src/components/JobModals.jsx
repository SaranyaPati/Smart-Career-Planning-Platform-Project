import React, { useState } from "react";
import { applyToJob } from "../services/authService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOC_BADGE = {
  remote: { bg: "#dcfce7", color: "#15803d" },
  hybrid: { bg: "#dbeafe", color: "#1d4ed8" },
  onsite: { bg: "#ffedd5", color: "#c2410c" },
};

export const scoreStyle = (s) =>
  s >= 70
    ? { bg: "#dcfce7", color: "#15803d", label: "Excellent Match" }
    : s >= 45
    ? { bg: "#fef9c3", color: "#854d0e", label: "Good Match" }
    : { bg: "#fee2e2", color: "#b91c1c", label: "Partial Match" };

// ─── Job Description Modal (Step 1) ──────────────────────────────────────────
export function JobDescriptionModal({ job, onClose, onProceed }) {
  const sc = scoreStyle(job.match_score);

  const skillBadge = (text, bg, color, border) => ({
    padding: "0.25rem 0.65rem", borderRadius: "9999px",
    fontSize: "0.75rem", fontWeight: 600,
    background: bg, color, border: `1px solid ${border}`,
    display: "inline-block",
  });

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "1.25rem",
        width: "100%", maxWidth: "640px",
        boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
        maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* ── Header gradient banner ── */}
        <div style={{
          background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
          borderRadius: "1.25rem 1.25rem 0 0",
          padding: "1.75rem 2rem",
          color: "#fff",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(255,255,255,0.18)", border: "none",
              borderRadius: "50%", width: 32, height: 32,
              color: "#fff", fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>

          <div style={{ fontSize: "0.7rem", fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            Job Details
          </div>
          <h2 style={{ margin: "0 0 0.25rem", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.25 }}>
            {job.title}
          </h2>
          <p style={{ margin: 0, fontSize: "1rem", opacity: 0.88, fontWeight: 600 }}>
            🏢 {job.company}
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            <span style={{
              padding: "0.25rem 0.75rem", borderRadius: "9999px",
              background: "rgba(255,255,255,0.22)",
              fontSize: "0.75rem", fontWeight: 700,
            }}>
              {job.location_type?.charAt(0).toUpperCase() + job.location_type?.slice(1)}
            </span>
            {job.location && (
              <span style={{
                padding: "0.25rem 0.75rem", borderRadius: "9999px",
                background: "rgba(255,255,255,0.18)",
                fontSize: "0.75rem", fontWeight: 600,
              }}>
                📍 {job.location}
              </span>
            )}
            {job.salary_range && (
              <span style={{
                padding: "0.25rem 0.75rem", borderRadius: "9999px",
                background: "rgba(255,255,255,0.18)",
                fontSize: "0.75rem", fontWeight: 600,
              }}>
                💰 {job.salary_range}
              </span>
            )}
            <span style={{
              padding: "0.25rem 0.75rem", borderRadius: "9999px",
              background: "rgba(255,255,255,0.22)",
              fontSize: "0.75rem", fontWeight: 700,
            }}>
              🎯 {job.match_score}% Match
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {job.description && (
            <section>
              <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.875rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📄 Job Description
              </h3>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {job.description}
              </p>
            </section>
          )}

          {job.requirements && (
            <section>
              <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.875rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📋 Requirements
              </h3>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {job.requirements}
              </p>
            </section>
          )}

          {job.skills_list?.length > 0 && (
            <section>
              <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.875rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🛠 Skills Required
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {job.skills_list.map((skill, i) => {
                  const isMatch = job.matched_skills?.includes(skill);
                  return (
                    <span key={i} style={skillBadge(
                      skill,
                      isMatch ? "#dcfce7" : "#f1f5f9",
                      isMatch ? "#15803d" : "#64748b",
                      isMatch ? "#bbf7d0" : "#e2e8f0"
                    )}>
                      {isMatch ? "✓ " : ""}{skill}
                    </span>
                  );
                })}
              </div>
              {job.matched_skills?.length > 0 && (
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>
                  ✅ You match {job.matched_skills.length} of {job.skills_list.length} required skills
                </p>
              )}
            </section>
          )}

          {job.missing_skills?.length > 0 && (
            <section style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "0.875rem", padding: "1rem",
            }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📚 Skills to Develop
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {job.missing_skills.map((s, i) => (
                  <span key={i} style={skillBadge(s, "#fff", "#b45309", "#fde68a")}>
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {job.posted_at && (
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
              🗓 Posted: {new Date(job.posted_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        {/* ── Footer Buttons ── */}
        <div style={{
          padding: "1.25rem 2rem", borderTop: "1px solid #f1f5f9",
          display: "flex", gap: "0.75rem",
          background: "#f8fafc", borderRadius: "0 0 1.25rem 1.25rem",
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "0.75rem",
              background: "#f1f5f9", color: "#475569",
              border: "none", borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
            }}
          >
            Close
          </button>

          <button
            onClick={onProceed}
            style={{
              flex: 2, padding: "0.75rem",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", border: "none", borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Proceed to Apply →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply Modal (Step 2) ─────────────────────────────────────────────────────
export function ApplyModal({ job, prefill, resumes, onClose, onBack, onSuccess }) {
  const [form, setForm] = useState({
    full_name:    prefill?.full_name || "",
    email:        prefill?.email     || "",
    phone:        "",
    cover_letter: "",
  });
  const [selectedResumeId, setSelectedResumeId] = useState(
    resumes?.length > 0 ? resumes[0].id : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      return setError("Full Name and Email are required.");
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        ...(selectedResumeId ? { resume_id: selectedResumeId } : {}),
      };
      await applyToJob(job.id, payload);
      onSuccess(job.id);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    width: "100%", padding: "0.6rem 0.875rem",
    border: "1px solid #e2e8f0", borderRadius: "0.625rem",
    fontSize: "0.875rem", color: "#0f172a",
    background: "#f8fafc", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "1.25rem",
        padding: "0", width: "100%", maxWidth: "540px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
          borderRadius: "1.25rem 1.25rem 0 0",
          padding: "1.5rem 2rem",
          color: "#fff",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(255,255,255,0.18)", border: "none",
              borderRadius: "50%", width: 32, height: 32,
              color: "#fff", fontSize: "1.1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", display: "inline-block" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, opacity: 0.8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Step 2 of 2 — Your Details
            </span>
          </div>

          <h2 style={{ margin: "0 0 0.2rem", fontWeight: 800, fontSize: "1.2rem" }}>
            📋 Apply for Position
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "0.875rem" }}>
            {job.title} — {job.company}
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: "1.75rem 2rem" }}>
          {error && (
            <div style={{
              marginBottom: "1rem", padding: "0.75rem 1rem",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "0.625rem", color: "#b91c1c",
              fontSize: "0.8125rem", fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="full_name" type="text" required
                value={form.full_name} onChange={handle}
                placeholder="e.g. Saranya Devi"
                style={inp}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handle}
                placeholder="e.g. saranya@example.com"
                style={inp}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                Phone Number <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                name="phone" type="tel"
                value={form.phone} onChange={handle}
                placeholder="e.g. +91 98765 43210"
                style={inp}
              />
            </div>

            {/* Resume selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                📄 Select Resume
              </label>
              {resumes && resumes.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.65rem 0.875rem",
                        border: `2px solid ${selectedResumeId === r.id ? "#7c3aed" : "#e2e8f0"}`,
                        borderRadius: "0.625rem",
                        background: selectedResumeId === r.id ? "#f5f3ff" : "#f8fafc",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="resume"
                        value={r.id}
                        checked={selectedResumeId === r.id}
                        onChange={() => setSelectedResumeId(r.id)}
                        style={{ accentColor: "#7c3aed", width: 16, height: 16 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.title || r.file_name}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8" }}>
                          Uploaded {new Date(r.uploaded_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      {selectedResumeId === r.id && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7c3aed" }}>✓ Selected</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "0.875rem 1rem",
                  border: "2px dashed #e2e8f0", borderRadius: "0.625rem",
                  background: "#f8fafc", textAlign: "center",
                }}>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8" }}>
                    No resumes uploaded yet.{" "}
                    <a href="/resume" style={{ color: "#7c3aed", fontWeight: 700 }}>
                      Upload one here →
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                Cover Letter <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                name="cover_letter"
                value={form.cover_letter} onChange={handle}
                rows={4}
                placeholder={`Tell ${job.company} why you're a great fit for this role…`}
                style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Matched skills reminder */}
            {job.matched_skills?.length > 0 && (
              <div style={{
                padding: "0.875rem", background: "#f0fdf4",
                border: "1px solid #bbf7d0", borderRadius: "0.75rem",
              }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", margin: "0 0 0.5rem" }}>
                  ✅ Your matching skills for this role:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {job.matched_skills.map((s, i) => (
                    <span key={i} style={{
                      padding: "0.15rem 0.5rem", borderRadius: "9999px",
                      background: "#dcfce7", color: "#15803d",
                      fontSize: "0.7rem", fontWeight: 600, border: "1px solid #bbf7d0",
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button
                type="button" onClick={onBack}
                style={{
                  flex: 1, padding: "0.75rem",
                  background: "#f1f5f9", color: "#475569",
                  border: "none", borderRadius: "0.75rem",
                  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                }}
              >
                ← Back
              </button>
              <button
                type="submit" disabled={submitting}
                style={{
                  flex: 2, padding: "0.75rem",
                  background: submitting ? "#a78bfa" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  color: "#fff", border: "none", borderRadius: "0.75rem",
                  fontWeight: 700, fontSize: "0.9rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                }}
              >
                {submitting ? "Submitting…" : "Submit Application →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Success Banner ───────────────────────────────────────────────────────────
export function SuccessBanner({ jobTitle, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: "1.25rem",
        padding: "2.5rem 2rem", maxWidth: "420px", width: "100%",
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ margin: "0 0 0.5rem", fontWeight: 800, color: "#1e293b", fontSize: "1.3rem" }}>
          Application Submitted!
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
          Your application for <strong>{jobTitle}</strong> has been successfully submitted.
          The recruiter will review it and get back to you.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            color: "#fff", border: "none", borderRadius: "0.75rem",
            fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
          }}
        >
          Great, thanks!
        </button>
      </div>
    </div>
  );
}
