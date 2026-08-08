import React from 'react';
import { bdLocations } from '../data/bdLocations';

const checkEligibility = (lastDateStr) => {
  if (!lastDateStr) return { eligible: true, daysLeft: 0 };
  const lastDate = new Date(lastDateStr);
  const today = new Date();
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays >= 90) {
    return { eligible: true, daysLeft: 0 };
  }
  return { eligible: false, daysLeft: 90 - diffDays };
};

const DonorFind = ({ 
  divisions, 
  bloodGroups, 
  requestedBloodData, 
  setRequestedBloodData, 
  matchedDonors = [] 
}) => {
  const [selectedDiv, setSelectedDiv] = React.useState("");
  const [selectedZila, setSelectedZila] = React.useState("");

  // Fix: Reliable PDF Download Handler
  const handleDownloadPDF = () => {
    const element = document.getElementById("matched-donors-pdf-content");
    if (!element) {
      alert("PDF Content area not ready!");
      return;
    }

    element.style.display = "block"; // Temporarily show for capture

    const opt = {
      margin:       0.4,
      filename:     `Matched_Blood_Donors_${requestedBloodData.bloodGroup || 'List'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = "none"; // Hide after capture
      });
    } else {
      alert("PDF library loading error. Please refresh the page.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Emergency Request Banner */}
      {requestedBloodData.bloodGroup && (
        <div className="p-4 bg-gradient-to-r from-red-900/80 via-red-600/30 to-slate-900 border border-red-500/50 rounded-xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h4 className="font-bold text-white text-sm">Emergency Alert Triggered</h4>
              <p className="text-xs text-red-300">
                Searching for <span className="font-black text-white">{requestedBloodData.bloodGroup}</span> donors in {requestedBloodData.zila || requestedBloodData.division || 'Bangladesh'}.
              </p>
            </div>
          </div>
          <span className="badge bg-red-600 text-white font-bold text-xs p-2.5">URGENT</span>
        </div>
      )}

      <div className="card bg-slate-900 shadow-xl border border-red-500/30">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🩸</span> Find Compatible Donor (AI Match)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input 
              type="text" 
              placeholder="Patient Name" 
              className="input input-bordered bg-slate-800 text-white border-slate-700 focus:border-red-500"
              value={requestedBloodData.name}
              onChange={(e) => setRequestedBloodData({ ...requestedBloodData, name: e.target.value })}
            />

            <select 
              value={requestedBloodData.bloodGroup} 
              className="select select-bordered bg-slate-800 text-white border-slate-700 focus:border-red-500"
              onChange={(e) => setRequestedBloodData({ ...requestedBloodData, bloodGroup: e.target.value })}
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              value={requestedBloodData.division} 
              className="select select-bordered bg-slate-800 text-white border-slate-700 focus:border-red-500"
              onChange={(e) => {
                setSelectedDiv(e.target.value);
                setSelectedZila("");
                setRequestedBloodData({ ...requestedBloodData, division: e.target.value, zila: "", thana: "" });
              }}
            >
              <option value="">Select Division</option>
              {Object.keys(bdLocations).map(div => <option key={div} value={div}>{div}</option>)}
            </select>

            <select 
              value={requestedBloodData.zila} 
              className="select select-bordered bg-slate-800 text-white border-slate-700 focus:border-red-500"
              disabled={!selectedDiv}
              onChange={(e) => {
                setSelectedZila(e.target.value);
                setRequestedBloodData({ ...requestedBloodData, zila: e.target.value, thana: "" });
              }}
            >
              <option value="">Select Zila</option>
              {selectedDiv && Object.keys(bdLocations[selectedDiv] || {}).map(z => <option key={z} value={z}>{z}</option>)}
            </select>

            <select 
              value={requestedBloodData.thana} 
              className="select select-bordered bg-slate-800 text-white border-slate-700 focus:border-red-500"
              disabled={!selectedZila}
              onChange={(e) => setRequestedBloodData({ ...requestedBloodData, thana: e.target.value })}
            >
              <option value="">Select Thana</option>
              {selectedZila && (bdLocations[selectedDiv]?.[selectedZila] || []).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Results Area */}
          {requestedBloodData.bloodGroup && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Matched Donors Found ({matchedDonors.length})
                </h3>

                {matchedDonors.length > 0 && (
                  <button 
                    type="button"
                    onClick={handleDownloadPDF} 
                    className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 gap-1 font-bold z-10"
                  >
                    📄 Download PDF Report
                  </button>
                )}
              </div>

              {/* Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedDonors.map((donor) => {
                  const eligibility = checkEligibility(donor.lastDonatedDate);
                  const cleanPhone = donor.phone ? donor.phone.replace(/[^0-9]/g, '') : '';

                  return (
                    <div key={donor.id} className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 flex justify-between flex-col space-y-3 shadow-lg">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                            {donor.name}
                            {donor.isVerified && (
                              <span className="text-blue-400 text-xs font-bold" title="Verified Donor">✓</span>
                            )}
                          </h4>
                          <span className="badge badge-error text-white font-bold">{donor.bloodGroup}</span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                          📍 {donor.area ? `${donor.area}, ` : ''}{donor.thana}, {donor.zila}
                        </p>

                        <div className="mt-2">
                          {eligibility.eligible ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              🟢 Ready to Donate
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              ⏳ Cool-down: {eligibility.daysLeft} days left
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 gap-2">
                        <span className="text-xs font-bold text-amber-400">{donor.score} PTS</span>
                        
                        <div className="flex gap-2">
                          {/* Working WhatsApp Link */}
                          <a 
                            href={`https://api.whatsapp.com/send?phone=88${cleanPhone}&text=${encodeURIComponent(`Emergency! Need ${donor.bloodGroup} blood at ${requestedBloodData.zila || 'your location'}. Are you available?`)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold px-3"
                          >
                            💬 WA
                          </a>

                          {/* Working Direct Call Link */}
                          <a 
                            href={`tel:${cleanPhone}`} 
                            className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none font-bold px-3"
                          >
                            📞 Call
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hidden Template For PDF Export Only */}
              <div id="matched-donors-pdf-content" style={{ display: "none" }} className="p-4 bg-white text-slate-900">
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px", color: "#dc2626" }}>
                  Matched Blood Donors Report ({requestedBloodData.bloodGroup})
                </h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Name</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Blood</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Address</th>
                      <th style={{ padding: "8px", border: "1px solid #ddd" }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedDonors.map(d => (
                      <tr key={d.id}>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.name}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.bloodGroup}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.area ? `${d.area}, ` : ''}{d.thana}, {d.zila}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorFind;