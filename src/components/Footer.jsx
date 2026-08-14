import React from 'react';

const Footer = ({ onSelectTab, onSelectBloodGroup }) => {
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-12 pt-10 pb-6 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-3 sm:px-4 space-y-8">
        
        {/* 🚨 URGENT AMBULANCE & MEDICAL SUPPORT BANNER (FULLY RESPONSIVE) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border border-red-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-red-950/20 backdrop-blur-md">
          
          {/* Left Text & Icon */}
          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 text-2xl shrink-0 shadow-inner">
              <span className="animate-pulse">🚨</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-white text-sm sm:text-base leading-snug">
                Need Urgent Ambulance or Medical Support?
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                National Emergency Response Network Bangladesh
              </p>
            </div>
          </div>

          {/* Right Action Call Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <a 
              href="tel:999" 
              className="flex-1 md:flex-initial btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-extrabold px-4 sm:px-5 rounded-xl shadow-lg shadow-red-950/50 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
            >
              <span>📞</span> Call 999
            </a>
            <a 
              href="tel:16263" 
              className="flex-1 md:flex-initial btn btn-sm bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-extrabold px-4 sm:px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95"
            >
              <span>🏥</span> Health Helpline (16263)
            </a>
          </div>

        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs pt-2">
          
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-lg">
                🩸
              </span>
              <h3 className="text-lg font-black text-white">
                Emergency <span className="text-red-500">Blood Finder</span>
              </h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
              A real-time emergency blood donor matching network in Bangladesh. Connecting patients with verified lifesavers instantly.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-red-400">Quick Navigation</h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <button onClick={() => onSelectTab("search")} className="hover:text-red-400 transition-colors text-left">
                  🔍 Find Compatible Donor
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("requests")} className="hover:text-red-400 transition-colors text-left">
                  🚨 Emergency Patient Requests
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("register")} className="hover:text-red-400 transition-colors text-left">
                  📝 Register as Donor
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("directory")} className="hover:text-red-400 transition-colors text-left">
                  📋 Donors Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Filter Blood Groups */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-red-400">Quick Blood Search</h4>
            <div className="flex flex-wrap gap-1.5">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => onSelectBloodGroup(group)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-red-600 hover:text-white border border-slate-800 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Trust & Verification */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-red-400">Platform Features</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px] sm:text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> GPS Radius Location Pinpoint
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Instant WhatsApp & Direct Call
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> PDF Donors Report Export
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> 100% Free & Non-Profit Service
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Branding */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Emergency Blood Finder. All rights reserved.</p>
          
          <div className="flex items-center justify-center gap-1 font-bold text-slate-400">
            <span>Crafted with ❤️ by</span>
            <span className="text-red-500 font-black">Rudra</span>
            
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;