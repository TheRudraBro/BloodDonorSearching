import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { bdLocations } from '../data/bdLocations';

const DonorRegistry = ({ bloodGroups, donors, setDonors }) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedZila, setSelectedZila] = useState("");
  const [coords, setCoords] = useState(null);

  // GPS Coordinates Fetch
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoords(loc);
          alert("📍 Current location captured successfully!");
        },
        () => alert("⚠️ Failed to fetch location. Please allow GPS access.")
      );
    } else {
      alert("⚠️ Geolocation is not supported by your browser.");
    }
  };

  const onSubmit = (data) => {
    const newDonor = {
      ...data,
      id: `DN-${1000 + donors.length + 1}`,
      // GPS ইউজ না করলে ডিফল্ট ঢাকা সেন্টার কোঅর্ডিনেট সেট হবে
      lat: coords?.lat || 23.8103, 
      lng: coords?.lng || 90.4125,
      available: true
    };

    setDonors([newDonor, ...donors]);
    reset();
    setSelectedDiv("");
    setSelectedZila("");
    setCoords(null);
  };

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-800">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📝</span> Register as a Blood Donor
        </h2>
        <p className="text-slate-400 text-xs mb-6">Your registration can help save lives in emergency situations.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="label text-slate-300 text-xs font-semibold">Full Name *</label>
            <input 
              type="text" 
              {...register("name", { required: true })} 
              placeholder="e.g. Rahim Ahmed" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="label text-slate-300 text-xs font-semibold">Blood Group *</label>
            <select 
              defaultValue="" 
              className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
              {...register("bloodGroup", { required: true })}
            >
              <option value="" disabled>Select Blood Group</option>
              {bloodGroups.map((group, index) => (
                <option key={index} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Division */}
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
              {Object.keys(bdLocations || {}).map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          {/* Zila */}
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
              {selectedDiv && Object.keys(bdLocations[selectedDiv] || {}).map((zila) => (
                <option key={zila} value={zila}>{zila}</option>
              ))}
            </select>
          </div>

          {/* Thana */}
          <div>
            <label className="label text-slate-300 text-xs font-semibold">Thana / Upazila *</label>
            <select 
              defaultValue="" 
              className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
              disabled={!selectedZila}
              {...register("thana", { required: true })}
            >
              <option value="" disabled>Select Thana</option>
              {selectedZila && (bdLocations[selectedDiv]?.[selectedZila] || []).map((thana) => (
                <option key={thana} value={thana}>{thana}</option>
              ))}
            </select>
          </div>

          {/* Specific Area / Road */}
          <div>
            <label className="label text-slate-300 text-xs font-semibold">Specific Area / Road</label>
            <input 
              type="text" 
              {...register("area")} 
              placeholder="e.g. Mirpur 10, Block C, Road 4" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
            />
          </div>

          {/* Contact Phone Number */}
          <div className="col-span-1 md:col-span-2">
            <label className="label text-slate-300 text-xs font-semibold">Contact Phone Number *</label>
            <input 
              type="text" 
              {...register("phone", { required: true })} 
              placeholder="e.g. 01712345678" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
            <button 
              type="button" 
              onClick={handleGetLocation} 
              className={`btn border-none text-white ${coords ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              📍 {coords ? 'GPS Location Pinpoint' : 'Capture Current Location'}
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