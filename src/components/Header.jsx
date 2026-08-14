import React from 'react';

const Header = () => {
  return (
    <div className="relative bg-[#0d1322] border border-red-950/80 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Left Bright Red Accent Bar */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-600"></div>

      {/* Top Left Badge */}
      <div className="absolute top-3 left-4 sm:top-4 sm:left-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/80 border border-slate-800 text-[10px] sm:text-xs font-bold text-slate-300 backdrop-blur-md shadow-sm">
        <span className="text-amber-400">⚡</span>
        <span>Live</span>
      </div>

      {/* Top Right Badge */}
      <div className="absolute top-3 right-4 sm:top-4 sm:right-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/80 border border-slate-800 text-[10px] sm:text-xs font-bold text-slate-300 backdrop-blur-md shadow-sm">
        <span className="text-emerald-400">🛡️</span>
        <span>24/7 Verified Network</span>
      </div>

      <div className="text-center space-y-2 relative z-10 pl-2 pt-6 sm:pt-2">
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black tracking-widest text-red-400 uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Emergency Blood Network</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Blood Finder Organized By <span className="text-red-500 font-extrabold">PMH</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Instant Donor Registry, Smart Search, and AI-Powered Compatibility Matching Score.
        </p>
      </div>
    </div>
  );
};

export default Header;