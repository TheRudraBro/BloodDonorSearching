import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion 
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from '../firebase/config';

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  const [lastDate, setLastDate] = useState('');
  const [savedLastDate, setSavedLastDate] = useState('');
  const [donationCount, setDonationCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid && db) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const lastDonation = data.lastDonatedDate || '';
            const historyList = data.donationHistory || (lastDonation ? [lastDonation] : []);
            
            setSavedLastDate(lastDonation);
            setLastDate(lastDonation);
            setHistory(historyList);
            setDonationCount(data.donationCount || historyList.length || 0);
          }
        } catch (err) {
          console.error("Profile error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) fetchProfile();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSaveDonationDate = async (e) => {
    e.preventDefault();
    if (!lastDate) return;
    
    if (lastDate === savedLastDate) {
      setMessage("ℹ️ This donation date is already recorded.");
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (db && user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        let currentHistory = [];
        let currentCount = 0;

        if (userSnap.exists()) {
          const uData = userSnap.data();
          currentHistory = uData.donationHistory || (uData.lastDonatedDate ? [uData.lastDonatedDate] : []);
          currentCount = uData.donationCount || currentHistory.length || 0;
        }

        const updatedHistory = [...currentHistory, lastDate];
        const newCount = currentCount + 1;

        await updateDoc(userRef, {
          lastDonatedDate: lastDate,
          donationHistory: arrayUnion(lastDate),
          donationCount: newCount,
          updatedAt: new Date().toISOString()
        });

        setSavedLastDate(lastDate);
        setHistory(updatedHistory);
        setDonationCount(newCount);
        setMessage(`🎉 Blood donation recorded! Total: ${newCount} time(s).`);
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage("❌ Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🌟 GUARANTEED CASCADE DELETE (UID & Email Multi-Check) 🌟
  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "⚠️ ARE YOU SURE?\n\nDeleting your account will permanently remove your Donor Registration, Pinned Location, and Patient Requests from Firebase. This cannot be undone."
    );

    if (!confirmation) return;

    setDeleting(true);
    try {
      if (db && user) {
        const deletePromises = [];

        // ১. donors কালেকশন থেকে UID দিয়ে ম্যাচ করে ডিলিট
        if (user.uid) {
          const donorsByUidQ = query(collection(db, "donors"), where("uid", "==", user.uid));
          const snapByUid = await getDocs(donorsByUidQ);
          snapByUid.forEach(dDoc => deletePromises.push(deleteDoc(doc(db, "donors", dDoc.id))));
        }

        // ২. donors কালেকশন থেকে Email দিয়ে ম্যাচ করে ডিলিট (সেফটি ব্যাকআপ)
        if (user.email) {
          const donorsByEmailQ = query(collection(db, "donors"), where("email", "==", user.email));
          const snapByEmail = await getDocs(donorsByEmailQ);
          snapByEmail.forEach(dDoc => deletePromises.push(deleteDoc(doc(db, "donors", dDoc.id))));
        }

        // ৩. patient_requests কালেকশন থেকে ইউজারের পোস্ট ডিলিট
        if (user.uid) {
          const reqByUid = query(collection(db, "patient_requests"), where("uid", "==", user.uid));
          const snapReq = await getDocs(reqByUid);
          snapReq.forEach(rDoc => deletePromises.push(deleteDoc(doc(db, "patient_requests", rDoc.id))));
        }

        // ৪. users কালেকশন থেকে ইউজারের পার্সোনাল ডকুমেন্ট ডিলিট
        if (user.uid) {
          deletePromises.push(deleteDoc(doc(db, "users", user.uid)));
        }

        // সব ডেটাবেজ ডিলিট শেষ হওয়া পর্যন্ত অপেক্ষা
        await Promise.all(deletePromises);
      }

      // ৫. ফায়ারবেস অথেন্টিকেশন অ্যাকাউন্ট পার্মানেন্ট ডিলিট
      await deleteUser(user);
      alert("✅ Your account and all registered donor data have been completely erased!");
      onClose();
      if (onLogout) onLogout();
    } catch (err) {
      console.error("Account delete error:", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("⚠️ Security Alert: Please log out and log in again before deleting your account.");
      } else {
        alert("Failed to delete account: " + err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const displayName = user.displayName || 'Emergency Donor';
  const autoAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b91c1c,991b1b,7f1d1d`;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=ffffff&bold=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white space-y-4">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 z-20"
        >
          ✕
        </button>

        {/* Avatar & User Info */}
        <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/40 to-slate-900 border border-red-500/60 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50">
            <img 
              src={user.photoURL || autoAvatarUrl} 
              alt="Avatar"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackAvatar;
              }}
              className="w-full h-full rounded-xl object-contain"
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-black text-white truncate flex items-center gap-1.5">
              <span className="truncate">{displayName}</span>
              <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded-full font-bold">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Donation Count Display */}
        <div className="grid grid-cols-2 gap-2 bg-[#080d1a] p-3 rounded-2xl border border-slate-800 text-center">
          <div className="border-r border-slate-800/80 pr-2">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Donated</p>
            <h4 className="text-xl font-black text-red-500">{donationCount} <span className="text-xs font-semibold text-slate-300">Times</span></h4>
          </div>
          <div className="pl-2">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Last Recorded</p>
            <h4 className="text-xs font-bold text-amber-400 mt-1 truncate">{savedLastDate || 'No record yet'}</h4>
          </div>
        </div>

        {message && (
          <div className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-xs text-center font-medium text-amber-300">
            {message}
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleSaveDonationDate} className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 block">
            🩸 Record Blood Donation Date:
          </label>
          <div className="flex gap-2">
            <input 
              type="date"
              required
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="input input-sm bg-[#080d1a] text-white border-slate-800 text-xs rounded-xl flex-1 focus:border-red-500"
            />
            <button 
              type="submit"
              disabled={saving || loading}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none font-bold rounded-xl text-xs px-4 active:scale-95 shadow-md shadow-red-950/50"
            >
              {saving ? 'Saving...' : 'Update & Count'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            * Adding a new donation date automatically increases your verified count and updates your Certificate of Honor.
          </p>
        </form>

        {/* Donation History Log */}
        {history.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-400">📜 Donation History Log:</p>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {history.map((date, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#080d1a] px-3 py-1.5 rounded-xl border border-slate-800/60 text-[11px]">
                  <span className="text-slate-300">Donation #{idx + 1}</span>
                  <span className="font-mono text-amber-400 font-bold">{date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🌟 ACTION BUTTONS 🌟 */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <button 
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold rounded-xl w-full text-xs shadow-lg shadow-red-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>🚪</span> Log Out Account
          </button>

          <button 
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="btn btn-xs bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 rounded-xl w-full text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span>🗑️</span> {deleting ? 'Deleting All Registered Data...' : 'Delete Account & Erase All Data'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;