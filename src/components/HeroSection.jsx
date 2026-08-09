import React from 'react';

const HeroSection = ({ 
  donorsCount, 
  requestsCount, 
  bloodGroups, 
  onSelectBloodGroup, 
  selectedBloodGroup,
  onOpenChart 
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/30 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-red-600/20 text-red-400 border-red-500/30 text-xs font-bold px-3 py-1">
                🩸 Emergency Blood Matching System
              </span>

              {/* Compatibility Chart Modal Trigger Button */}
              <button 
                onClick={onOpenChart}
                className="badge bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border-sky-500/40 text-xs font-bold px-3 py-1 cursor-pointer transition-all"
              >
                📊 Compatibility Chart
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Every Blood Donor Is A <span className="text-red-500">Lifesaver</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-2">
              Find verified blood donors within 5 km of your location using GPS and instant AI match scoring.
            </p>
          </div>

          {/* Stats Counter */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-center backdrop-blur-md">
              <h3 className="text-xl md:text-2xl font-black text-red-500">{donorsCount}+</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Donors</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-center backdrop-blur-md">
              <h3 className="text-xl md:text-2xl font-black text-emerald-400">{requestsCount}+</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Requests</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-center backdrop-blur-md">
              <h3 className="text-xl md:text-2xl font-black text-amber-400">100%</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Free & Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Blood Group Filter Chips */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
        <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <span>⚡</span> Quick Filter by Blood Group:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectBloodGroup("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedBloodGroup === ""
                ? "bg-slate-100 text-slate-900 font-extrabold shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Groups
          </button>
          {bloodGroups.map((group) => (
            <button
              key={group}
              onClick={() => onSelectBloodGroup(group)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedBloodGroup === group
                  ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 ring-2 ring-red-400"
                  : "bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700"
              }`}
            >
              🩸 {group}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;