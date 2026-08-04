// DonorList.jsx
import React, { useState } from "react";

const DonorList = ({ donors }) => {
  const [search, setSearch] = useState("");

  const filteredDonors = donors.filter((donor) => {
    return (
      (donor.name && donor.name.toLowerCase().includes(search.toLowerCase())) ||
      (donor.zila && donor.zila.toLowerCase().includes(search.toLowerCase())) ||
      (donor.thana && donor.thana.toLowerCase().includes(search.toLowerCase())) ||
      (donor.phone && donor.phone.includes(search))
    );
  });

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-800">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-white mb-4">📋 All Registered Donors</h2>

        <input
          type="text"
          placeholder="🔍 Search by Name, Zila, Thana, Phone..."
          className="input input-bordered bg-slate-800 border-slate-700 text-white mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="table w-full text-white">
            <thead className="bg-slate-950 text-slate-400 text-xs">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Group</th>
                <th>Address (Division, Zila, Thana)</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor, index) => (
                <tr key={donor.id || index} className="bg-slate-900 border-b border-slate-800">
                  <td className="text-xs text-slate-500">{index + 1}</td>
                  <td className="font-semibold text-sm">{donor.name}</td>
                  <td><span className="font-bold text-red-500">{donor.bloodGroup}</span></td>
                  <td className="text-xs text-slate-300">{donor.division}, {donor.zila || 'N/A'}, {donor.thana || 'N/A'}</td>
                  <td className="text-xs font-mono">{donor.phone}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${donor.available ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {donor.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorList;