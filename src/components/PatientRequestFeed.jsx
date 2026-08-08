import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { bdLocations } from '../data/bdLocations';

const PatientRequestFeed = ({ bloodGroups, requests, setRequests }) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedZila, setSelectedZila] = useState("");
  const [showForm, setShowForm] = useState(false);

  const onSubmit = (data) => {
    const newRequest = {
      ...data,
      id: `REQ-${1000 + requests.length + 1}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Emergency"
    };

    setRequests([newRequest, ...requests]);
    reset();
    setShowForm(false);
    alert("🚨 Emergency Blood Request Posted Successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="card bg-slate-900 border border-slate-800 shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🚨 Emergency Patient Requests ({requests.length})
          </h2>
          <p className="text-xs text-slate-400">Live feed for patients searching for urgent blood donors</p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn bg-red-600 hover:bg-red-700 text-white border-none font-bold w-full sm:w-auto"
        >
          {showForm ? "✕ Close Form" : "➕ Post Emergency Request"}
        </button>
      </div>

      {/* Emergency Request Form Modal/Card */}
      {showForm && (
        <div className="card bg-slate-900 shadow-2xl border border-red-500/40 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Create Emergency Blood Request</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-slate-300 text-xs font-semibold">Patient / Seeker Name *</label>
              <input 
                type="text" 
                {...register("patientName", { required: true })} 
                placeholder="e.g. Tanvir Ahmed" 
                className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
              />
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Required Blood Group *</label>
              <select 
                defaultValue="" 
                className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
                {...register("bloodGroup", { required: true })}
              >
                <option value="" disabled>Select Blood Group</option>
                {bloodGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Bags Needed *</label>
              <input 
                type="number" 
                defaultValue={1}
                {...register("bags", { required: true })} 
                className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
              />
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Hospital / Location *</label>
              <input 
                type="text" 
                {...register("hospital", { required: true })} 
                placeholder="e.g. Dhaka Medical College Hospital" 
                className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
              />
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Division *</label>
              <select 
                value={selectedDiv}
                className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
                {...register("division", { required: true })}
                onChange={(e) => {
                  setSelectedDiv(e.target.value);
                  setSelectedZila("");
                  setValue("division", e.target.value);
                }}
              >
                <option value="" disabled>Select Division</option>
                {Object.keys(bdLocations || {}).map(div => <option key={div} value={div}>{div}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Zila (District) *</label>
              <select 
                value={selectedZila}
                className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
                disabled={!selectedDiv}
                {...register("zila", { required: true })}
                onChange={(e) => {
                  setSelectedZila(e.target.value);
                  setValue("zila", e.target.value);
                }}
              >
                <option value="" disabled>Select Zila</option>
                {selectedDiv && Object.keys(bdLocations[selectedDiv] || {}).map(zila => <option key={zila} value={zila}>{zila}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Contact Number *</label>
              <input 
                type="text" 
                {...register("phone", { required: true })} 
                placeholder="e.g. 01700000000" 
                className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
              />
            </div>

            <div>
              <label className="label text-slate-300 text-xs font-semibold">Required Date & Time</label>
              <input 
                type="text" 
                {...register("neededTime")} 
                placeholder="e.g. Today before 6:00 PM" 
                className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <button type="submit" className="btn bg-red-600 hover:bg-red-700 text-white border-none w-full font-bold">
                Broadcast Emergency Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => (
          <div key={req.id} className="card bg-slate-900 border border-slate-800 shadow-xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-lg">
              {req.status}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-extrabold text-2xl text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/30">
                  {req.bloodGroup}
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">{req.patientName}</h3>
                  <p className="text-[11px] text-slate-400">Needed: {req.bags} Bag(s) • Posted at {req.createdAt}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 mt-3 bg-slate-800/60 p-3 rounded-lg">
                <p>🏥 <strong>Hospital:</strong> {req.hospital}</p>
                <p>📍 <strong>Location:</strong> {req.zila}, {req.division}</p>
                {req.neededTime && <p>⏰ <strong>Deadline:</strong> {req.neededTime}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <a 
                href={`tel:${req.phone}`} 
                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none flex-1 font-bold"
              >
                📞 Call ({req.phone})
              </a>
              <a 
                href={`https://wa.me/88${req.phone}?text=${encodeURIComponent(`Hi, I saw your emergency request for ${req.bloodGroup} blood at ${req.hospital}. I want to help.`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold"
              >
                💬 WA
              </a>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full bg-slate-900 p-8 rounded-xl text-center border border-slate-800 text-slate-400">
            No active emergency blood requests right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRequestFeed;