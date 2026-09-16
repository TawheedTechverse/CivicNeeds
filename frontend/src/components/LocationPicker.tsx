import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  defaultCenter?: { lat: number; lng: number };
}

function ClickHandler({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPicker({ value, onChange, defaultCenter = { lat: 40.7128, lng: -74.006 } }: LocationPickerProps) {
  const center = value ?? defaultCenter;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="h-64 w-full overflow-hidden rounded-xl border border-white/50 dark:border-white/10">
        <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {value && <Marker position={[value.lat, value.lng]} icon={defaultIcon} />}
          <ClickHandler onChange={onChange} />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-charcoal-900/60 dark:text-sage-50/60">
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Tap the map to drop a pin"}
        </span>
        <button type="button" onClick={useMyLocation} className="btn-secondary py-1.5 px-3 text-xs">
          Use my location
        </button>
      </div>
    </div>
  );
}
