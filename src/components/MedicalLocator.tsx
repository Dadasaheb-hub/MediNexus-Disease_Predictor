"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import the MapComponent so it only renders on the client side
// This prevents Next.js SSR errors with Leaflet's dependencies on window
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 rounded-2xl border border-zinc-700/50">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-zinc-400 font-medium tracking-widest uppercase text-sm animate-pulse">
        Initializing Maps...
      </span>
    </div>
  )
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
  distance?: string;
}

const mockLocations: Location[] = [
  {
    id: "h1",
    type: "hospital",
    name: "Apollo City Hospital",
    lat: 28.6139,
    lng: 77.2090,
    contact: "+91 800-456-7890",
    doctor: "A. Sharma (Chief Surgeon)",
    address: "Sector 14, Greater Boulevard",
    distance: "1.2 km away"
  },
  {
    id: "h2",
    type: "hospital",
    name: "Max Super Specialty",
    lat: 28.6250,
    lng: 77.2150,
    contact: "+91 800-123-4567",
    doctor: "R. Mehta (Cardiologist)",
    address: "Block B, Central Avenue",
    distance: "2.4 km away"
  },
  {
    id: "p1",
    type: "pharmacy",
    name: "Apollo Pharmacy",
    lat: 28.6189,
    lng: 77.2020,
    contact: "+91 987-654-3210",
    address: "Next to Metro Station",
    distance: "0.8 km away"
  },
  {
    id: "p2",
    type: "pharmacy",
    name: "Wellness Medicos",
    lat: 28.6099,
    lng: 77.2190,
    contact: "+91 912-345-6789",
    address: "High Street Market",
    distance: "1.5 km away"
  }
];

const mockMedicines = [
  { name: "Paracetamol 500mg", Pharmeasy: "₹24.50", Netmeds: "₹22.00", Tata1mg: "₹25.00" },
  { name: "Amoxicillin 250mg", Pharmeasy: "₹55.00", Netmeds: "₹58.50", Tata1mg: "₹54.00" },
  { name: "Cough Syrup 100ml", Pharmeasy: "₹85.00", Netmeds: "₹80.00", Tata1mg: "₹82.50" },
];

export default function MedicalLocator() {
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);

  // Default map center
  const centerPosition: [number, number] = [28.6139, 77.2090];
  const zoomLevel = 13;

  const handleMarkerClick = (loc: Location) => {
    setSelectedLocId(loc.id);
  };

  const selectedLoc = mockLocations.find(l => l.id === selectedLocId) || mockLocations[0];

  const handleGetDirections = (loc: Location) => {
    // Open Google Maps in a new tab with the location's coordinates
    window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank');
  };

  return (
    <div className="w-full flex-1 flex flex-col xl:flex-row gap-6">

      {/* Left Column: Interactive Map */}
      <motion.div
        className="flex-1 min-h-[400px] xl:min-h-0 relative rounded-3xl overflow-hidden p-[2px] bg-gradient-to-b from-zinc-700/50 to-zinc-900/50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute inset-[2px] bg-zinc-950 rounded-[22px] overflow-hidden z-10">
          <MapComponent
            locations={mockLocations}
            center={centerPosition}
            zoom={zoomLevel}
            onMarkerClick={handleMarkerClick}
            selectedLocationId={selectedLocId}
          />
        </div>
      </motion.div>

      {/* Right Column: Sidebar (Location Details & Medicine Compare) */}
      <motion.div
        className="w-full xl:w-[450px] flex flex-col gap-6 flex-shrink-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >

        {/* Selected Location Details Board */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
          {/* Subtle Glow bg behind sidebar */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center justify-between">
            <span>Nearby Facilities (4)</span>
          </h3>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {mockLocations.map((loc) => {
              const isActive = selectedLocId === loc.id || (!selectedLocId && loc.id === mockLocations[0].id);

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`cursor-pointer group p-4 rounded-2xl border transition-all duration-300 ${isActive
                    ? "bg-zinc-800/80 border-cyan-500/50 shadow-[0_4px_20px_rgba(6,182,212,0.15)]"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner ${loc.type === 'hospital' ? 'bg-rose-500/20 text-rose-500' : 'bg-cyan-500/20 text-cyan-500'
                        }`}>
                        {loc.type === 'hospital' ? '🏥' : '💊'}
                      </div>
                      <div>
                        <h4 className={`font-semibold text-base transition-colors ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                          {loc.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{loc.distance} • {loc.address}</p>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 pt-4 border-t border-zinc-700/50 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 flex flex-col">
                          <span className="text-xs text-zinc-500 mb-1">Contact</span>
                          <span className="text-zinc-200 font-medium">{loc.contact}</span>
                        </div>
                        {loc.doctor && (
                          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 flex flex-col">
                            <span className="text-xs text-zinc-500 mb-1">Chief Doctor</span>
                            <span className="text-zinc-200 font-medium">{loc.doctor}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleGetDirections(loc); }}
                        className={`w-full py-3 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all ${loc.type === 'hospital'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          }`}
                      >
                        📍 Get Directions
                      </button>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Medicine Price Comparison */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex-shrink-0">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -z-10" />

          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-5 flex items-center gap-2">
            <span>🛒</span> Compare Online Prices
          </h3>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Medicine</th>
                  <th className="px-4 py-3 font-medium text-emerald-400">PharmEasy</th>
                  <th className="px-4 py-3 font-medium text-blue-400">Netmeds</th>
                  <th className="px-4 py-3 font-medium text-rose-400">Tata 1mg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {mockMedicines.map((med, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-200">{med.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{med.Pharmeasy}</td>
                    <td className="px-4 py-3 text-zinc-300">{med.Netmeds}</td>
                    <td className="px-4 py-3 text-zinc-300">{med.Tata1mg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-zinc-500 mt-4 text-center">
            *Prices are simulated for presentation purposes.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
