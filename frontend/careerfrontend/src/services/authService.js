import API from "./api";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser    = async (userData) => API.post("register/",       userData);
export const loginUser       = async (userData) => API.post("login/",          userData);
export const sendOTP         = async (data)     => API.post("send-otp/",       data);
export const verifyOTP       = async (data)     => API.post("verify-otp/",     data);
export const resetPassword   = async (data)     => API.post("reset-password/", data);

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile    = async ()            => API.get("profile/");
export const updateProfile = async (profileData) => API.put("profile/update/", profileData);

// ─── Resumes ──────────────────────────────────────────────────────────────────
export const getResumes      = async ()         => API.get("resumes/");
export const getResumeStatus = async ()         => API.get("resumes/status/");
export const uploadResume    = async (formData) =>
  API.post("resumes/", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteResume    = async (id)       => API.delete(`resumes/${id}/`);
export const analyzeResume   = async (id)       => API.get(`resumes/${id}/analyze/`);

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const getJobs      = async (search = "") =>
  API.get(`jobs/${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const getSavedJobs = async ()            => API.get("jobs/saved/");
export const saveJob      = async (id)          => API.post(`jobs/${id}/save/`);
export const unsaveJob    = async (id)          => API.delete(`jobs/${id}/save/`);

// Job Applications
export const applyToJob       = async (id, data) => API.post(`jobs/${id}/apply/`, data);
export const checkApplied     = async (id)        => API.get(`jobs/${id}/apply/`);
export const getMyApplications = async ()         => API.get("jobs/applications/");

// ─── Careers ──────────────────────────────────────────────────────────────────
export const getCareerPlan = async () => API.get("careers/plan/");