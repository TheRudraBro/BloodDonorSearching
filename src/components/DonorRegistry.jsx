// DonorRegistry.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { bdLocations } from '../data/bdLocations';

const DonorRegistry = ({ bloodGroups, donors, setDonors }) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedZila, setSelectedZila] = useState("");
  const [coords, setCoords] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoords(loc);
          alert("Location captured successfully!");
        },
        () => alert("Failed to fetch location. Please allow GPS access.")
      );
    }
  };

  const onSubmit = (data) => {
    const newDonor = {
      ...data,
      id: `DN-${1000 + donors.length + 1}`,
      lat: coords?.lat || 23.8103, // Default Dhaka coordinates if GPS not used
      lng: coords?.lng || 90.4125,
      available: true
    };

    setDonors([newDonor, ...donors]);
    reset();
    setCoords(null);
  };

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-800">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📝</span> Register as a Blood Donor
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            {...register("name", { required: true })} 
            placeholder="Full Name" 
            className="input input-bordered bg-slate-800 text-white border-slate-700" 
          />

          <select 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            {...register("bloodGroup", { required: true })}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Division */}
          <select 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            {...register("division", { required: true })}
            onChange={(e) => {
              setSelectedDiv(e.target.value);
              setSelectedZila("");
              setValue("division", e.target.value);
            }}
          >
            <option value="">Select Division</option>
            {Object.keys(bdLocations).map(div => <option key={div} value={div}>{div}</option>)}
          </select>

          {/* Zila */}
          <select 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            disabled={!selectedDiv}
            {...register("zila", { required: true })}
            onChange={(e) => {
              setSelectedZila(e.target.value);
              setValue("zila", e.target.value);
            }}
          >
            <option value="">Select Zila</option>
            {selectedDiv && Object.keys(bdLocations[selectedDiv] || {}).map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          {/* Thana */}
          <select 
            className="select select-bordered bg-slate-800 text-white border-slate-700"
            disabled={!selectedZila}
            {...register("thana", { required: true })}
          >
            <option value="">Select Thana</option>
            {selectedZila && (bdLocations[selectedDiv]?.[selectedZila] || []).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input 
            type="text" 
            {...register("phone", { required: true })} 
            placeholder="Contact Phone Number" 
            className="input input-bordered bg-slate-800 text-white border-slate-700" 
          />

          <div className="col-span-1 md:col-span-2 flex gap-4">
            <button 
              type="button" 
              onClick={handleGetLocation} 
              className={`btn border-none text-white ${coords ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              📍 {coords ? 'GPS Location Saved' : 'Set Current Location'}
            </button>

            <button type="submit" className="btn bg-red-600 hover:bg-red-700 text-white border-none flex-1 font-bold">
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistry;