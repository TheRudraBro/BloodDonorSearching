import React from 'react';

const UserProfileCard = ({ user, onLogout }) => {
  if (!user) return null;

  // DiceBear Avatar API for dynamic user image
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName || user.email)}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={user.photoURL || avatarUrl} 
              alt="User Avatar" 
              className="w-14 h-14 rounded-full bg-slate-800 border-2 border-red-500/80 p-0.5 object-cover shadow-lg shadow-red-950/50"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Online & Ready"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-wide">
                {user.displayName || 'Emergency Donor'}
              </h3>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ✓ Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="badge bg-red-600/20 text-red-400 border-red-500/30 text-[10px] font-bold px-2 py-0.5">
                🩸 Active Account
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                ⭐ 5.0 Rating
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
          <button 
            onClick={onLogout}
            className="btn btn-sm bg-red-600/80 hover:bg-red-600 text-white border-none font-bold px-4 shadow-lg shadow-red-900/40 transition-all duration-200"
          >
            🔒 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;