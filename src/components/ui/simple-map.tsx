'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L for the icon fix

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
};

// This is a common fix for the default marker icon issue with webpack.
// You'll likely need this!
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


// Your ChangeView component is perfect, no changes needed here.
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center]); // Only need to re-run when the center changes
  return null;
}

function Map({ latitude, longitude, title, address }: Props) {
  // Your check for 'window' works, but using next/dynamic as we discussed
  // is the more standard way to handle this. For now, this is fine.
  if (typeof window === 'undefined') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        Loading map...
      </div>
    );
  }

  const position: L.LatLngExpression = [latitude, longitude];

  return (
    // REMOVED the key prop from this div
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={position} zoom={15} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        <Marker position={position}>
          <Popup>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm">{address}</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;