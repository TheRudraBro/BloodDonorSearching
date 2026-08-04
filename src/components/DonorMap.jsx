import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// রেড মার্কার আইকন
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DonorMap = ({ donors }) => {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka Center

  return (
    <div className="card bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
      <div className="card-body p-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          🗺️ Donor Location Map ({donors.length} Donors Pinned)
        </h2>

        <div className="h-[420px] w-full rounded-lg overflow-hidden border border-slate-700">
          <MapContainer 
            center={defaultCenter} 
            zoom={7} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {donors.map((donor) => {
              if (!donor.lat || !donor.lng) return null;
              return (
                <Marker 
                  key={donor.id} 
                  position={[parseFloat(donor.lat), parseFloat(donor.lng)]}
                  icon={redIcon}
                >
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <h3 className="font-bold text-base">{donor.name}</h3>
                      <p className="text-xs font-bold text-red-600">Blood: {donor.bloodGroup}</p>
                      <p className="text-xs">📍 {donor.division}</p>
                      <a 
                        href={`tel:${donor.phone}`} 
                        className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none mt-2 w-full block text-center py-1 rounded font-bold"
                      >
                        📞 Call {donor.phone}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DonorMap;