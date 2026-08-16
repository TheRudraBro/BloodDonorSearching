import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { bangladeshGeoData } from '../data/bangladeshGeoData';

const DonorFind = ({ bloodGroups, requestedBloodData, setRequestedBloodData, matchedDonors = [] }) => {
  const [isExporting, setIsExporting] = useState(false);
  const divisionList = Object.keys(bangladeshGeoData || {});

  const availableDistricts = requestedBloodData.division
    ? bangladeshGeoData[requestedBloodData.division]?.districts || {}
    : {};
  const districtList = Object.keys(availableDistricts);

  const availableThanas = requestedBloodData.division && requestedBloodData.zila
    ? availableDistricts[requestedBloodData.zila]?.thanas || []
    : [];

  const handleDivisionChange = (e) => {
    const div = e.target.value;
    setRequestedBloodData({
      ...requestedBloodData,
      division: div,
      zila: '',
      thana: ''
    });
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setRequestedBloodData({
      ...requestedBloodData,
      zila: dist,
      thana: ''
    });
  };

  const formatBangladeshPhone = (phoneStr) => {
    let cleaned = (phoneStr || '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return '88' + cleaned;
    if (!cleaned.startsWith('880') && cleaned.length === 10) return '880' + cleaned;
    return cleaned;
  };

  // 📥 PDF Export Function
  const handleExportSearchPDF = () => {
    if (matchedDonors.length === 0) {
      alert("No matched donors found to export!");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      doc.setFillColor(13, 19, 34);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("EMERGENCY BLOOD FINDER BANGLADESH", 105, 12, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      const searchCriteria = `Search Query: Blood [${requestedBloodData.bloodGroup || 'All'}] | Division [${requestedBloodData.division || 'All'}] | District [${requestedBloodData.zila || 'All'}]`;
      doc.text(searchCriteria, 105, 19, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${dateStr}  |  Total Matched: ${matchedDonors.length} Donors`, 105, 26, { align: 'center' });

      let startY = 38;
      doc.setFillColor(220, 38, 38);
      doc.rect(10, startY, 190, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("#", 14, startY + 5.5);
      doc.text("Donor Name", 24, startY + 5.5);
      doc.text("Blood", 80, startY + 5.5);
      doc.text("Location (District / Area)", 105, startY + 5.5);
      doc.text("Contact Phone", 165, startY + 5.5);

      startY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      matchedDonors.forEach((donor, idx) => {
        if (startY > 275) {
          doc.addPage();
          startY = 20;
          doc.setFillColor(220, 38, 38);
          doc.rect(10, startY, 190, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text("#", 14, startY + 5.5);
          doc.text("Donor Name", 24, startY + 5.5);
          doc.text("Blood", 80, startY + 5.5);
          doc.text("Location (District / Area)", 105, startY + 5.5);
          doc.text("Contact Phone", 165, startY + 5.5);
          startY += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
        }

        if (idx % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(10, startY, 190, 7.5, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.rect(10, startY, 190, 7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(String(idx + 1), 14, startY + 5);
        doc.text((donor.name || 'Anonymous').substring(0, 24), 24, startY + 5);

        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text(donor.bloodGroup || 'N/A', 83, startY + 5);

        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        const loc = `${donor.zila || ''}${donor.thana ? ', ' + donor.thana : ''}`;
        doc.text(loc.substring(0, 30), 105, startY + 5);

        doc.setFont('helvetica', 'bold');
        doc.text(donor.phone || 'N/A', 165, startY + 5);
        doc.setFont('helvetica', 'normal');

        startY += 7.5;
      });

      doc.save(`Matched-Donors-${requestedBloodData.bloodGroup || 'All'}-${dateStr.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔍 Search Control Box */}
      <div className="bg-gradient-to-br from-[#0d1322] to-[#080d1a] border border-red-950/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl shadow-inner">
              🔍
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide">Exact Donor Search Engine</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Locate compatible donors based on division, district, and thana</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="bg-red-950/90 text-red-400 border border-red-500/40 px-3 py-1 rounded-xl text-xs font-bold font-mono">
              {matchedDonors.length} Matched
            </span>

            {matchedDonors.length > 0 && (
              <button
                type="button"
                onClick={handleExportSearchPDF}
                disabled={isExporting}
                className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/60 active:scale-95 transition-all"
              >
                <span>📥</span> {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1.5">Blood Group</label>
            <select
              value={requestedBloodData.bloodGroup}
              onChange={(e) => setRequestedBloodData({ ...requestedBloodData, bloodGroup: e.target.value })}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-2xl text-xs font-semibold focus:border-red-500 shadow-inner"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(bg => (<option key={bg} value={bg}>{bg}</option>))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1.5">Division</label>
            <select
              value={requestedBloodData.division}
              onChange={handleDivisionChange}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-2xl text-xs font-semibold focus:border-red-500 shadow-inner"
            >
              <option value="">All Divisions</option>
              {divisionList.map(div => (<option key={div} value={div}>{div}</option>))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1.5">District</label>
            <select
              value={requestedBloodData.zila}
              onChange={handleDistrictChange}
              disabled={!requestedBloodData.division}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-2xl text-xs font-semibold focus:border-red-500 disabled:opacity-40 shadow-inner"
            >
              <option value="">All Districts</option>
              {districtList.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1.5">Thana / Police Station</label>
            <select
              value={requestedBloodData.thana}
              onChange={(e) => setRequestedBloodData({ ...requestedBloodData, thana: e.target.value })}
              disabled={!requestedBloodData.zila}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-2xl text-xs font-semibold focus:border-red-500 disabled:opacity-40 shadow-inner"
            >
              <option value="">All Thanas</option>
              {availableThanas.map(th => (<option key={th} value={th}>{th}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* 🎴 PREMIUM MATCHED DONOR CARDS */}
      {requestedBloodData.bloodGroup && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="text-red-500 text-base">🩸</span> Compatible Donors for{' '}
              <span className="bg-red-600/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-lg font-black">
                {requestedBloodData.bloodGroup}
              </span>
            </h4>
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">Location-based ranking</span>
          </div>

          {matchedDonors.length === 0 ? (
            <div className="bg-[#0d1322] p-8 text-center rounded-3xl border border-red-950/80 text-slate-400 text-xs font-medium">
              No matching donors found for this criteria in the selected area.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {matchedDonors.map((donor, idx) => {
                const cleanPhone = (donor.phone || '').replace(/[^0-9+]/g, '');
                const waNumber = formatBangladeshPhone(donor.phone);
                const waMsg = `Hello ${donor.name || 'Brother/Sister'}, I saw your profile on Emergency Blood Finder. We urgently need ${donor.bloodGroup} blood at ${requestedBloodData.zila || 'our area'}. Are you available to donate?`;

                // 🌟 Clean High-Res Google Photo or Premium Avatar 🌟
                const donorImg = donor.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(donor.name || 'Donor')}&backgroundColor=b91c1c`;
                const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.name || 'Donor')}&background=dc2626&color=ffffff&bold=true`;

                return (
                  <div
                    key={donor.id || idx}
                    className="relative overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#090e1c] border border-red-950/90 hover:border-red-500/50 p-4 rounded-3xl shadow-xl space-y-3.5 transition-all group flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-600/10 transition-all"></div>

                    {/* Donor Header */}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        
                        {/* 🌟 Profile Photo with Blood Badge below 🌟 */}
                        <div className="flex flex-col items-center shrink-0">
                          <img
                            src={donorImg}
                            alt={donor.name || 'Donor'}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = fallbackImg;
                            }}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 object-cover ring-2 ring-red-500/70 p-0.5 shadow-lg shadow-red-950/50"
                          />
                          <span className="mt-1.5 px-2.5 py-0.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-[10px] rounded-md tracking-wider shadow-sm leading-none">
                            {donor.bloodGroup}
                          </span>
                        </div>

                        {/* Text Info */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-red-400 transition-colors">
                            {donor.name || 'Anonymous Donor'}
                          </h4>
                          <p className="text-[11px] text-slate-300 font-medium truncate mt-1 flex items-center gap-1">
                            <span className="text-red-500">📍</span> {donor.thana ? `${donor.thana}, ` : ''}{donor.zila}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                            {donor.division} Division
                          </p>
                        </div>
                      </div>

                      {/* Match Score */}
                      {donor.score && (
                        <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                          {donor.score}% Match
                        </span>
                      )}
                    </div>

                    {/* Phone Bar */}
                    <div className="bg-[#060a14]/90 px-3 py-2 rounded-2xl border border-slate-800/80 text-[11px] flex justify-between items-center relative z-10">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <strong className="text-red-400 font-mono text-xs tracking-wider">{donor.phone || 'Hidden'}</strong>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5 relative z-10">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none rounded-xl text-xs h-8 min-h-0 flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-red-950/50 transition-all font-bold"
                      >
                        <span>📞</span> Call
                      </a>

                      <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-none rounded-xl text-xs h-8 min-h-0 flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-950/50 transition-all font-bold"
                      >
                        <span>💬</span> WA
                      </a>

                      <a
                        href={`sms:${cleanPhone}?body=${encodeURIComponent(waMsg)}`}
                        className="btn btn-sm bg-[#080d1a] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs h-8 min-h-0 flex items-center justify-center gap-1 active:scale-95 transition-all font-bold"
                      >
                        <span>✉️</span> SMS
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonorFind;