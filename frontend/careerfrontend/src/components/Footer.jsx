import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 pt-16 pb-10 w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🎯 Smart Career
          </h3>
          <p className="text-sm leading-relaxed max-w-xs">
            Helping students and job seekers discover the right career path, improve skills, and achieve their professional goals.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">Home</a></li>
            <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
          </ul>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Features</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white transition cursor-default">Resume Analysis</li>
            <li className="hover:text-white transition cursor-default">Career Suggestions</li>
            <li className="hover:text-white transition cursor-default">Skill Tracking</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;