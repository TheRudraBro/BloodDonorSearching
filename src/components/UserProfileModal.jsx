import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [lastDonateDate, setLastDonateDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  // Firestore থেকে ইউজারের ডাটা লোড
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.lastDonatedDate) setLastDonateDate(data.lastDonatedDate);
            if (data.photoURL) setPreviewUrl(data.photoURL);
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      }
    };
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const currentPhoto = previewUrl || user.photoURL || fallbackAvatar;

  // রক্তদানের যোগ্যতার দিন হিসাব (৯০ দিন গাইডলাইন)
  const calculateAvailability = (dateString) => {
    if (!dateString) return { isAvailable: true, text: "Ready to Donate" };
    const lastDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 90) {
      return { isAvailable: true, text: "Ready to Donate" };
    } else {
      return { isAvailable: false, text: `Resting (${90 - diffDays} Days Left)` };
    }
  };

  const status = calculateAvailability(lastDonateDate);

  // ফাইল আপলোড হ্যান্ডলার
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please upload an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // প্রোফাইল সাবমিট ফায়ারবেসে
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const photoToSave = previewUrl || user.photoURL || fallbackAvatar;

      // ১. Firestore-এ ডাটা আপডেট
      if (user?.uid && db) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Emergency Donor',
          lastDonatedDate: lastDonateDate,
          photoURL: photoToSave,
          isAvailable: status.isAvailable,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // ২. Firebase Auth Profile আপডেট (যদি URL হয়)
      if (photoToSave && !photoToSave.startsWith('data:image')) {
        try {
          await updateProfile(user, { photoURL: photoToSave });
        } catch (authErr) {
          console.warn("Auth sync skipped:", authErr);
        }
      }

      alert("✅ Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      {/* Container */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-20"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          {/* Avatar Header */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <img 
                src={currentPhoto} 
                alt="Profile Avatar" 
                onError={(e) => { e.target.src = fallbackAvatar; }}
                className="w-24 h-24 rounded-full bg-slate-800 border-2 border-red-500/80 p-1 object-cover mx-auto shadow-2xl shadow-red-950/60"
              />
              
              {/* Photo Upload Floating Button */}
              <label className="absolute bottom-1 right-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform active:scale-90 border border-slate-900">
                <span className="text-xs">📷</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Name & Email */}
            <h3 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              {user.displayName || 'Emergency Donor'}
              <span className="text-blue-400 text-[9px] font-extrabold bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                ✓
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>

          {/* Availability Status Badge */}
          <div className={`p-2.5 rounded-2xl border text-center transition-all ${
            status.isAvailable 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <p className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
              {status.text}
            </p>
          </div>

          {/* Last Donation Date Box */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 backdrop-blur-sm">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              🩸 Last Donation Date:
            </label>
            <input 
              type="date" 
              value={lastDonateDate}
              onChange={(e) => setLastDonateDate(e.target.value)}
              className="input input-sm bg-slate-950 text-white border-slate-800 w-full text-xs rounded-xl focus:border-red-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full font-extrabold rounded-xl shadow-lg shadow-red-950/50 text-xs"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Updates'}
            </button>

            <button 
              type="button"
              onClick={() => { onClose(); onLogout(); }} 
              className="btn btn-xs bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 border-none w-full font-semibold rounded-xl"
            >
              🔒 Logout Account
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default UserProfileModal;