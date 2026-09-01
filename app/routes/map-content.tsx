import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = "http://localhost:3000/api/annotations";

interface Annotation {
  id: string;
  title: string;
  category: string;
  description: string | null;
  severity: number;
  latitude: number;
  longitude: number;
}

function MapClickHandler({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapContent() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setAnnotations(data))
      .catch((err) => console.error("Error fetching annotations:", err));
  }, []);

  const handleAddAnnotation = async (latitude: number, longitude: number) => {
    const title = prompt("Annotation Title (e.g. Steep Hill, Deep Pothole):");
    if (!title) return;

    const category = prompt("Category (pothole, gradient, hazard, construction):", "pothole") || "hazard";
    const description = prompt("Detailed description:") || "";
    const severityStr = prompt("Severity rating (1-5):", "1") || "1";

    const payload = {
      title,
      category,
      description,
      severity: parseInt(severityStr, 10),
      latitude,
      longitude,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newAnnotation: Annotation = await res.json();
        setAnnotations((prev) => [...prev, newAnnotation]);
      }
    } catch (err) {
      console.error("Failed to save annotation:", err);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={[-6.1754, 106.8271]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onAdd={handleAddAnnotation} />
        {annotations.map((item) => (
          <Marker key={item.id} position={[item.latitude, item.longitude]}>
            <Popup>
              <div style={{ minWidth: "150px" }}>
                <strong style={{ fontSize: "1.1em" }}>{item.title}</strong>
                <p style={{ margin: "4px 0", color: "#666" }}>
                  <strong>Type:</strong> {item.category} | <strong>Severity:</strong> {item.severity}/5
                </p>
                {item.description && <p style={{ margin: 0 }}>{item.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}