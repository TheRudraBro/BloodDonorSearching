import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Marker Icon Path Issues in Leaflet React
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Auto focus map component
const MapFocus = ({ donors }) => {
  const map = useMap();

  useEffect(() => {
    if (donors && donors.length > 0) {
      const firstDonor = donors[0];
      if (firstDonor.lat && firstDonor.lng) {
        map.flyTo([parseFloat(firstDonor.lat), parseFloat(firstDonor.lng)], 12, {
          duration: 1.5
        });
      }
    }
  }, [donors, map]);

  return null;
};

const DonorMap = ({ donors }) => {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka Center

  return (
    <div className="card bg-slate-900 border border-slate-700 shadow-xl overflow-hidden relative z-0">
      <div className="card-body p-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          🗺️ Donor Location Map ({donors.length} Donors Pinned)
        </h2>

        {/* Map Container with Scroll and Touch Enable */}
        <div className="h-[420px] w-full rounded-lg overflow-hidden border border-slate-700 relative z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={7} 
            scrollWheelZoom={true} 
            dragging={true}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus donors={donors} />

            {donors.map((donor, index) => {
              if (!donor.lat || !donor.lng) return null;

              const offsetLat = parseFloat(donor.lat) + (index * 0.0003);
              const offsetLng = parseFloat(donor.lng) + (index * 0.0003);
              const cleanPhone = donor.phone ? donor.phone.replace(/[^0-9]/g, '') : '';

              return (
                <Marker 
                  key={donor.id || index} 
                  position={[offsetLat, offsetLng]}
                  icon={redIcon}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 min-w-[160px]">
                      <h3 className="font-bold text-base">{donor.name}</h3>
                      <p className="text-xs font-bold text-red-600">Blood Group: {donor.bloodGroup}</p>
                      
                      <p className="text-xs text-slate-700 mt-1">
                        📍 <strong>{donor.area ? `${donor.area}, ` : ''}</strong>
                        {donor.thana ? `${donor.thana}, ` : ''}
                        {donor.zila ? `${donor.zila}` : donor.division}
                      </p>

                      <div className="flex gap-1 mt-2">
                        <a 
                          href={`tel:${cleanPhone}`} 
                          className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none flex-1 text-center font-bold py-1 rounded"
                        >
                          📞 Call
                        </a>
                        <a 
                          href={`https://api.whatsapp.com/send?phone=88${cleanPhone}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none flex-1 text-center font-bold py-1 rounded"
                        >
                          💬 WA
                        </a>
                      </div>
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