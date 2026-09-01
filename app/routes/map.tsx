import { useState, useEffect, lazy, Suspense } from "react";

// Dynamically import the map component so Leaflet only runs client-side
const MapContent = lazy(() => import("./map-content"));

export default function MapPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ height: "100vh", width: "100vw" }}>Loading map...</div>;
  }

  return (
    <Suspense fallback={<div style={{ height: "100vh", width: "100vw" }}>Loading map...</div>}>
      <MapContent />
    </Suspense>
  );
}