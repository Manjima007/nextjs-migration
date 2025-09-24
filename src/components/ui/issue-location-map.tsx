// @ts-nocheck
'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./simple-map'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 flex items-center justify-center text-gray-500">
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
  if (!location?.coordinates) {
    return (
      <div className="h-[300px] bg-gray-100 flex items-center justify-center text-gray-500">
        No location available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <Map
        latitude={location.coordinates.latitude}
        longitude={location.coordinates.longitude}
        title={title}
        address={location.address}
      />
    </div>
  );
}

export default IssueLocationMap;