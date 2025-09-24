'use client';

import L from 'leaflet';

// Initialize Leaflet icon configuration globally
export function initializeLeaflet() {
  if (typeof window === 'undefined') return;

  // Delete the default icon properties
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  // Set icon configurations
  L.Icon.Default.mergeOptions({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Export a configured icon instance
export const defaultIcon = typeof window !== 'undefined'
  ? new L.Icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  : null;