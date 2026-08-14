import React, { useState } from 'react';
import jsPDF from 'jspdf';

const DonorList = ({ donors = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const divisions = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur", "Mymensingh"];

  // ফিল্টারিং লজিক
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

  // 🌟 Pure jsPDF দিয়ে ক্লিন টেবিল এক্সপোর্ট (কোনো থার্ড-পার্টি প্লাগিন লাগবে না) 🌟
  const handleExportPDF = () => {
    if (filteredDonors.length === 0) {
      alert("No donor records found to export!");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      // ১. হেডার ব্যানার
      doc.setFillColor(13, 19, 34); // Midnight Blue
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(239, 68, 68); // Red
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text("EMERGENCY BLOOD FINDER BANGLADESH", 105, 12, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Registered Verified Donors Directory", 105, 19, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${dateStr}  |  Total Listed: ${filteredDonors.length} Donors`, 105, 25, { align: 'center' });

      // ২. টেবিল হেডার
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

      // ৩. রো ডাটা রেন্ডারিং
      startY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      filteredDonors.forEach((donor, idx) => {
        // পেজ ব্রেক হ্যান্ডলিং (যদি ৩০টির বেশি এন্ট্রি থাকে)
        if (startY > 275) {
          doc.addPage();
          startY = 20;

          // নতুন পেজের হেডার
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

        // অল্টারনেট ব্যাকগ্রাউন্ড
        if (idx % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(10, startY, 190, 7.5, 'F');
        }

        // বর্ডার লাইন
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.1);
        doc.rect(10, startY, 190, 7.5);

        // টেক্সট ড্র
        doc.setTextColor(51, 65, 85);
        doc.text(String(idx + 1), 14, startY + 5);
        doc.text((donor.name || 'Anonymous').substring(0, 24), 24, startY + 5);

        // Blood Group (Red & Bold)
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

      // ফাইল ডাউনলোড
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
      {/* 🔍 Top Search, Filter & Export Controls */}
      <div className="bg-[#0d1322] p-3.5 sm:p-4 rounded-2xl border border-red-950/80 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <span className="text-red-500 text-xl">📋</span>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Registered Donor Directory</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Browse or export contact list of verified lifesavers</p>
            </div>
          </div>

          {/* 🌟 Export PDF Button 🌟 */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn btn-xs sm:btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/60 w-full md:w-auto justify-center active:scale-95 transition-all"
          >
            <span>📥</span> {isExporting ? 'Exporting PDF...' : `Export Directory PDF (${filteredDonors.length})`}
          </button>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
          <input
            type="text"
            placeholder="Search by name, zila, thana or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm bg-[#080d1a] border-slate-700 text-white text-xs rounded-xl focus:border-red-500"
          />

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="select select-sm bg-[#080d1a] border-slate-700 text-white text-xs rounded-xl"
          >
            <option value="ALL">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="select select-sm bg-[#080d1a] border-slate-700 text-white text-xs rounded-xl"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((div) => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🎴 Donors Cards Grid */}
      {filteredDonors.length === 0 ? (
        <div className="bg-[#0d1322] p-8 text-center rounded-2xl border border-red-950/80 text-slate-400 text-xs font-medium">
          No registered donors found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDonors.map((donor, idx) => {
            const cleanPhone = (donor.phone || '').replace(/[^0-9+]/g, '');
            const waNumber = formatBangladeshPhone(donor.phone);
            const waMsg = `Hello ${donor.name || 'Brother/Sister'}, I got your contact from Emergency Blood Finder. We have an urgent blood requirement for ${donor.bloodGroup} blood. Are you currently available to donate?`;

            return (
              <div
                key={donor.id || idx}
                className="bg-[#0d1322] border border-red-950/80 hover:border-red-500/50 p-3.5 rounded-2xl shadow-lg space-y-2.5 transition-all flex flex-col justify-between"
              >
                {/* Donor Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 border border-red-400/50 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md">
                      {donor.bloodGroup}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                        {donor.name || 'Anonymous Donor'}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        📍 {donor.division}, {donor.zila}
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    ● Available
                  </span>
                </div>

                {/* Info Details */}
                <div className="bg-[#080d1a] px-2.5 py-2 rounded-xl border border-slate-800/80 text-[10px] space-y-1 text-slate-300">
                  <p className="truncate">
                    <span className="text-slate-500">📌 Thana / Area:</span> <strong className="text-slate-200">{donor.thana || 'N/A'}</strong>
                  </p>
                  <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-slate-800/60">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-red-400 font-mono font-bold">{donor.phone || 'Hidden'}</span>
                  </div>
                </div>

                {/* 🌟 ACTION BUTTONS 🌟 */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {/* Call */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none rounded-lg text-[10px] h-7 min-h-0 flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                  >
                    <span>📞</span> Call
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs bg-emerald-600/90 hover:bg-emerald-600 text-white border-none rounded-lg text-[10px] h-7 min-h-0 flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                  >
                    <span>💬</span> WA
                  </a>

                  {/* SMS */}
                  <a
                    href={`sms:${cleanPhone}?body=${encodeURIComponent(waMsg)}`}
                    className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] h-7 min-h-0 flex items-center justify-center gap-1 active:scale-95"
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