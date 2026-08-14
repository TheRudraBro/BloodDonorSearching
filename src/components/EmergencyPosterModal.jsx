import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

const EmergencyPosterModal = ({ isOpen, onClose, request }) => {
  const posterRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !request) return null;

  const handleWhatsAppAlert = () => {
    const rawNumber = request.phone ? request.phone.replace(/[^0-9]/g, '') : '';
    const message = `🚨 *URGENT BLOOD ALERT | Emergency Blood Finder* 🚨\n\n🩸 *Blood Group:* ${request.bloodGroup}\n👤 *Patient:* ${request.patientName || 'Emergency Patient'}\n💉 *Bags:* ${request.bags || 1} Bag(s)\n🏥 *Hospital:* ${request.hospital}\n📍 *Location:* ${request.division}, ${request.zila}\n⏱ *Needed By:* ${request.neededTime}\n📞 *Call Contact:* ${rawNumber}\n\n🙏 *Please share and help save a life!*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 1,
      });

      const link = document.createElement('a');
      link.download = `Emergency-Blood-${request.bloodGroup}-${(request.patientName || 'Alert').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl max-w-lg w-full p-5 shadow-2xl relative text-white space-y-4 my-auto">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 z-20"
        >
          ✕
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <div>
            <h3 className="text-sm font-black text-white">Emergency Media Kit & WhatsApp Alert</h3>
            <p className="text-[10px] text-slate-400">Download square poster or broadcast to WhatsApp groups</p>
          </div>
        </div>

        {/* Poster Canvas */}
        <div className="flex justify-center">
          <div 
            ref={posterRef}
            className="w-full max-w-[360px] aspect-square bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 border-2 border-red-600 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-lg">🩸</span>
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-200">Emergency Blood Finder</span>
              </div>
              <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                Urgent Alert
              </span>
            </div>

            <div className="text-center my-auto py-2 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Required Blood Group</p>
              <div className="inline-block bg-gradient-to-b from-red-600 to-red-800 text-white text-5xl font-black px-6 py-2 rounded-2xl border-2 border-red-400 shadow-2xl shadow-red-950">
                {request.bloodGroup}
              </div>
              <p className="text-xs text-red-300 font-bold mt-1">Needed: {request.bags || 1} Bag(s)</p>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-1 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-300">
                <span>👤 Patient: <strong className="text-white">{request.patientName || 'Emergency Patient'}</strong></span>
                <span>⏱ <strong className="text-amber-400">{request.neededTime}</strong></span>
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                🏥 Hospital: <strong className="text-white">{request.hospital}</strong>
              </div>
              <div className="text-[10px] text-slate-300">
                📍 Location: <strong className="text-white">{request.division}, {request.zila}</strong>
              </div>
            </div>

            <div className="mt-2 text-center bg-red-600/20 border border-red-500/40 rounded-xl py-1.5">
              <p className="text-[11px] font-black text-white flex items-center justify-center gap-1">
                📞 Contact: <span className="text-red-400 text-sm font-extrabold">{request.phone}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button 
            type="button"
            onClick={handleWhatsAppAlert}
            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>💬</span> WhatsApp Alert
          </button>
          
          <button 
            type="button"
            onClick={handleDownloadPoster}
            disabled={downloading}
            className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>📥</span> {downloading ? 'Generating...' : 'Download Image'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmergencyPosterModal;