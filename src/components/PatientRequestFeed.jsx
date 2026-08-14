import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PatientRequestFeed = ({ bloodGroups, requests = [], onShare }) => {
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().getTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const [newRequest, setNewRequest] = useState({
    patientName: '',
    bloodGroup: 'O+',
    bags: '1',
    hospital: '',
    division: 'Dhaka',
    zila: 'Dhaka',
    phone: '',
    expireDate: '',
    expireTime: '18:00',
    status: 'Emergency'
  });

  const formatBangladeshPhone = (phoneStr) => {
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return '88' + cleaned;
    if (!cleaned.startsWith('880') && cleaned.length === 10) return '880' + cleaned;
    return cleaned;
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.patientName || !newRequest.hospital || !newRequest.phone || !newRequest.expireDate || !newRequest.expireTime) {
      alert("Please fill in all required fields!");
      return;
    }

    const deadlineString = `${newRequest.expireDate}T${newRequest.expireTime}`;
    const deadlineTimestamp = new Date(deadlineString).getTime();

    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= new Date().getTime()) {
      alert("⚠️ Deadline must be a future date and time!");
      return;
    }

    const formattedNeededTime = new Date(deadlineString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const requestData = {
      patientName: newRequest.patientName,
      bloodGroup: newRequest.bloodGroup,
      bags: newRequest.bags,
      hospital: newRequest.hospital,
      division: newRequest.division,
      zila: newRequest.zila,
      phone: newRequest.phone,
      neededTime: formattedNeededTime,
      deadlineTimestamp: deadlineTimestamp,
      status: 'Emergency',
      createdAt: new Date().toISOString()
    };

    setSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, "patient_requests"), requestData);
      }
      setShowAddModal(false);
      setNewRequest({
        patientName: '',
        bloodGroup: 'O+',
        bags: '1',
        hospital: '',
        division: 'Dhaka',
        zila: 'Dhaka',
        phone: '',
        expireDate: '',
        expireTime: '18:00',
        status: 'Emergency'
      });
      alert("✅ Blood request posted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcastAlert = (req) => {
    const rawNumber = req.phone ? req.phone.replace(/[^0-9]/g, '') : '';
    const message = `🚨 *URGENT BLOOD ALERT | Emergency Blood Finder* 🚨\n\n🩸 *Blood Group:* ${req.bloodGroup}\n👤 *Patient:* ${req.patientName || 'Emergency Patient'}\n💉 *Bags:* ${req.bags || 1} Bag(s)\n🏥 *Hospital:* ${req.hospital}\n📍 *Location:* ${req.division}, ${req.zila}\n⏱ *Needed By:* ${req.neededTime}\n📞 *Contact:* ${rawNumber}\n\n🙏 *Please share to save a life!*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDirectPatientWhatsApp = (req) => {
    const formattedNumber = formatBangladeshPhone(req.phone);
    const directMessage = `Hello ${req.patientName || 'Sir/Madam'}, I saw your urgent request for ${req.bloodGroup} blood at ${req.hospital}. I want to help/donate blood.`;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(directMessage)}`, '_blank');
  };

  // ডেডলাইন শেষ হয়ে যাওয়া পোস্ট বাদ দিয়ে ফিল্টার
  const activeRequests = requests.filter((req) => {
    if (req.deadlineTimestamp && req.deadlineTimestamp <= currentTime) return false;
    return true;
  });

  const filteredRequests = activeRequests.filter((req) => {
    const matchGroup = filterGroup === 'ALL' || req.bloodGroup === filterGroup;
    const matchSearch =
      (req.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.zila || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-3">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#0d1322] p-3 sm:p-3.5 rounded-2xl border border-red-950/80 flex flex-col md:flex-row items-center justify-between gap-2.5 shadow-xl">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-red-500 text-lg">🚨</span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-none">Emergency Patient Feed</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Live emergency requests</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search hospital or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-xs sm:input-sm bg-[#080d1a] border-slate-700 text-white text-[11px] rounded-xl flex-1 md:w-44 focus:border-red-500"
          />

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="select select-xs sm:select-sm bg-[#080d1a] border-slate-700 text-white text-[11px] rounded-xl"
          >
            <option value="ALL">All Groups</option>
            {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-xs sm:btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-xl text-[11px] font-bold shadow-md active:scale-95"
          >
            + Post
          </button>
        </div>
      </div>

      {/* 🎴 COMPACT & PREMIUM CARDS GRID */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#0d1322] p-6 text-center rounded-2xl border border-red-950/80 text-slate-400 text-xs font-medium">
          No active emergency blood requests right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRequests.map((req) => {
            const cleanPhone = (req.phone || '').replace(/[^0-9+]/g, '');

            return (
              <div
                key={req.id}
                className="bg-[#0d1322] border border-red-950/80 hover:border-red-500/50 p-3 rounded-2xl shadow-lg space-y-2.5 transition-all group flex flex-col justify-between"
              >
                {/* Compact Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 text-red-500 font-black text-sm flex items-center justify-center shrink-0">
                      {req.bloodGroup}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate leading-tight">{req.patientName}</h4>
                      <p className="text-[10px] text-amber-400 font-semibold truncate">
                        {req.bags || 1} Bag(s) • <span className="text-slate-400">{req.neededTime}</span>
                      </p>
                    </div>
                  </div>
                  <span className="bg-red-950/80 text-red-400 border border-red-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                    Urgent
                  </span>
                </div>

                {/* Compact Location & Contact Box */}
                <div className="bg-[#080d1a] px-2.5 py-2 rounded-xl border border-slate-800/80 text-[10px] space-y-1 text-slate-300">
                  <p className="truncate">
                    <span className="text-slate-500">🏥</span> <strong className="text-slate-200">{req.hospital}</strong>
                  </p>
                  <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-slate-800/60">
                    <span className="truncate text-slate-400">📍 {req.division}, {req.zila}</span>
                    <span className="text-red-400 font-mono font-bold shrink-0">{req.phone}</span>
                  </div>
                </div>

                {/* 4 Compact Actions Grid */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onShare && onShare(req)}
                    className="btn btn-xs bg-[#080d1a] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-[10px] px-1 py-0 h-7 min-h-0 active:scale-95"
                    title="Generate Poster"
                  >
                    🎨 Poster
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBroadcastAlert(req)}
                    className="btn btn-xs bg-amber-600/90 hover:bg-amber-600 text-white border-none rounded-lg text-[10px] px-1 py-0 h-7 min-h-0 active:scale-95 shadow-sm"
                    title="Share Alert"
                  >
                    📢 Alert
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectPatientWhatsApp(req)}
                    className="btn btn-xs bg-emerald-600/90 hover:bg-emerald-600 text-white border-none rounded-lg text-[10px] px-1 py-0 h-7 min-h-0 active:scale-95 shadow-sm"
                    title="WhatsApp Chat"
                  >
                    💬 WA
                  </button>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none rounded-lg text-[10px] px-1 py-0 h-7 min-h-0 flex items-center justify-center active:scale-95 shadow-sm"
                    title="Direct Call"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl max-w-md w-full p-5 text-white space-y-3.5 relative shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-sm font-bold text-red-500">Post Urgent Blood Request</h3>

            <form onSubmit={handleAddRequest} className="space-y-2.5">
              <input
                type="text"
                required
                placeholder="Patient Name"
                value={newRequest.patientName}
                onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                className="input input-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newRequest.bloodGroup}
                  onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}
                  className="select select-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
                >
                  {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Bags"
                  value={newRequest.bags}
                  onChange={(e) => setNewRequest({ ...newRequest, bags: e.target.value })}
                  className="input input-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
                />
              </div>

              <input
                type="text"
                required
                placeholder="Hospital Name & Area"
                value={newRequest.hospital}
                onChange={(e) => setNewRequest({ ...newRequest, hospital: e.target.value })}
                className="input input-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City / District (e.g. Dhaka)"
                  value={newRequest.zila}
                  onChange={(e) => setNewRequest({ ...newRequest, zila: e.target.value })}
                  className="input input-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
                />
                <input
                  type="tel"
                  required
                  placeholder="Contact Phone (017...)"
                  value={newRequest.phone}
                  onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                  className="input input-sm bg-[#080d1a] border-slate-800 text-white w-full rounded-xl text-xs"
                />
              </div>

              <div className="bg-[#080d1a] p-2.5 rounded-xl border border-slate-800 space-y-1">
                <label className="text-[10px] text-amber-400 font-bold block">
                  ⏱ Blood Needed Deadline:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={newRequest.expireDate}
                    onChange={(e) => setNewRequest({ ...newRequest, expireDate: e.target.value })}
                    className="input input-xs bg-slate-900 border-slate-700 text-white w-full rounded-lg text-[11px]"
                  />
                  <input
                    type="time"
                    required
                    value={newRequest.expireTime}
                    onChange={(e) => setNewRequest({ ...newRequest, expireTime: e.target.value })}
                    className="input input-xs bg-slate-900 border-slate-700 text-white w-full rounded-lg text-[11px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none w-full rounded-xl font-bold text-xs mt-1"
              >
                {submitting ? 'Saving...' : 'Publish Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRequestFeed;