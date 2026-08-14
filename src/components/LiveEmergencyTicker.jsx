import React, { useState, useEffect } from 'react';

const LiveEmergencyTicker = ({ requests = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  // প্রতি ২০ সেকেন্ড পর পর বর্তমান সময় চেক করবে
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // স্ট্যাটাস Emergency এবং ডেডলাইন পার না হওয়া অ্যাক্টিভ পোস্ট ফিল্টার
  const activeAlerts = requests.filter((r) => {
    const isEmergency = r.status === "Emergency" || !r.status;
    const isNotExpired = !r.deadlineTimestamp || r.deadlineTimestamp > currentTime;
    return isEmergency && isNotExpired;
  });

  // পোস্ট শেষ বা রিমুভ হয়ে গেলে কিছুই শো করবে না (সম্পূর্ণ অফ থাকবে)
  if (activeAlerts.length === 0) return null;

  return (
    <div className="w-full bg-red-950/70 border border-red-500/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 overflow-hidden shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5 shrink-0 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">
        <span className="w-2 h-2 rounded-full bg-white"></span>
        Live Alert
      </div>

      <div className="overflow-hidden whitespace-nowrap w-full relative">
        <div className="inline-block animate-marquee space-x-8 text-xs font-semibold text-red-200">
          {activeAlerts.map((item, idx) => (
            <span key={item.id || idx} className="inline-flex items-center gap-2">
              <span className="text-white font-bold">[{item.bloodGroup}]</span> Needed at {item.hospital}, {item.division || item.zila} ({item.neededTime})
              <span className="text-red-400">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveEmergencyTicker;