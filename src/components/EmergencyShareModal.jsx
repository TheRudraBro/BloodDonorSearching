import React from 'react';

const EmergencyShareModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const shareText = `🚨 *URGENT BLOOD NEEDED* 🚨\n\n🩸 *Blood Group:* ${request.bloodGroup}\n🏥 *Hospital:* ${request.hospital}\n📍 *Location:* ${request.division}, ${request.zila}\n⏱ *Needed By:* ${request.neededTime}\n📞 *Contact:* ${request.phone}\n\nPlease share to help save a life!`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert("✅ Emergency alert text copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">✕</button>
        
        <h3 className="text-base font-black text-red-500 flex items-center gap-2">
          📢 Share Emergency Alert
        </h3>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
          {shareText}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button 
            onClick={handleWhatsAppShare}
            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl font-bold text-xs"
          >
            💬 WhatsApp
          </button>
          <button 
            onClick={handleCopy}
            className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs"
          >
            📋 Copy Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyShareModal;