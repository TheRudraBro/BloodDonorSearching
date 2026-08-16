import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase/config';

// 🔴 Custom Red Neon Map Pin Icon
const redPinIcon = L.divIcon({
  className: 'custom-red-pin',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <svg width="34" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.7));">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#dc2626" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
      </svg>
      <div style="width: 8px; height: 3px; background: rgba(0, 0, 0, 0.4); border-radius: 50%; margin-top: -2px; filter: blur(1px);"></div>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [0, 0]
});

// Map Click Listener Component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={redPinIcon} /> : null;
}

const DonorRegistry = ({ divisions, bloodGroups, donors = [], setDonors, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'A+',
    division: 'Dhaka',
    zila: '',
    thana: '',
    phone: '',
    available: true
  });

  // Default: Dhaka Coordinates
  const [position, setPosition] = useState([23.8103, 90.4125]);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [existingDonor, setExistingDonor] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    const checkUserDonorStatus = async () => {
      if (!user) {
        setExistingDonor(null);
        setCheckingRegistration(false);
        return;
      }

      setCheckingRegistration(true);
      try {
        if (db && user?.uid) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isDonorRegistered) {
            setExistingDonor(userDoc.data().donorData);
            setCheckingRegistration(false);
            return;
          }
        }

        const found = donors.find(d => d.uid === user.uid || (user.email && d.email === user.email));
        if (found) {
          setExistingDonor(found);
        } else {
          setExistingDonor(null);
          setFormData(prev => ({ ...prev, name: user.displayName || '' }));
        }
      } catch (err) {
        console.error("Donor check error:", err);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkUserDonorStatus();
  }, [user, donors]);

  // GPS Location Handler
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setGpsLoading(false);
        },
        (err) => {
          console.error(err);
          alert("Could not fetch GPS location. Please pin manually on the map.");
          setGpsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("⚠️ You must be logged in to register as a donor!");
      return;
    }

    if (existingDonor) {
      alert("⚠️ You are already registered as a donor with this account!");
      return;
    }

    if (!formData.name || !formData.zila || !formData.phone) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    const newDonorData = {
      ...formData,
      lat: position[0],
      lng: position[1],
      uid: user.uid,
      email: user.email || '',
      registeredAt: new Date().toISOString()
    };

    try {
      if (db) {
        const docRef = await addDoc(collection(db, "donors"), newDonorData);
        
        await setDoc(doc(db, "users", user.uid), {
          isDonorRegistered: true,
          donorData: { id: docRef.id, ...newDonorData }
        }, { merge: true });
      }

      if (setDonors) {
        setDonors(prev => [...prev, newDonorData]);
      }

      setExistingDonor(newDonorData);
      alert("🎉 Successfully registered with your pinned location!");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRegistration) {
    return (
      <div className="bg-[#0d1322] p-8 text-center rounded-2xl border border-red-950/80 text-slate-400 text-xs w-full">
        Checking your registration status...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#0d1322] border border-red-950/80 rounded-2xl p-6 sm:p-10 text-center space-y-3 shadow-xl w-full">
        <span className="text-3xl">🔒</span>
        <h3 className="text-base sm:text-lg font-bold text-white">Login Required</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You must log in with your Google or verified account to register as a blood donor. Each account can register only once.
        </p>
      </div>
    );
  }

  if (existingDonor) {
    return (
      <div className="bg-[#0d1322] border border-red-950/80 rounded-2xl p-5 sm:p-8 shadow-xl w-full space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-xl flex items-center justify-center shrink-0">
            ✓
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Already Registered as a Donor</h3>
            <p className="text-xs text-emerald-400 font-medium">Your profile and location are active in the live directory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#080d1a] p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div className="space-y-1">
            <span className="text-slate-500 block text-[11px]">Donor Name:</span>
            <strong className="text-white text-sm block truncate">{existingDonor.name}</strong>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block text-[11px]">Blood Group:</span>
            <span className="inline-block bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded font-black text-xs">
              {existingDonor.bloodGroup}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block text-[11px]">Location:</span>
            <strong className="text-white text-sm block truncate">{existingDonor.division}, {existingDonor.zila}</strong>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block text-[11px]">GPS Coordinates:</span>
            <strong className="text-red-400 font-mono text-xs block">
              {existingDonor.lat ? `${existingDonor.lat.toFixed(4)}, ${existingDonor.lng.toFixed(4)}` : 'Manual City'}
            </strong>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center italic">
          * Each verified account is restricted to a single donor registration to prevent duplicate entries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1322] border border-red-950/80 rounded-2xl p-5 sm:p-8 shadow-xl w-full space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <span className="text-red-500 text-2xl">📝</span>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">Donor Registration & Map Pin</h3>
          <p className="text-xs text-slate-400">Fill your details and pin your exact location with the red marker</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">Contact Phone Number</label>
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            >
              {bloodGroups.map(bg => (<option key={bg} value={bg}>{bg}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">Division</label>
            <select
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              className="select select-sm sm:select-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            >
              {divisions.map(div => (<option key={div} value={div}>{div}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">District (Zila)</label>
            <input
              type="text"
              required
              placeholder="e.g. Dhaka"
              value={formData.zila}
              onChange={(e) => setFormData({ ...formData, zila: e.target.value })}
              className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">Thana / Area</label>
            <input
              type="text"
              placeholder="e.g. Mirpur"
              value={formData.thana}
              onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
              className="input input-sm sm:input-md bg-[#080d1a] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            />
          </div>
        </div>

        {/* 🗺️ MAP CONTAINER WITH RED PIN 🗺️ */}
        <div className="space-y-2 bg-[#080d1a] p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="text-red-500">📍</span> Select Your Location on Map (Click to place Red Pin):
              </label>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Selected Coordinates: <span className="text-red-400 font-mono font-bold">{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gpsLoading}
              className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] flex items-center gap-1 shrink-0"
            >
              <span>🎯</span> {gpsLoading ? 'Locating...' : 'Get My GPS Location'}
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-700/80 relative z-0">
            <MapContainer
              center={position}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-sm sm:btn-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full rounded-xl font-bold text-xs sm:text-sm active:scale-[0.99] shadow-lg shadow-red-950/60 transition-all"
        >
          {loading ? 'Registering Profile & Location...' : 'Complete Blood Donor Registration'}
        </button>
      </form>
    </div>
  );
};

export default DonorRegistry;