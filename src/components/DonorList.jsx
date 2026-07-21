import React, { useEffect, useState } from "react";

const DonorList = () => {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    async function loadDonors() {
      try {
        const res = await fetch("/data.json");
        const data = await res.json();
        setDonors(data);
      } catch (error) {
        console.error("Error loading donors:", error);
      }
    }

    loadDonors();
  }, []);

  return (
    <div className="card bg-slate-900 shadow-lg">
      <div className="card-body">
        <h2 className="text-3xl font-bold text-white mb-4">
          Donors List
        </h2>

        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="table w-full">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Division</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {donors.map((donor, index) => (
                <tr
                  key={donor.id}
                  className="text-white border-b border-slate-700 hover:bg-slate-800"
                >
                  <th>{index + 1}</th>
                  <td>{donor.name}</td>
                  <td>{donor.bloodGroup}</td>
                  <td>{donor.division}</td>
                  <td>{donor.phone}</td>
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