import React, { useState } from 'react';

const PatientRequestFeed = ({ bloodGroups, requests = [], setRequests, onShare }) => {
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // নতুন রিকোয়েস্ট ফর্ম স্টেট
  const [newRequest, setNewRequest] = useState({
    patientName: '',
    bloodGroup: 'O+',
    bags: '1',
    hospital: '',
    division: 'Dhaka',
    zila: 'Dhaka',
    phone: '',
    neededTime: 'Urgent (Within 2 Hours)',
    status: 'Emergency'
  });

  // বাংলাদেশ ফোন নম্বর ফরম্যাট হেল্পার (৮৮০ ফরম্যাটে নেওয়া)
  const formatBangladeshPhone = (phoneStr) => {
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '88' + cleaned;
    } else if (!cleaned.startsWith('880') && cleaned.length === 10) {
      cleaned = '880' + cleaned;
    }
    return cleaned;
  };

  const handleAddRequest = (e) => {
    e.preventDefault();
    if (!newRequest.patientName || !newRequest.hospital || !newRequest.phone) {
      alert("Please fill in all required fields!");
      return;
    }

    const requestObj = {
      ...newRequest,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRequests([requestObj, ...requests]);
    setShowAddModal(false);
    setNewRequest({
      patientName: '',
      bloodGroup: 'O+',
      bags: '1',
      hospital: '',
      division: 'Dhaka',
      zila: 'Dhaka',
      phone: '',
      neededTime: 'Urgent (Within 2 Hours)',
      status: 'Emergency'
    });
  };

  // ১. গ্রুপ বা স্ট্যাটাসে জরুরি অ্যালার্ট ব্রডকাস্ট (General Alert)
  const handleBroadcastAlert = (req) => {
    const rawNumber = req.phone ? req.phone.replace(/[^0-9]/g, '') : '';
    const message = `🚨 *URGENT BLOOD ALERT | Emergency Blood Finder* 🚨\n\n🩸 *Blood Group:* ${req.bloodGroup}\n👤 *Patient:* ${req.patientName || 'Emergency Patient'}\n💉 *Bags Needed:* ${req.bags || 1} Bag(s)\n🏥 *Hospital:* ${req.hospital}\n📍 *Location:* ${req.division}, ${req.zila}\n⏱ *Needed By:* ${req.neededTime}\n📞 *Direct Call:* ${rawNumber}\n\n🙏 *Please share to save a life!*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // ২. রোগীর নিজস্ব হোয়াটসঅ্যাপ নম্বরে সরাসরি ব্যক্তিগত মেসেজ (Direct WhatsApp Chat)
  const handleDirectPatientWhatsApp = (req) => {
    const formattedNumber = formatBangladeshPhone(req.phone);
    const directMessage = `Hello ${req.patientName || 'Sir/Madam'}, I saw your urgent request for ${req.bloodGroup} blood at ${req.hospital} on Emergency Blood Finder. I am interested in helping/donating. Please let me know the current status.`;
    const directWhatsAppUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(directMessage)}`;
    window.open(directWhatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredRequests = requests.filter((req) => {
    const matchGroup = filterGroup === 'ALL' || req.bloodGroup === filterGroup;
    const matchSearch =
      req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.zila.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* 🔍 Top Bar & Controls */}
      <div className="bg-slate-950/80 p-4 sm:p-5 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 text-xl shrink-0 shadow-inner">
            🚨
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">Emergency Patient Feed</h3>
            <p className="text-[11px] text-slate-400 font-medium">Live emergency blood requests from verified hospital zones</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search patient, hospital, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm bg-slate-900 border-slate-800 text-white text-xs rounded-xl flex-1 md:w-52 focus:border-red-500 focus:outline-none transition-colors"
          />

          {/* Blood Group Filter */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="select select-sm bg-slate-900 border-slate-800 text-white text-xs rounded-xl focus:border-red-500"
          >
            <option value="ALL">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Post Request Action */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none rounded-xl text-xs font-black shadow-lg shadow-red-950/60 px-4 active:scale-95 transition-all"
          >
            + Post Request
          </button>
        </div>
      </div>

      {/* 🎴 Ultra-Premium Patient Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRequests.map((req) => {
          const cleanPhone = req.phone.replace(/[^0-9+]/g, '');

          return (
            <div
              key={req.id}
              className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/80 hover:border-red-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-300 group hover:shadow-red-950/20"
            >
              {/* Ambient Background Accent Glow */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/20 transition-all"></div>

              {/* Card Header Section */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  
                  {/* Blood Group Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border border-red-400/50 flex flex-col items-center justify-center text-white font-black text-lg shadow-lg shadow-red-950/60 shrink-0">
                    <span>{req.bloodGroup}</span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-white truncate tracking-wide">
                      {req.patientName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mt-0.5">
                      <span className="text-red-400">💉 {req.bags || 1} Bag(s)</span>
                      <span>•</span>
                      <span className="text-amber-400">⏱ {req.neededTime}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span className="bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  {req.status || 'Emergency'}
                </span>
              </div>

              {/* Location & Hospital Info Container */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5 text-slate-300 relative z-10 backdrop-blur-sm">
                <p className="flex items-center gap-2 truncate font-medium">
                  <span className="text-slate-500">🏥</span> 
                  <span className="text-slate-400">Hospital:</span> 
                  <strong className="text-white truncate">{req.hospital}</strong>
                </p>
                <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-300">
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-500">📍</span> 
                    <span className="text-slate-400">Location:</span> 
                    <strong className="text-white">{req.division}, {req.zila}</strong>
                  </p>
                  <p className="text-slate-400 shrink-0">
                    📞 <strong className="text-red-400">{req.phone}</strong>
                  </p>
                </div>
              </div>

              {/* 🌟 4 DEDICATED SEPARATE ACTION BUTTONS 🌟 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 relative z-10">
                
                {/* ১. পোস্টার / ইমেজ জেনারেটর বাটন */}
                <button
                  type="button"
                  onClick={() => onShare && onShare(req)}
                  className="btn btn-xs sm:btn-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                  title="Generate Social Media Poster"
                >
                  <span>🎨</span> Poster
                </button>

                {/* ২. সাধারণ হোয়াটসঅ্যাপ ব্রডকাস্ট অ্যালার্ট বাটন */}
                <button
                  type="button"
                  onClick={() => handleBroadcastAlert(req)}
                  className="btn btn-xs sm:btn-sm bg-amber-600/80 hover:bg-amber-600 text-white border border-amber-500/40 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-amber-950/40"
                  title="Broadcast Alert to WhatsApp Groups"
                >
                  <span>📢</span> Alert
                </button>

                {/* ৩. রোগীর ব্যক্তিগত হোয়াটসঅ্যাপে সরাসরি মেসেজ */}
                <button
                  type="button"
                  onClick={() => handleDirectPatientWhatsApp(req)}
                  className="btn btn-xs sm:btn-sm bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-950/40"
                  title="Send Direct WhatsApp Message to Patient"
                >
                  <span>💬</span> WhatsApp
                </button>

                {/* ৪. ইনপুট দেওয়া নম্বরে সরাসরি ডায়াল/কল বাটন */}
                <a
                  href={`tel:${cleanPhone}`}
                  className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-red-950/50"
                  title="Direct Phone Call"
                >
                  <span>📞</span> Call
                </a>

              </div>

            </div>
          );
        })}
      </div>

      {/* ➕ Add New Emergency Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-red-500 flex items-center gap-2">
              <span>🩸</span> Post Urgent Blood Request
            </h3>

            <form onSubmit={handleAddRequest} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Uddin"
                  value={newRequest.patientName}
                  onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                  className="input input-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Blood Group</label>
                  <select
                    value={newRequest.bloodGroup}
                    onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}
                    className="select select-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Bags Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={newRequest.bags}
                    onChange={(e) => setNewRequest({ ...newRequest, bags: e.target.value })}
                    className="input input-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Hospital Name & Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={newRequest.hospital}
                  onChange={(e) => setNewRequest({ ...newRequest, hospital: e.target.value })}
                  className="input input-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka"
                    value={newRequest.zila}
                    onChange={(e) => setNewRequest({ ...newRequest, zila: e.target.value })}
                    className="input input-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                    className="input input-sm bg-slate-950 border-slate-800 text-white w-full rounded-xl text-xs focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full rounded-xl font-bold text-xs mt-2 shadow-lg shadow-red-950/50"
              >
                Publish Emergency Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientRequestFeed;