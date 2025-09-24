// @ts-nocheck
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export default function MapComponent({ latitude, longitude, title, address }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Set up the Leaflet map
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a custom icon
    const icon = L.icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add a marker with the custom icon
    const marker = L.marker([latitude, longitude], { icon }).addTo(map);

    // Add a popup to the marker
    marker.bindPopup(`
      <div>
        <h3 style="font-weight: 600">${title}</h3>
        <p style="font-size: 0.875rem">${address}</p>
      </div>
    `);

    // Handle resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      map.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [latitude, longitude, title, address]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}