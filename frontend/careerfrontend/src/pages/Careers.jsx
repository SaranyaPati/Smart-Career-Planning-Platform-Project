import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getCareerPlan } from "../services/authService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 70 ? "#22c55e" : s >= 40 ? "#eab308" : "#f87171";


// ─── Main Component ───────────────────────────────────────────────────────────
export default function Careers() {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState("plan");   // plan | paths | goals

  // ── Career Plan state ──────────────────────────────────────────────────────
  const [plan, setPlan]               = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError]     = useState("");
  const [msg, setMsg]                 = useState({ type: "", text: "" });

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setPlanLoading(true);
    setPlanError("");
    try {
      const r = await getCareerPlan();
      setPlan(r.data);
    } catch {
      setPlanError("Could not load career plan. Make sure you are logged in.");
    } finally {
      setPlanLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "plan",  label: "🗺️ My Career Plan" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", maxWidth: "1100px" }}>

          {/* Header */}
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            🎯 Career Planning
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
            Your personalised career plan, growth paths, and goals — all in one place.
          </p>

          {/* Global message */}
          {msg.text && (
            <div style={{
              marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
              background: msg.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
              color: msg.type === "success" ? "#15803d" : "#b91c1c",
              fontSize: "0.875rem", fontWeight: 600,
            }}>
              {msg.text}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "2px solid #e2e8f0" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "0.65rem 1.25rem",
                  fontSize: "0.875rem", fontWeight: 700,
                  border: "none", borderRadius: "0.625rem 0.625rem 0 0",
                  cursor: "pointer",
                  background: activeTab === t.id ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent",
                  color: activeTab === t.id ? "#fff" : "#64748b",
                  transition: "all 0.2s",
                  marginBottom: "-2px",
                  borderBottom: activeTab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ══ CAREER PLAN TAB ══ */}
          {activeTab === "plan" && (
            <div>
              {planLoading && (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{
                    width: 48, height: 48, margin: "0 auto 1rem",
                    border: "4px solid #ede9fe", borderTop: "4px solid #7c3aed",
                    borderRadius: "50%", animation: "spin 0.9s linear infinite",
                  }} />
                  <p style={{ color: "#7c3aed", fontWeight: 700 }}>Generating your career plan…</p>
                </div>
              )}

              {planError && !planLoading && (
                <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.875rem", color: "#b91c1c", fontWeight: 600 }}>
                  ⚠️ {planError}
                </div>
              )}

              {plan && !planLoading && !plan.has_resume && (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", border: "2px dashed #e2e8f0", borderRadius: "1.25rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
                  <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>No Resume Uploaded</h3>
                  <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                    Upload your resume first — we'll analyse it and generate a personalised career plan.
                  </p>
                  <button
                    onClick={() => navigate("/resume")}
                    style={{ padding: "0.75rem 2rem", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", border: "none", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    Upload Resume →
                  </button>
                </div>
              )}

              {plan?.has_resume && !planLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                  {/* ── Hero: Skill Score ── */}
                  <div style={{
                    background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
                    borderRadius: "1.25rem", padding: "1.75rem 2rem",
                    color: "#fff", display: "flex", alignItems: "center", gap: "2rem",
                    flexWrap: "wrap",
                  }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Career Readiness Score
                      </p>
                      <div style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1.1, marginTop: "0.3rem" }}>
                        {plan.skill_score}%
                      </div>
                      <p style={{ margin: "0.5rem 0 0", opacity: 0.85, fontSize: "0.875rem" }}>
                        Based on: <strong>{plan.resume_title}</strong>
                      </p>
                    </div>
                    {/* Score arc visual */}
                    <div style={{ flexShrink: 0 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#fff" strokeWidth="10"
                          strokeDasharray={`${(plan.skill_score / 100) * 314} 314`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                        <text x="60" y="65" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">{plan.skill_score}%</text>
                      </svg>
                    </div>
                    {/* Current skills */}
                    <div style={{ flex: 2, minWidth: "200px" }}>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Skills detected in your resume
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {plan.current_skills.length > 0
                          ? plan.current_skills.map((s, i) => (
                            <span key={i} style={{ padding: "0.2rem 0.65rem", borderRadius: "9999px", background: "rgba(255,255,255,0.25)", fontSize: "0.72rem", fontWeight: 600 }}>
                              {s}
                            </span>
                          ))
                          : <span style={{ opacity: 0.7, fontSize: "0.875rem" }}>No skills matched yet — make sure your resume has specific technologies listed.</span>
                        }
                      </div>
                    </div>
                  </div>

                  {/* ── Two-column: Top Paths + Skills to Learn ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

                    {/* Top matched career paths */}
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1.125rem", padding: "1.5rem" }}>
                      <h3 style={{ margin: "0 0 1.25rem", fontWeight: 800, color: "#1e293b", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        🏆 Your Best-Matched Career Paths
                      </h3>
                      {plan.top_paths.length === 0 ? (
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                          No career paths found. Ask your admin to add some via the admin panel.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {plan.top_paths.map((p, idx) => (
                            <div key={p.id} style={{ padding: "1rem", background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #e2e8f0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  {idx === 0 && <span style={{ fontSize: "0.7rem", background: "#fef9c3", color: "#854d0e", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontWeight: 700 }}>🥇 Best Match</span>}
                                  <span style={{ fontSize: "1.5rem" }}>{p.icon}</span>
                                  <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{p.title}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: scoreColor(p.match_score), fontSize: "0.875rem" }}>{p.match_score}%</span>
                              </div>
                              {/* Score bar */}
                              <div style={{ background: "#e2e8f0", borderRadius: "9999px", height: 6, marginBottom: "0.75rem", overflow: "hidden" }}>
                                <div style={{ width: `${p.match_score}%`, height: "100%", background: scoreColor(p.match_score), borderRadius: "9999px", transition: "width 0.7s ease" }} />
                              </div>
                              {p.matched_skills.length > 0 && (
                                <div style={{ marginBottom: "0.4rem" }}>
                                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#15803d" }}>✅ You have: </span>
                                  {p.matched_skills.map((s, i) => (
                                    <span key={i} style={{ padding: "0.15rem 0.45rem", background: "#dcfce7", color: "#15803d", borderRadius: "9999px", fontSize: "0.68rem", fontWeight: 600, marginLeft: "0.25rem", border: "1px solid #bbf7d0" }}>{s}</span>
                                  ))}
                                </div>
                              )}
                              {p.missing_skills.slice(0, 3).length > 0 && (
                                <div>
                                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8" }}>📚 Need: </span>
                                  {p.missing_skills.slice(0, 3).map((s, i) => (
                                    <a
                                      key={i}
                                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s + " tutorial")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Learn "${s}" on YouTube`}
                                      style={{
                                        padding: "0.15rem 0.45rem", background: "#f1f5f9", color: "#7c3aed",
                                        borderRadius: "9999px", fontSize: "0.68rem", fontWeight: 700,
                                        marginLeft: "0.25rem", border: "1px solid #ede9fe",
                                        textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem",
                                        transition: "background 0.15s",
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#ede9fe"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                                    >
                                      <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                                        <rect width="10" height="7" rx="1.5" fill="#FF0000"/>
                                        <polygon points="4,2 7,3.5 4,5" fill="white"/>
                                      </svg>
                                      {s}
                                    </a>
                                  ))}
                                </div>
                              )}
                              {(p.avg_salary || p.growth_rate) && (
                                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0", fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                                  {p.avg_salary  && <span>💰 {p.avg_salary}</span>}
                                  {p.growth_rate && <span>📈 {p.growth_rate}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills to learn */}
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1.125rem", padding: "1.5rem" }}>
                      <h3 style={{ margin: "0 0 1rem", fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}>
                        📚 Skills to Develop
                      </h3>
                      {plan.skills_to_learn.length === 0 ? (
                        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                          🎉 Great news — you already have all the skills for your top matched paths!
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {plan.skills_to_learn.map((s, i) => (
                            <a
                              key={i}
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s + " tutorial")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Learn "${s}" on YouTube`}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.65rem 0.875rem",
                                background: "#faf5ff", borderRadius: "0.75rem",
                                border: "1px solid #ede9fe",
                                textDecoration: "none",
                                transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ede9fe";
                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.18)";
                                e.currentTarget.style.transform = "translateX(4px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#faf5ff";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateX(0)";
                              }}
                            >
                              <span style={{ width: 24, height: 24, background: "#7c3aed", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
                                {i + 1}
                              </span>
                              <span style={{ fontWeight: 600, color: "#4c1d95", fontSize: "0.875rem", flex: 1 }}>{s}</span>
                              {/* YouTube icon */}
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="20" height="14" rx="3" fill="#FF0000"/>
                                  <polygon points="8,4 14,7 8,10" fill="white"/>
                                </svg>
                                <span style={{ fontSize: "0.65rem", color: "#7c3aed", fontWeight: 700 }}>Watch</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Quick action buttons */}
                      <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", margin: "0 0 0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Quick Actions</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <button onClick={() => setActiveTab("goals")} style={{ padding: "0.6rem 1rem", background: "#ede9fe", color: "#7c3aed", border: "none", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", textAlign: "left" }}>
                            🎯 Set a learning goal →
                          </button>
                          <button onClick={() => navigate("/jobs")} style={{ padding: "0.6rem 1rem", background: "#f0fdf4", color: "#15803d", border: "none", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", textAlign: "left" }}>
                            💼 Find matching jobs →
                          </button>
                          <button onClick={() => navigate("/resume")} style={{ padding: "0.6rem 1rem", background: "#f8fafc", color: "#475569", border: "none", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", textAlign: "left" }}>
                            📄 Update resume →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── 6-Month Roadmap ── */}
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1.125rem", padding: "1.5rem" }}>
                    <h3 style={{ margin: "0 0 1.25rem", fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}>
                      🛣️ Your 6-Month Action Roadmap
                    </h3>
                    <div style={{ display: "flex", gap: "0", overflowX: "auto", paddingBottom: "0.5rem" }}>
                      {plan.milestones.map((m, i) => {
                        const [period, ...rest] = m.split(": ");
                        const task = rest.join(": ");
                        const colors = ["#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"];
                        const c = colors[i % colors.length];
                        return (
                          <div key={i} style={{ flex: 1, minWidth: "180px", position: "relative" }}>
                            {/* Connector line */}
                            {i < plan.milestones.length - 1 && (
                              <div style={{ position: "absolute", top: "1.5rem", left: "50%", right: "-50%", height: 2, background: "#e2e8f0", zIndex: 0 }} />
                            )}
                            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 0.75rem" }}>
                              {/* Circle */}
                              <div style={{ width: 48, height: 48, borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", fontWeight: 800, fontSize: "1rem", boxShadow: `0 4px 12px ${c}40` }}>
                                {i + 1}
                              </div>
                              <p style={{ margin: "0 0 0.35rem", fontSize: "0.72rem", fontWeight: 800, color: c, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {period}
                              </p>
                              <p style={{ margin: 0, fontSize: "0.78rem", color: "#475569", lineHeight: 1.5, fontWeight: 500 }}>
                                {task}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Refresh button */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={fetchPlan}
                      style={{ padding: "0.6rem 1.25rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}
                    >
                      🔄 Refresh Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
          `}</style>
        </main>
      </div>
    </div>
  );
}
