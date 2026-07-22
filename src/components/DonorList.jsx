import React, { useState } from "react";

const DonorList = ({ donors }) => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [division, setDivision] = useState("");
  const [availability, setAvailability] = useState("");
  const [search, setSearch] = useState("");

  const filteredDonors = donors.filter((donor) => {
    const matchSearch =
      (donor.name && donor.name.toLowerCase().includes(search.toLowerCase())) ||
      (donor.id && donor.id.toLowerCase().includes(search.toLowerCase())) ||
      (donor.phone && donor.phone.includes(search));

    const matchBlood =
      bloodGroup === "" || donor.bloodGroup === bloodGroup;

    const matchDivision =
      division === "" || donor.division === division;

    const matchAvailability =
      availability === ""
        ? true
        : donor.available === (availability === "true");

    return (
      matchSearch &&
      matchBlood &&
      matchDivision &&
      matchAvailability
    );
  });

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-700">
      <div className="card-body">
        <h2 className="text-3xl font-bold text-white mb-6">
          Blood Donor List
        </h2>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search Name / ID / Phone"
            className="input input-bordered bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select select-bordered bg-slate-800 border-slate-700 text-white"
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
            className="select select-bordered bg-slate-800 border-slate-700 text-white"
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
            className="select select-bordered bg-slate-800 border-slate-700 text-white"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <h2 className="text-white font-bold text-lg mb-4">
          {filteredDonors.length} Donors Found
        </h2>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="table w-full text-white">
            <thead className="bg-black text-white">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Division</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor, index) => (
                <tr
                  key={donor.id || index}
                  className={`${
                    index % 2 === 0 ? "bg-slate-900" : "bg-slate-800"
                  } hover:bg-slate-700 transition`}
                >
                  <td className="text-white">{index + 1}</td>
                  <td>
                    <h2 className="font-semibold text-white">{donor.name}</h2>
                    <p className="text-xs text-slate-400">{donor.id}</p>
                  </td>
                  <td>
                    <span className="font-bold text-red-400">
                      {donor.bloodGroup}
                    </span>
                  </td>
                  <td>{donor.division}</td>
                  <td>{donor.phone}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-sm text-white font-medium ${
                        donor.available ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {donor.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredDonors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-white">
                    No donor found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorList;