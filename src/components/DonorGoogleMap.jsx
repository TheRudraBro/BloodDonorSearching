import React, { useEffect, useRef } from 'react';

const DonorGoogleMap = ({ donors }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // বাংলাদেশ সেন্ট্রাল লোকেশন (Dhaka Default)
    const defaultCenter = { lat: 23.8103, lng: 90.4125 };

    if (!googleMapRef.current && mapRef.current && window.google) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 7,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
        ],
      });
    }
  }, []);

  useEffect(() => {
    if (!googleMapRef.current || !window.google) return;

    // পুরনো মার্কারগুলো রিমুভ করা
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidMarker = false;

    donors.forEach((donor) => {
      if (!donor.lat || !donor.lng) return;

      hasValidMarker = true;
      const position = { lat: parseFloat(donor.lat), lng: parseFloat(donor.lng) };

      // Red Blood Droplet Marker Icon
      const marker = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: donor.name,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Info Window / Popup Content
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${donor.name}</h3>
            <p style="margin: 2px 0; color: #dc2626; font-weight: bold; font-size: 14px;">Group: ${donor.bloodGroup}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #475569;">📍 ${donor.thana ? donor.thana + ', ' : ''}${donor.zila ? donor.zila + ', ' : ''}${donor.division}</p>
            <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">📞 ${donor.phone}</p>
            <a href="tel:${donor.phone}" style="display: block; margin-top: 6px; background-color: #dc2626; color: white; text-align: center; padding: 6px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 12px;">
              Call Donor
            </a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // ম্যাপ অটো জুম বা ফোকাস করবে ডোনার মার্কারগুলোর ওপর
    if (hasValidMarker && donors.length > 0) {
      googleMapRef.current.fitBounds(bounds);
      if (donors.length === 1) {
        googleMapRef.current.setZoom(13);
      }
    }
  }, [donors]);

  return (
    <div className="card bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
      <div className="card-body p-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          🗺️ Donor Google Map Location ({donors.length} Donors Pinned)
        </h2>
        <div 
          ref={mapRef} 
          className="w-full h-[420px] rounded-lg border border-slate-700" 
        />
      </div>
    </div>
  );
};

export default DonorGoogleMap;