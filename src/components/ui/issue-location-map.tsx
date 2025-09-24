'use client';

import dynamic from 'next/dynamic';
import { initializeLeaflet } from '@/lib/leaflet-config';

// This logic to initialize Leaflet is a side effect. It's better to
// ensure it only runs once per application load.
let leafletInitialized = false;
if (typeof window !== 'undefined' && !leafletInitialized) {
  initializeLeaflet();
  leafletInitialized = true;
}

const Map = dynamic(() => import('./simple-map'), { 
  ssr: false,
  // The loading component will now be shown inside our stable container
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  )
});

type Props = {
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  title: string;
};

function IssueLocationMap({ location, title }: Props) {
  return (
    // STEP 1: This outer div is now the STABLE container. It always renders.
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      {/* STEP 2: Use a ternary to decide WHAT to render INSIDE the container */}
      {location?.coordinates ? (
        <Map
          latitude={location.coordinates.latitude}
          longitude={location.coordinates.longitude}
          title={title}
          address={location.address}
        />
      ) : (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
          No location available
        </div>
      )}
    </div>
  );
}

export default IssueLocationMap;