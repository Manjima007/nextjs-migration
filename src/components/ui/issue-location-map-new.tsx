'use client';

import dynamic from 'next/dynamic';

// Import SimpleMap dynamically to prevent SSR issues
const SimpleMap = dynamic(
  () => import('./simple-map'),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);

interface Location {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface IssueLocationMapProps {
  location: Location;
  title: string;
}

function LoadingPlaceholder() {
  return (
    <div className="h-[300px] bg-gray-100 flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  );
}

function NoLocationPlaceholder() {
  return (
    <div className="h-[300px] bg-gray-100 flex items-center justify-center text-gray-500">
      No location coordinates available
    </div>
  );
}

export function IssueLocationMap({ location, title }: IssueLocationMapProps) {
  if (!location?.coordinates) {
    return <NoLocationPlaceholder />;
  }

  const { latitude, longitude } = location.coordinates;

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <SimpleMap
        latitude={latitude}
        longitude={longitude}
        title={title}
        address={location.address}
      />
    </div>
  );
}