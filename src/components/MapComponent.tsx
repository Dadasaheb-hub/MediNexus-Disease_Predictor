"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in Next.js/Webpack
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for Hospitals and Pharmacies
const hospitalIcon = L.divIcon({
  className: "custom-hospital-icon",
  html: `<div style="background-color: #e11d48; color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(225,29,72,0.8); font-size: 16px;">🏥</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const pharmacyIcon = L.divIcon({
  className: "custom-pharmacy-icon",
  html: `<div style="background-color: #06b6d4; color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(6,182,212,0.8); font-size: 16px;">💊</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface Location {
  id: string;
  type: "hospital" | "pharmacy";
  name: string;
  lat: number;
  lng: number;
  contact: string;
  doctor?: string;
  address: string;
}

interface MapComponentProps {
  locations: Location[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (loc: Location) => void;
  selectedLocationId: string | null;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ locations, center, zoom, onMarkerClick, selectedLocationId }: MapComponentProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700/50 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* 
        We use a dark-styled Map using CartoDB Dark Matter tiles
        to fit seamlessly with Medinexus aesthetic.
      */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]} 
            icon={loc.type === "hospital" ? hospitalIcon : pharmacyIcon}
            eventHandlers={{
              click: () => onMarkerClick(loc),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm text-zinc-900 mb-1">{loc.name}</h3>
                <p className="text-xs text-zinc-600 mb-2">{loc.address}</p>
                {loc.doctor && (
                  <p className="text-xs font-semibold text-rose-600">Dr. {loc.doctor}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Global styles for dark popups overrides (if needed later) */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #09090b;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.5) !important;
          color: #ccc !important;
        }
        .leaflet-control-attribution a {
          color: #fff !important;
        }
      `}} />
    </div>
  );
}
