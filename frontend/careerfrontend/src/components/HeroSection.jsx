import React from "react";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-8 py-16 lg:py-24 gap-12 border-b border-slate-200 dark:border-slate-800 text-left">
      <div className="flex-1 max-w-xl">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
          🚀 Smart Career Planning Platform
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
          Build Your Future With{" "}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Confidence
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          Discover career opportunities, track skills, upload resumes, identify skill gaps, and achieve your dream career.
        </p>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 text-base font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 hover:-translate-y-0.5 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="flex-1 relative w-full h-[320px] lg:h-[400px] flex items-center justify-center">
        <div className="absolute top-[10%] left-[10%] bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          📄 Resume Analysis
        </div>
        <div className="absolute top-[40%] right-[10%] bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          🎯 Career Suggestions
        </div>
        <div className="absolute bottom-[10%] left-[20%] bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          📈 Skill Tracking
        </div>
      </div>
    </section>
  );
}

export default HeroSection;