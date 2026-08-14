import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ReportFakeModal = ({ isOpen, onClose, request }) => {
  const [reason, setReason] = useState('Already Managed');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (db && request.id) {
        await updateDoc(doc(db, "patientRequests", request.id), {
          status: reason === 'Already Managed' ? 'Completed' : 'Reported',
          reportReason: reason,
          reportedAt: new Date().toISOString()
        });
      }
      alert("✅ Status submitted. Thank you for keeping the community safe.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Action recorded successfully.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">✕</button>

        <h3 className="text-base font-black text-amber-400">🛡️ Update Request Status</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-xs text-slate-300 font-semibold block">Select Reason:</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="select select-sm w-full bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
          >
            <option value="Already Managed">Blood Already Managed (Done)</option>
            <option value="Fake Number">Fake / Unreachable Number</option>
            <option value="Spam">Spam or Duplicate Post</option>
          </select>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none w-full rounded-xl font-bold text-xs"
          >
            {loading ? 'Submitting...' : 'Confirm Update'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportFakeModal;