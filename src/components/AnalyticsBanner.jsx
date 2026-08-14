import React, { useState, useEffect } from 'react';

const AnalyticsBanner = ({ totalDonors = 0, totalRequests = 0 }) => {
  const [counts, setCounts] = useState({ bags: 0, time: 0, accuracy: 0 });

  // Smooth CountUp Effect
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        bags: Math.floor(progress * 142),
        time: Math.floor(progress * 11),
        accuracy: Math.floor(progress * 99)
      });
      if (step >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      
      {/* Metric 1: Total Donors */}
      <div className="bento-card p-3.5 sm:p-4 flex items-center gap-3 relative overflow-hidden group">
        <div className="w-10 h-10 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
          👥
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Donors</p>
          <h3 className="text-base sm:text-lg font-black text-white">{totalDonors > 0 ? totalDonors : 48}+</h3>
        </div>
        <div className="absolute right-2 top-2 text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
          ● Live
        </div>
      </div>

      {/* Metric 2: Blood Units Supplied */}
      <div className="bento-card p-3.5 sm:p-4 flex items-center gap-3 relative overflow-hidden group">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
          🩸
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bags Managed</p>
          <h3 className="text-base sm:text-lg font-black text-amber-400">{counts.bags}+ Units</h3>
        </div>
      </div>

      {/* Metric 3: Response Time */}
      <div className="bento-card p-3.5 sm:p-4 flex items-center gap-3 relative overflow-hidden group">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
          ⚡
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Response</p>
          <h3 className="text-base sm:text-lg font-black text-white">{counts.time} Mins</h3>
        </div>
      </div>

      {/* Metric 4: Verified Network */}
      <div className="bento-card p-3.5 sm:p-4 flex items-center gap-3 relative overflow-hidden group">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
          🛡️
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Rate</p>
          <h3 className="text-base sm:text-lg font-black text-emerald-400">{counts.accuracy}% Safe</h3>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsBanner;