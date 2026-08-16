import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { bangladeshGeoData } from '../data/bangladeshGeoData';

const ADMIN_EMAILS = [
  "20234103278@cse.bubt.edu.bd",
  "admin@bloodfinder.com"
];

const PatientRequestFeed = ({ bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], requests = [], onShare, user }) => {
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const divisionList = Object.keys(bangladeshGeoData || {});
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

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
    thana: 'Mirpur Model',
    phone: '',
    expireDate: '',
    expireTime: '18:00',
    status: 'Emergency'
  });

  const availableDistricts = bangladeshGeoData?.[newRequest.division]?.districts || {};
  const districtList = Object.keys(availableDistricts);
  const availableThanas = availableDistricts[newRequest.zila]?.thanas || [];

  const formatBangladeshPhone = (phoneStr) => {
    let cleaned = (phoneStr || '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return '88' + cleaned;
    if (!cleaned.startsWith('880') && cleaned.length === 10) return '880' + cleaned;
    return cleaned;
  };

  const handleDivisionChange = (e) => {
    const newDiv = e.target.value;
    const districts = bangladeshGeoData[newDiv]?.districts || {};
    const firstDistrict = Object.keys(districts)[0] || '';
    const firstThana = districts[firstDistrict]?.thanas?.[0] || '';

    setNewRequest({
      ...newRequest,
      division: newDiv,
      zila: firstDistrict,
      thana: firstThana
    });
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    const firstThana = availableDistricts[newDist]?.thanas?.[0] || '';

    setNewRequest({
      ...newRequest,
      zila: newDist,
      thana: firstThana
    });
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();

    if (!user) return;
    if (!newRequest.patientName || !newRequest.hospital || !newRequest.phone || !newRequest.expireDate || !newRequest.expireTime) return;

    const deadlineString = `${newRequest.expireDate}T${newRequest.expireTime}`;
    const deadlineTimestamp = new Date(deadlineString).getTime();

    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= new Date().getTime()) return;

    const formattedNeededTime = new Date(deadlineString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const userPhoto = user.photoURL || user.providerData?.[0]?.photoURL || '';

    const requestData = {
      patientName: newRequest.patientName,
      bloodGroup: newRequest.bloodGroup,
      bags: newRequest.bags,
      hospital: newRequest.hospital,
      division: newRequest.division,
      zila: newRequest.zila,
      thana: newRequest.thana || '',
      phone: newRequest.phone,
      neededTime: formattedNeededTime,
      deadlineTimestamp: deadlineTimestamp,
      status: 'Emergency',
      uid: user.uid,
      authorName: user.displayName || 'Verified Citizen',
      authorEmail: user.email || '',
      authorPhoto: userPhoto,
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
        thana: 'Mirpur Model',
        phone: '',
        expireDate: '',
        expireTime: '18:00',
        status: 'Emergency'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminDeleteRequest = async (req) => {
    if (!isAdmin) return; //
    setDeletingId(req.id);
    try {
      if (db && req.id) {
        await deleteDoc(doc(db, "patient_requests", req.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBroadcastAlert = (req) => {
    const rawNumber = req.phone ? req.phone.replace(/[^0-9]/g, '') : '';
    const message = `🚨 *URGENT BLOOD ALERT | Emergency Blood Finder* 🚨\n\n🩸 *Blood Group:* ${req.bloodGroup}\n👤 *Patient:* ${req.patientName || 'Emergency Patient'}\n💉 *Bags:* ${req.bags || 1} Bag(s)\n🏥 *Hospital:* ${req.hospital}\n📍 *Location:* ${req.thana ? req.thana + ', ' : ''}${req.zila}, ${req.division}\n⏱ *Needed By:* ${req.neededTime}\n📞 *Contact:* ${rawNumber}\n\n🙏 *Please share to save a life!*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDirectPatientWhatsApp = (req) => {
    const formattedNumber = formatBangladeshPhone(req.phone);
    const directMessage = `Hello ${req.patientName || 'Sir/Madam'}, I saw your urgent request for ${req.bloodGroup} blood at ${req.hospital}. I want to help/donate blood.`;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(directMessage)}`, '_blank');
  };

  const activeRequests = requests.filter((req) => {
    if (req.deadlineTimestamp && req.deadlineTimestamp <= currentTime) return false;
    return true;
  });

  const filteredRequests = activeRequests.filter((req) => {
    const matchGroup = filterGroup === 'ALL' || req.bloodGroup === filterGroup;
    const matchSearch =
      (req.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.zila || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.thana || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* 🔒 LOGOUT STATE: LOGIN REQUIRED CARD */}
      {!user && (
        <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl p-6 sm:p-10 text-center space-y-3 shadow-2xl w-full">
          <span className="text-3xl">🔒</span>
          <h3 className="text-base sm:text-lg font-bold text-white">Login Required</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            You must log in with your Google or verified account to create and publish an urgent patient blood request.
          </p>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="bg-gradient-to-br from-[#0d1322] to-[#080d1a] p-4 sm:p-5 rounded-3xl border border-red-950/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl shadow-inner">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white leading-none">Emergency Patient Feed</h3>
              {isAdmin && (
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  Admin Mode
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Live verified requests needing urgent blood donors</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search hospital, city or thana..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white text-xs rounded-2xl flex-1 md:w-52 focus:border-red-500 shadow-inner"
          />

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white text-xs rounded-2xl font-semibold shadow-inner"
          >
            <option value="ALL">All Groups</option>
            {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
          </select>

          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-sm sm:btn-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none rounded-2xl text-xs font-bold shadow-lg shadow-red-950/60 active:scale-95 transition-all flex items-center gap-1 px-4"
            >
              <span>+</span> Post Request
            </button>
          )}
        </div>
      </div>

      {/* Ultra-Premium Patient Cards */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#0d1322] p-8 text-center rounded-3xl border border-red-950/80 text-slate-400 text-xs font-medium">
          No active emergency blood requests right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRequests.map((req) => {
            const cleanPhone = (req.phone || '').replace(/[^0-9+]/g, '');
            const authorImg = req.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(req.authorName || req.patientName)}&backgroundColor=b91c1c`;
            const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.authorName || 'User')}&background=dc2626&color=ffffff&bold=true`;

            return (
              <div
                key={req.id}
                className="relative overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#090e1c] border border-red-950/90 hover:border-red-500/50 p-4 rounded-3xl shadow-xl space-y-3.5 transition-all group flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-600/10 transition-all"></div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 relative z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={authorImg}
                      alt={req.authorName || "Author"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                      className="w-6 h-6 rounded-full bg-slate-900 object-cover ring-1 ring-red-500/70 shrink-0"
                    />
                    <span className="text-[11px] text-slate-400 truncate font-medium">
                      Posted by: <strong className="text-slate-200">{req.authorName || 'Verified User'}</strong>
                    </span>
                  </div>

                  <span className="bg-red-950/90 text-red-400 border border-red-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider animate-pulse">
                    Urgent
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border border-red-400/50 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-red-950/60">
                      {req.bloodGroup}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-red-400 transition-colors">
                        {req.patientName}
                      </h4>
                      <p className="text-[11px] text-amber-400 font-bold truncate mt-1 flex items-center gap-1">
                        <span>💉</span> {req.bags || 1} Bag(s) Needed
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        ⏱ Needed by: {req.neededTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#060a14]/90 px-3 py-2.5 rounded-2xl border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300 relative z-10">
                  <p className="truncate flex items-center gap-1.5">
                    <span className="text-red-400">🏥</span> <strong className="text-slate-200">{req.hospital}</strong>
                  </p>
                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/60">
                    <span className="truncate text-slate-400">
                      📍 {req.thana ? `${req.thana}, ` : ''}{req.zila}
                    </span>
                    <span className="text-red-400 font-mono font-bold tracking-wider shrink-0">{req.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-0.5 relative z-10">
                  <button
                    type="button"
                    onClick={() => onShare && onShare(req)}
                    className="btn btn-sm bg-[#080d1a] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-[10px] px-1 py-0 h-8 min-h-0 active:scale-95 font-bold"
                  >
                    🎨 Poster
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBroadcastAlert(req)}
                    className="btn btn-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-none rounded-xl text-[10px] px-1 py-0 h-8 min-h-0 active:scale-95 font-bold shadow-md shadow-amber-950/50"
                  >
                    📢 Alert
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectPatientWhatsApp(req)}
                    className="btn btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-none rounded-xl text-[10px] px-1 py-0 h-8 min-h-0 active:scale-95 font-bold shadow-md shadow-emerald-950/50"
                  >
                    💬 WA
                  </button>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none rounded-xl text-[10px] px-1 py-0 h-8 min-h-0 flex items-center justify-center active:scale-95 font-bold shadow-md shadow-red-950/50"
                  >
                    📞 Call
                  </a>
                </div>

                {isAdmin && (
                  <div className="pt-1.5 border-t border-red-950/80 relative z-10">
                    <button
                      type="button"
                      disabled={deletingId === req.id}
                      onClick={() => handleAdminDeleteRequest(req)}
                      className="btn btn-xs bg-rose-950 hover:bg-red-600 text-rose-300 hover:text-white border border-red-800/60 w-full rounded-lg text-[10px] h-6 min-h-0 flex items-center justify-center gap-1 transition-all"
                    >
                      <span>🗑️</span> {deletingId === req.id ? 'Deleting...' : 'Admin Delete Request'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {showAddModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 z-20"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=dc2626&color=ffffff&bold=true`}
                alt="User"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full bg-slate-900 object-cover ring-2 ring-red-500/80 p-0.5"
              />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-none">Post Urgent Blood Request</h3>
                <p className="text-[11px] text-emerald-400 mt-1">Posting as: {user?.displayName || user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleAddRequest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Patient Name"
                    value={newRequest.patientName}
                    onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                    className="input input-sm bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                    className="input input-sm bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Blood Group</label>
                  <select
                    value={newRequest.bloodGroup}
                    onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}
                    className="select select-sm bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs focus:border-red-500"
                  >
                    {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Bags Required</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 2"
                    value={newRequest.bags}
                    onChange={(e) => setNewRequest({ ...newRequest, bags: e.target.value })}
                    className="input input-sm bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Hospital & Ward Info</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical College, Ward 4"
                  value={newRequest.hospital}
                  onChange={(e) => setNewRequest({ ...newRequest, hospital: e.target.value })}
                  className="input input-sm bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs focus:border-red-500"
                />
              </div>

              {/* Geographic Cascading Selectors */}
              <div className="grid grid-cols-3 gap-2 bg-[#080d1a] p-2.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Division</label>
                  <select
                    value={newRequest.division}
                    onChange={handleDivisionChange}
                    className="select select-xs bg-[#0d1322] border-slate-700 text-white w-full rounded-lg text-[10px]"
                  >
                    {divisionList.map(div => (<option key={div} value={div}>{div}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">District</label>
                  <select
                    value={newRequest.zila}
                    onChange={handleDistrictChange}
                    className="select select-xs bg-[#0d1322] border-slate-700 text-white w-full rounded-lg text-[10px]"
                  >
                    {districtList.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Thana / Area</label>
                  <select
                    value={newRequest.thana}
                    onChange={(e) => setNewRequest({ ...newRequest, thana: e.target.value })}
                    className="select select-xs bg-[#0d1322] border-slate-700 text-white w-full rounded-lg text-[10px]"
                  >
                    {availableThanas.map(th => (<option key={th} value={th}>{th}</option>))}
                  </select>
                </div>
              </div>

              {/* Deadline Setting */}
              <div className="bg-[#080d1a] p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="text-[11px] text-amber-400 font-bold block">
                  ⏱ Blood Needed Deadline:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={newRequest.expireDate}
                    onChange={(e) => setNewRequest({ ...newRequest, expireDate: e.target.value })}
                    className="input input-sm bg-[#0d1322] border-slate-700 text-white w-full rounded-xl text-xs"
                  />
                  <input
                    type="time"
                    required
                    value={newRequest.expireTime}
                    onChange={(e) => setNewRequest({ ...newRequest, expireTime: e.target.value })}
                    className="input input-sm bg-[#0d1322] border-slate-700 text-white w-full rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm sm:btn-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-950/60 active:scale-[0.99] transition-all mt-1"
              >
                {submitting ? 'Publishing Request...' : 'Publish Emergency Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRequestFeed;