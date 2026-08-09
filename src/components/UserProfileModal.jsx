import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName || user.email)}`;
  const currentPhoto = previewUrl || user.photoURL || defaultAvatar;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!previewUrl) return;
    setLoading(true);
    try {
      await updateProfile(user, { photoURL: previewUrl });
      alert("✅ Profile picture updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="text-center mb-6 relative z-10">
          <div className="relative inline-block mb-3">
            <img 
              src={currentPhoto} 
              alt="Profile Avatar" 
              className="w-24 h-24 rounded-full bg-slate-800 border-2 border-red-500/80 p-1 object-cover mx-auto shadow-2xl shadow-red-950/50"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Online"></span>
          </div>

          <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
            {user.displayName || 'Emergency Donor'}
            <span className="text-blue-400 text-[10px] font-extrabold bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
        </div>

        {/* Photo Upload Section */}
        <form onSubmit={handleUploadPhoto} className="mb-5 p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 backdrop-blur-sm space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">📷 Change Avatar</label>
            <span className="text-[10px] text-slate-400">PNG / JPG</span>
          </div>
          
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-xs w-full bg-slate-900 text-slate-300 border-slate-700 text-xs rounded-xl"
          />

          {previewUrl && (
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none w-full font-bold mt-1 shadow-lg shadow-red-950/40 rounded-xl"
            >
              {loading ? 'Updating...' : 'Save Profile Photo'}
            </button>
          )}
        </form>

        {/* Details Box */}
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-800 space-y-2.5 mb-6 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Auth System:</span>
            <span className="font-bold text-red-400">
              {user.providerData[0]?.providerId === 'google.com' ? '🌐 Google OAuth' : '✉️ Email / Password'}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Donor Status:</span>
            <span className="badge bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-1">
              🟢 Ready for Donation
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Trust Score:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              ⭐ 5.0 / 5.0
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={onClose} 
            className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs font-bold flex-1 rounded-xl"
          >
            Close
          </button>

          <button 
            onClick={() => { onClose(); onLogout(); }} 
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none text-xs font-bold flex-1 shadow-lg shadow-red-950/50 rounded-xl"
          >
            🔒 Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;