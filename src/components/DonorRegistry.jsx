import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { bdLocations } from '../data/bdLocations';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      icon={redIcon}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

const DonorRegistry = ({ bloodGroups, donors, setDonors }) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedZila, setSelectedZila] = useState("");
  const [loading, setLoading] = useState(false);
  const [markerPos, setMarkerPos] = useState([23.8103, 90.4125]);

  const handleSmartGeocode = async (thana, zila, rawArea) => {
    if (!thana || !zila) return;

    try {
      let cleanArea = rawArea ? rawArea.replace(/(house|road|no|number|রোড|বাসা|নম্বর|\d+)/gi, '').replace(/,/g, ' ').trim() : '';
      let searchQuery = `${cleanArea ? cleanArea + ', ' : ''}${thana}, ${zila}, Bangladesh`;
      
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      let geoData = await res.json();

      if (!geoData || geoData.length === 0) {
        searchQuery = `${thana}, ${zila}, Bangladesh`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        geoData = await res.json();
      }

      if (geoData && geoData.length > 0) {
        setMarkerPos([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
    }
  };

  const onSubmit = (data) => {
    setLoading(true);

    const newDonor = {
      ...data,
      id: `DN-${1000 + donors.length + 1}`,
      lat: markerPos[0],
      lng: markerPos[1],
      available: true,
      isVerified: true
    };

    setDonors([newDonor, ...donors]);
    reset();
    setSelectedDiv("");
    setSelectedZila("");
    setLoading(false);
    alert("✅ Registration complete with verified profile!");
  };

  return (
    <div className="card bg-slate-900 shadow-xl border border-slate-800">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>📝</span> Register as a Blood Donor
        </h2>
        <p className="text-slate-400 text-xs mb-6">Enter address and adjust the pin on the map if needed.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label text-slate-300 text-xs font-semibold">Full Name *</label>
            <input 
              type="text" 
              {...register("name", { required: true })} 
              placeholder="e.g. Rahim Ahmed" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
            />
          </div>

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

          <div>
            <label className="label text-slate-300 text-xs font-semibold">Thana / Upazila *</label>
            <select 
              defaultValue="" 
              className="select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500"
              disabled={!selectedZila}
              {...register("thana", { required: true })}
              onChange={(e) => {
                setValue("thana", e.target.value);
                handleSmartGeocode(e.target.value, selectedZila, "");
              }}
            >
              <option value="" disabled>Select Thana</option>
              {selectedZila && (bdLocations[selectedDiv]?.[selectedZila] || []).map((thana) => (
                <option key={thana} value={thana}>{thana}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-slate-300 text-xs font-semibold">Specific Area / Road</label>
            <input 
              type="text" 
              {...register("area")} 
              placeholder="e.g. Rupnagar, Road 16, House 30" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
              onBlur={(e) => {
                const currentThana = document.querySelector('select[name="thana"]').value;
                handleSmartGeocode(currentThana, selectedZila, e.target.value);
              }}
            />
          </div>

          <div>
            <label className="label text-slate-300 text-xs font-semibold">Last Donated Date (Optional)</label>
            <input 
              type="date" 
              {...register("lastDonatedDate")} 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500" 
            />
          </div>

          <div>
            <label className="label text-slate-300 text-xs font-semibold">Contact Phone Number *</label>
            <input 
              type="text" 
              {...register("phone", { required: true })} 
              placeholder="e.g. 01712345678" 
              className="input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-red-500 placeholder:text-slate-500" 
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <label className="label text-slate-300 text-xs font-semibold mb-1">
              📍 Exact Pin Location (Drag marker to adjust):
            </label>
            <div className="h-[220px] w-full rounded-lg overflow-hidden border border-slate-700">
              <MapContainer center={markerPos} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={markerPos} setPosition={setMarkerPos} />
              </MapContainer>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="btn bg-red-600 hover:bg-red-700 text-white border-none w-full font-bold"
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistry;