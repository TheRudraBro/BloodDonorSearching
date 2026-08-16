import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase/config';
import { bangladeshGeoData } from '../data/bangladeshGeoData';

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

function MapViewController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={redPinIcon} /> : null;
}

const DonorRegistry = ({ bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], donors = [], setDonors, user }) => {
  const divisionList = Object.keys(bangladeshGeoData || {});

  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'A+',
    division: 'Dhaka',
    zila: 'Dhaka',
    thana: 'Mirpur Model',
    phone: '',
    available: true
  });

  const [position, setPosition] = useState([23.8103, 90.4125]);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [existingDonor, setExistingDonor] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const availableDistricts = bangladeshGeoData?.[formData.division]?.districts || {};
  const districtList = Object.keys(availableDistricts);
  const availableThanas = availableDistricts[formData.zila]?.thanas || [];

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

  const handleDivisionChange = (e) => {
    const newDiv = e.target.value;
    const districts = bangladeshGeoData[newDiv]?.districts || {};
    const firstDistrict = Object.keys(districts)[0] || '';
    const firstThana = districts[firstDistrict]?.thanas?.[0] || '';
    const newCoords = districts[firstDistrict]?.coords || [23.8103, 90.4125];

    setFormData({
      ...formData,
      division: newDiv,
      zila: firstDistrict,
      thana: firstThana
    });
    setPosition(newCoords);
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    const firstThana = availableDistricts[newDist]?.thanas?.[0] || '';
    const newCoords = availableDistricts[newDist]?.coords || position;

    setFormData({
      ...formData,
      zila: newDist,
      thana: firstThana
    });
    setPosition(newCoords);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || existingDonor) return;

    setLoading(true);
    const userPhoto = user.photoURL || user.providerData?.[0]?.photoURL || '';

    const newDonorData = {
      ...formData,
      lat: position[0],
      lng: position[1],
      uid: user.uid,
      email: user.email || '',
      photoURL: userPhoto,
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

      if (setDonors) setDonors(prev => [...prev, newDonorData]);
      setExistingDonor(newDonorData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRegistration) {
    return (
      <div className="bg-[#0d1322] p-8 text-center rounded-3xl border border-red-950/80 text-slate-400 text-xs w-full">
        Checking your registration status...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl p-6 sm:p-10 text-center space-y-3 shadow-2xl w-full">
        <span className="text-3xl">🔒</span>
        <h3 className="text-base sm:text-lg font-bold text-white">Login Required</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You must log in with your Google or verified account to register as a blood donor. Each account can register only once.
        </p>
      </div>
    );
  }

  if (existingDonor) {
    const existingPhoto = existingDonor.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(existingDonor.name || 'Donor')}&backgroundColor=b91c1c`;

    return (
      <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl p-5 sm:p-8 shadow-2xl w-full space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <img 
            src={existingPhoto}
            alt={existingDonor.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl bg-slate-900 object-cover ring-2 ring-emerald-500/80 p-0.5"
          />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Already Registered as a Donor</h3>
            <p className="text-xs text-emerald-400 font-medium">Your profile & live photo are public in the emergency network</p>
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
            <strong className="text-white text-sm block truncate">
              {existingDonor.thana ? `${existingDonor.thana}, ` : ''}{existingDonor.zila}, {existingDonor.division}
            </strong>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block text-[11px]">GPS Coordinates:</span>
            <strong className="text-red-400 font-mono text-xs block">
              {existingDonor.lat ? `${existingDonor.lat.toFixed(4)}, ${existingDonor.lng.toFixed(4)}` : 'Manual Location'}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1322] border border-red-950/80 rounded-3xl p-5 sm:p-8 shadow-2xl w-full space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <span className="text-red-500 text-2xl">📝</span>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">Donor Registration & Area Pin</h3>
          <p className="text-xs text-slate-400">Select your Division, District and Thana to pin your exact location</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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

        {/* Geographic Cascading Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-[#080d1a] p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">1. Division (বিভাগ)</label>
            <select
              value={formData.division}
              onChange={handleDivisionChange}
              className="select select-sm sm:select-md bg-[#0d1322] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            >
              {divisionList.map(div => (<option key={div} value={div}>{div}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">2. District (জেলা)</label>
            <select
              value={formData.zila}
              onChange={handleDistrictChange}
              className="select select-sm sm:select-md bg-[#0d1322] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            >
              {districtList.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">3. Police Station (থানা / এলাকা)</label>
            <select
              value={formData.thana}
              onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
              className="select select-sm sm:select-md bg-[#0d1322] border-slate-700 text-white w-full rounded-xl text-xs sm:text-sm focus:border-red-500"
            >
              {availableThanas.map(th => (<option key={th} value={th}>{th}</option>))}
            </select>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="space-y-2 bg-[#080d1a] p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="text-red-500">📍</span> Click on map to pinpoint exact location in {formData.thana}, {formData.zila}:
              </label>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Pinned GPS: <span className="text-red-400 font-mono font-bold">{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
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
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewController center={position} />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-sm sm:btn-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full rounded-xl font-bold text-xs sm:text-sm active:scale-[0.99] shadow-lg shadow-red-950/60 transition-all"
        >
          {loading ? 'Registering Profile...' : 'Complete Blood Donor Registration'}
        </button>
      </form>
    </div>
  );
};

export default DonorRegistry;