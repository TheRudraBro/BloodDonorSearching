import React, { useState } from 'react';
import jsPDF from 'jspdf';

const DonorList = ({ donors = [], user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const divisions = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur", "Mymensingh"];

  // 🔒 লগইন না থাকলে পুরো ডিরেক্টরি ব্লক
  if (!user) {
    return (
      <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl p-6 sm:p-10 text-center space-y-3 shadow-2xl w-full">
        <span className="text-3xl">🔒</span>
        <h3 className="text-base sm:text-lg font-bold text-white">Login Required</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You must log in with your Google or verified account to browse the registered donor directory and export records.
        </p>
      </div>
    );
  }

  const filteredDonors = donors.filter((donor) => {
    const matchSearch =
      (donor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donor.zila || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donor.thana || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donor.phone || '').includes(searchTerm);

    const matchGroup = selectedGroup === 'ALL' || donor.bloodGroup === selectedGroup;
    const matchDivision = selectedDivision === 'ALL' || donor.division === selectedDivision;

    return matchSearch && matchGroup && matchDivision;
  });

  const formatBangladeshPhone = (phoneStr) => {
    let cleaned = (phoneStr || '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) return '88' + cleaned;
    if (!cleaned.startsWith('880') && cleaned.length === 10) return '880' + cleaned;
    return cleaned;
  };

  const handleExportPDF = () => {
    if (filteredDonors.length === 0) {
      alert("No donor records found to export!");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      doc.setFillColor(13, 19, 34);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text("EMERGENCY BLOOD FINDER BANGLADESH", 105, 12, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Registered Verified Donors Directory", 105, 19, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${dateStr}  |  Total Listed: ${filteredDonors.length} Donors`, 105, 25, { align: 'center' });

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

      filteredDonors.forEach((donor, idx) => {
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

      doc.save(`Blood-Donors-Directory-${dateStr.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search Controls */}
      <div className="bg-gradient-to-br from-[#0d1322] to-[#080d1a] p-4 sm:p-5 rounded-3xl border border-red-950/80 shadow-2xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl shadow-inner">
              📋
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-none">Registered Donor Directory</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Browse and connect with registered lifesavers nationwide</p>
            </div>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/60 w-full md:w-auto justify-center active:scale-95 transition-all"
          >
            <span>📥</span> {isExporting ? 'Exporting PDF...' : `Export Directory PDF (${filteredDonors.length})`}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          <input
            type="text"
            placeholder="Search by name, zila, thana or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white text-xs rounded-2xl focus:border-red-500 shadow-inner"
          />

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white text-xs rounded-2xl font-semibold shadow-inner"
          >
            <option value="ALL">All Blood Groups</option>
            {bloodGroups.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
          </select>

          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white text-xs rounded-2xl font-semibold shadow-inner"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((div) => (<option key={div} value={div}>{div}</option>))}
          </select>
        </div>
      </div>

      {/* Donors Cards Grid */}
      {filteredDonors.length === 0 ? (
        <div className="bg-[#0d1322] p-8 text-center rounded-3xl border border-red-950/80 text-slate-400 text-xs font-medium">
          No registered donors found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDonors.map((donor, idx) => {
            const cleanPhone = (donor.phone || '').replace(/[^0-9+]/g, '');
            const waNumber = formatBangladeshPhone(donor.phone);
            const waMsg = `Hello ${donor.name || 'Brother/Sister'}, I got your contact from Emergency Blood Finder. We have an urgent blood requirement for ${donor.bloodGroup} blood. Are you currently available to donate?`;

            const donorImg = donor.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(donor.name || 'Donor')}&backgroundColor=b91c1c`;
            const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.name || 'Donor')}&background=dc2626&color=ffffff&bold=true`;

            return (
              <div
                key={donor.id || idx}
                className="relative overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#090e1c] border border-red-950/90 hover:border-red-500/50 p-4 rounded-3xl shadow-xl space-y-3.5 transition-all group flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-600/10 transition-all"></div>

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
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

                  <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                    ● Available
                  </span>
                </div>

                <div className="bg-[#060a14]/90 px-3 py-2 rounded-2xl border border-slate-800/80 text-[11px] flex justify-between items-center relative z-10">
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <strong className="text-red-400 font-mono text-xs tracking-wider">{donor.phone || 'Hidden'}</strong>
                </div>

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
  );
};

export default DonorList;