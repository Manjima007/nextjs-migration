// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
};

function Map({ latitude, longitude, title, address }: Props) {
  useEffect(() => {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]}>
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