// DonorFind.jsx
import React, { useState } from 'react';
import { bdLocations } from '../data/bdLocations';

const DonorFind = ({ 
  bloodGroups, 
  requestedBloodData, 
  setRequestedBloodData, 
  matchedDonors = [] 
}) => {
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedZila, setSelectedZila] = useState("");

  const handleFetchGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setRequestedBloodData({
          ...requestedBloodData,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        alert("Your location pinpointed for 5 KM search!");
      });
    }
  };

  return (
    <div className="card bg-slate-900 shadow-xl border border-red-500/30">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-white mb-4">📍 Find Nearby Donors (5 KM Radius)</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input 
            type="text" 
            placeholder="Patient Name" 
            className="input input-bordered bg-slate-800 text-white border-slate-700"
            value={requestedBloodData.name}
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, name: e.target.value })}
          />

          <select 
            value={requestedBloodData.bloodGroup} 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, bloodGroup: e.target.value })}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Division */}
          <select 
            value={requestedBloodData.division} 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            onChange={(e) => {
              setSelectedDiv(e.target.value);
              setSelectedZila("");
              setRequestedBloodData({ ...requestedBloodData, division: e.target.value, zila: "", thana: "" });
            }}
          >
            <option value="">Select Division</option>
            {Object.keys(bdLocations).map(div => <option key={div} value={div}>{div}</option>)}
          </select>

          {/* Zila */}
          <select 
            value={requestedBloodData.zila} 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            disabled={!selectedDiv}
            onChange={(e) => {
              setSelectedZila(e.target.value);
              setRequestedBloodData({ ...requestedBloodData, zila: e.target.value, thana: "" });
            }}
          >
            <option value="">Select Zila</option>
            {selectedDiv && Object.keys(bdLocations[selectedDiv] || {}).map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          {/* Thana */}
          <select 
            value={requestedBloodData.thana} 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            disabled={!selectedZila}
            onChange={(e) => setRequestedBloodData({ ...requestedBloodData, thana: e.target.value })}
          >
            <option value="">Select Thana</option>
            {selectedZila && (bdLocations[selectedDiv]?.[selectedZila] || []).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button 
            onClick={handleFetchGPS}
            className={`btn border-none text-white ${requestedBloodData.lat ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
            🧭 {requestedBloodData.lat ? 'GPS Active (5 KM)' : 'Enable 5 KM Radius'}
          </button>
        </div>

        {/* Results */}
        {requestedBloodData.bloodGroup && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Matched Donors Found ({matchedDonors.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedDonors.map((donor) => (
                <div key={donor.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between flex-col space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <h4 className="font-bold text-white">{donor.name}</h4>
                      <span className="badge badge-error text-white font-bold">{donor.bloodGroup}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {donor.thana}, {donor.zila}, {donor.division}
                    </p>
                    {donor.distance !== null && (
                      <p className="text-xs text-emerald-400 font-bold mt-1">
                        📏 ~{donor.distance} KM away
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-xs font-bold text-amber-400">{donor.score} PTS Match</span>
                    <a href={`tel:${donor.phone}`} className="btn btn-xs bg-red-600 text-white border-none">
                      📞 Call {donor.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorFind;