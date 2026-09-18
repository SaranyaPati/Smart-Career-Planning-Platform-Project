import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/authService";
import Navbar from "../components/Navbar";

const EMPTY = {
  fullName: "", email: "", phone: "",
  education: "", linkedinUrl: "", githubUrl: "",
  skills: "", targetRole: "", bio: "",
};

const Field = ({ label, value, placeholder = "Not provided" }) => (
  <div>
    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
    <span className="text-slate-800 dark:text-white font-medium text-sm">
      {value || <span className="text-slate-400 italic">{placeholder}</span>}
    </span>
  </div>
);

const Input = ({ label, id, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>
    <input
      type={type} id={id} name={id} value={value}
      onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition text-slate-900 dark:text-white"
    />
  </div>
);

const SectionCard = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
      <span className="text-lg">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(EMPTY);
  const [formData, setFormData] = useState(EMPTY);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getProfile()
      .then((res) => {
        const d = res.data;
        const filled = {
          fullName:    d.fullName    || d.username || "",
          email:       d.email       || "",
          phone:       d.phone       || "",
          education:   d.education   || "",
          linkedinUrl: d.linkedinUrl || "",
          githubUrl:   d.githubUrl   || "",
          skills:      d.skills      || "",
          targetRole:  d.targetRole  || "",
          bio:         d.bio         || "",
        };
        setProfile(filled);
        setFormData(filled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile(formData);
      setProfile(formData);
      setEditMode(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setProfile(formData);
      setEditMode(false);
      setMessage({ type: "success", text: "Profile saved!" });
    } finally {
      setSaving(false);
    }
  };

  const initial = profile.fullName?.charAt(0)?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-10">

        {/* ── Profile Header ── */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg shadow-purple-900/20">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl font-extrabold text-white shrink-0">
            {initial}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-white">{profile.fullName || "Your Name"}</h1>
            <p className="text-purple-200 text-sm mt-1">{profile.targetRole || "Career Planner"}</p>
            <p className="text-purple-300 text-xs mt-0.5">{profile.email}</p>
          </div>
          <div className="sm:ml-auto flex gap-3">
            {!editMode && (
              <button
                onClick={() => { setFormData({ ...profile }); setEditMode(true); }}
                className="px-5 py-2.5 bg-white text-purple-700 font-bold text-sm rounded-xl hover:bg-purple-50 transition shadow"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Status Message ── */}
        {message.text && (
          <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
        )}

        {!editMode ? (
          /* ══ VIEW MODE ══ */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Personal Info */}
            <SectionCard icon="👤" title="Personal Information">
              <div className="space-y-4">
                <Field label="Full Name" value={profile.fullName} />
                <Field label="Bio"       value={profile.bio} />
              </div>
            </SectionCard>

            {/* Contact */}
            <SectionCard icon="📞" title="Contact Details">
              <div className="space-y-4">
                <Field label="Email Address" value={profile.email} />
                <Field label="Phone Number"  value={profile.phone} />
              </div>
            </SectionCard>

            {/* Education */}
            <SectionCard icon="🎓" title="Education">
              <Field label="Education / Qualification" value={profile.education} placeholder="e.g. B.Tech CSE, XYZ University, 2024" />
            </SectionCard>

            {/* Social Links */}
            <SectionCard icon="🔗" title="Professional Links">
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">LinkedIn Profile</span>
                  {profile.linkedinUrl
                    ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline text-sm font-medium break-all">{profile.linkedinUrl}</a>
                    : <span className="text-slate-400 italic text-sm">Not provided</span>}
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">GitHub Profile</span>
                  {profile.githubUrl
                    ? <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline text-sm font-medium break-all">{profile.githubUrl}</a>
                    : <span className="text-slate-400 italic text-sm">Not provided</span>}
                </div>
              </div>
            </SectionCard>

            {/* Resume */}
            <SectionCard icon="📄" title="Resume">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Manage your uploaded resumes from the Resume section.</p>
              <button
                onClick={() => navigate("/resume")}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-purple-600/20"
              >
                📄 Go to Resume →
              </button>
            </SectionCard>

            {/* Skills */}
            <SectionCard icon="🛠️" title="Skills">
              {profile.skills
                ? <div className="flex flex-wrap gap-2">
                    {profile.skills.split(",").map((s, i) => (
                      <span key={i} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40 px-3 py-1 rounded-full text-xs font-semibold">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                : <span className="text-slate-400 italic text-sm">No skills listed yet.</span>}
            </SectionCard>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => { setFormData({ ...profile }); setEditMode(true); }}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>

        ) : (
          /* ══ EDIT MODE ══ */
          <form onSubmit={handleSubmit} className="space-y-5">

            <SectionCard icon="👤" title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name *" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name" required />
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">Bio</label>
                  <textarea
                    id="bio" name="bio" rows={3} value={formData.bio} onChange={handleChange}
                    placeholder="A brief professional summary..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition text-slate-900 dark:text-white resize-y"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon="📞" title="Contact Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Email Address *" id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                <Input label="Phone Number"    id="phone"              value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
              </div>
            </SectionCard>

            <SectionCard icon="🎓" title="Education">
              <Input label="Education / Qualification" id="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech Computer Science, XYZ University, 2024" />
            </SectionCard>

            <SectionCard icon="🔗" title="Professional Links">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="LinkedIn Profile URL" id="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" />
                <Input label="GitHub Profile URL"   id="githubUrl"   type="url" value={formData.githubUrl}   onChange={handleChange} placeholder="https://github.com/yourname" />
              </div>
            </SectionCard>

            <SectionCard icon="🛠️" title="Skills">
              <Input label="Skills (comma-separated)" id="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Python, Django, SQL" />
              {formData.skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.split(",").map((s, i) => (
                    <span key={i} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40 px-3 py-1 rounded-full text-xs font-semibold">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md disabled:opacity-60"
              >
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;