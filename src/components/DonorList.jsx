import React, { useState } from "react";

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

const DonorList = ({ donors }) => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [division, setDivision] = useState("");
  const [availability, setAvailability] = useState("");
  const [search, setSearch] = useState("");

  const filteredDonors = donors.filter((donor) => {
    const matchSearch =
      (donor.name && donor.name.toLowerCase().includes(search.toLowerCase())) ||
      (donor.id && donor.id.toLowerCase().includes(search.toLowerCase())) ||
      (donor.area && donor.area.toLowerCase().includes(search.toLowerCase())) ||
      (donor.zila && donor.zila.toLowerCase().includes(search.toLowerCase())) ||
      (donor.thana && donor.thana.toLowerCase().includes(search.toLowerCase())) ||
      (donor.phone && donor.phone.includes(search));

    const matchBlood = bloodGroup === "" || donor.bloodGroup === bloodGroup;
    const matchDivision = division === "" || donor.division === division;
    const matchAvailability =
      availability === "" ? true : donor.available === (availability === "true");

    return matchSearch && matchBlood && matchDivision && matchAvailability;
  });

  // Export Table to PDF
  const handleExportPDF = () => {
    const element = document.getElementById("donor-directory-table");
    if (!element) return;

    const opt = {
      margin:       0.3,
      filename:     `Active_Donor_Directory.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-800">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📋</span> Active Donor Directory
            </h2>
            <span className="text-xs text-slate-400">Total Donors Found: {filteredDonors.length}</span>
          </div>

          <button 
            onClick={handleExportPDF} 
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none gap-1 font-bold"
          >
            📄 Export Directory PDF
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Name / Area / Thana / Phone"
            className="input input-bordered bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm focus:border-red-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select select-bordered bg-slate-800 border-slate-700 text-white text-sm focus:border-red-500"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>

          <select
            className="select select-bordered bg-slate-800 border-slate-700 text-white text-sm focus:border-red-500"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option value="">All Divisions</option>
            <option>Dhaka</option>
            <option>Chattogram</option>
            <option>Khulna</option>
            <option>Rajshahi</option>
            <option>Barishal</option>
            <option>Rangpur</option>
            <option>Sylhet</option>
            <option>Mymensingh</option>
          </select>

          <select
            className="select select-bordered bg-slate-800 border-slate-700 text-white text-sm focus:border-red-500"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">All Availability</option>
            <option value="true">Available Now</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        {/* Directory Table (PDF Element) */}
        <div id="donor-directory-table" className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-2">
          <table className="table w-full text-white">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th>#</th>
                <th>Donor Info</th>
                <th>Group</th>
                <th>Address</th>
                <th>Eligibility</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor, index) => {
                const eligibility = checkEligibility(donor.lastDonatedDate);

                return (
                  <tr
                    key={donor.id || index}
                    className={`${
                      index % 2 === 0 ? "bg-slate-900" : "bg-slate-800/40"
                    } hover:bg-slate-800 transition border-b border-slate-800/50`}
                  >
                    <td className="text-slate-500 font-mono text-xs">{index + 1}</td>
                    <td>
                      <h3 className="font-semibold text-white text-sm flex items-center gap-1">
                        {donor.name}
                        {donor.isVerified && (
                          <span className="text-blue-400 text-xs font-bold" title="Verified">✓</span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">{donor.id}</p>
                    </td>
                    <td>
                      <span className="font-extrabold text-red-500 bg-red-500/10 px-2.5 py-1 rounded text-xs border border-red-500/20">
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="text-xs text-slate-300">
                      {donor.area ? `${donor.area}, ` : ''}
                      {donor.thana ? `${donor.thana}, ` : ''}
                      {donor.zila ? donor.zila : donor.division}
                    </td>
                    <td>
                      {eligibility.eligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ready to Donate
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Cool-down ({eligibility.daysLeft}d)
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-slate-300 font-mono">{donor.phone}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorList;