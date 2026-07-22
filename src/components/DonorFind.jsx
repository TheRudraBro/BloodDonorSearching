import React from 'react';

const DonorFind = ({ 
  divisions, 
  bloodGroups, 
  requestedBloodData, 
  setRequestedBloodData, 
  matchedDonors = [] 
}) => {
  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-700">
      <div className="card-body">
        <h2 className="text-3xl font-bold text-white mb-6">
          Find Compatible Donor (AI Match)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Patient / Seeker Name */}
          <input 
            type="text" 
            placeholder="Type patient name..." 
            className="input input-bordered w-full bg-slate-800 text-white border-slate-700 placeholder:text-slate-400" 
            value={requestedBloodData.name}
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, name: e.target.value })}
          />

          {/* Blood Group Select */}
          <select 
            value={requestedBloodData.bloodGroup} 
            className="select select-bordered w-full bg-slate-800 text-white border-slate-700"
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, bloodGroup: e.target.value })}
          >
            <option value="" disabled>Pick required blood group</option>
            {bloodGroups.map((group, index) => (
              <option key={index} value={group}>{group}</option>
            ))}
          </select>

          {/* Division Select */}
          <select 
            value={requestedBloodData.division} 
            className="select select-bordered w-full bg-slate-800 text-white border-slate-700"
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, division: e.target.value })}
          >
            <option value="" disabled>Select target division</option>
            {divisions.map((division, index) => (
              <option key={index} value={division}>{division}</option>
            ))}
          </select>
        </div>

        {/* Matched Donors Result Section */}
        {requestedBloodData.bloodGroup && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Matched Donors ({matchedDonors.length})
            </h3>

            {matchedDonors.length === 0 ? (
              <p className="text-slate-400">No compatible donor found for this group.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedDonors.map((donor) => (
                  <div 
                    key={donor.id} 
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-white">{donor.name}</h4>
                      <p className="text-sm text-slate-400">{donor.bloodGroup} • {donor.division}</p>
                      <p className="text-xs text-slate-500">{donor.phone}</p>
                    </div>
                    
                    {/* Score Badge (100 / 70 PTS) */}
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm border ${
                        donor.score === 100 
                          ? "bg-green-600/20 text-green-400 border-green-500/30" 
                          : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {donor.score} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorFind;