"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
type PredictionResult = {
  disease: string;
  precautions: string[];
  medicines: string[];
  specialist: string;
};

type Hospital = {
  id: number;
  name: string;
  address: string;
  phone: string;
  specialty: string;
  lat: number;
  lng: number;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DiseasePredictor() {
  const [symptoms, setSymptoms] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mapOpen, setMapOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // ── Predict ─────────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && symptoms.trim()) handleSubmit();
  };

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setIsPredicting(true);
    setResult(null);
    setError(null);
    setMapOpen(false);
    setHospitals([]);
    setSelectedHospital(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPredicting(false);
    }
  };

  // ── Hospitals (GPS + API) ───────────────────────────────────────────────────
  const handleViewOnMap = useCallback(() => {
    setHospitalsLoading(true);
    setMapOpen(true);
    setSelectedHospital(null);

    const fetchHospitals = async (lat: number, lng: number) => {
      setUserCoords({ lat, lng });
      try {
        const res = await fetch("/api/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setHospitals(data.hospitals ?? []);
      } catch {
        setHospitals([]);
      } finally {
        setHospitalsLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchHospitals(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback: default to New Delhi
          fetchHospitals(28.6139, 77.209);
        },
        { timeout: 8000 }
      );
    } else {
      fetchHospitals(28.6139, 77.209);
    }
  }, []);

  // ── Map position helpers ────────────────────────────────────────────────────
  const toMapPos = (hospital: Hospital) => {
    if (!userCoords) return { x: 50, y: 50 };
    // Convert lat/lng offset to a percentage on the map viewport
    // Each 0.05 degrees ≈ ~5 km, maps to 40% of viewport
    const scale = 800; // sensitivity scale
    const x = 50 + (hospital.lng - userCoords.lng) * scale;
    const y = 50 - (hospital.lat - userCoords.lat) * scale;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  const openDirections = (h: Hospital) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
      "_blank"
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex-1 flex flex-col items-center">

      {/* ── Input ── */}
      <motion.div
        className="w-full max-w-3xl mb-12 relative z-20 mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-xl group-hover:bg-cyan-500/30 transition-colors duration-500" />
          <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-2 shadow-2xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all duration-300">
            <span className="pl-4 pr-2 text-2xl">🧬</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-500 px-4 py-4 text-lg"
              placeholder="Describe your symptoms… (e.g., severe headache, nausea, sensitivity to light)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPredicting}
            />
            <button
              onClick={handleSubmit}
              disabled={!symptoms.trim() || isPredicting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPredicting ? (
                <><span className="animate-spin text-xl">⚕️</span>Analyzing…</>
              ) : "Analyze"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-3xl mb-6 flex items-center gap-3 bg-rose-950/60 border border-rose-700/50 rounded-2xl px-5 py-4 backdrop-blur-xl"
          >
            <span className="text-xl">⚠️</span>
            <p className="flex-1 text-rose-300 text-sm">{error}</p>
            <button onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-300 transition-colors text-lg leading-none">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {isPredicting && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 py-16"
          >
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping" />
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              <div className="absolute inset-4 rounded-full border-b-2 border-rose-500 animate-spin"
                style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🧬</div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-zinc-300 font-semibold tracking-widest uppercase text-sm animate-pulse">
                Correlating symptoms…
              </p>
              <p className="text-zinc-600 text-xs tracking-wide">Our AI is analysing your input</p>
            </div>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Cards */}
        {result && !isPredicting && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl space-y-6"
          >
            {/* Disease Banner */}
            <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
              <h3 className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3">Predicted Condition</h3>
              <div className="flex items-center gap-5">
                <span className="text-5xl border-r border-zinc-700 pr-5">⚠️</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{result.disease}</h2>
              </div>
            </div>

            {/* Row 2: Precautions | Specialist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precautions */}
              <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl p-7 shadow-xl">
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-2">
                  <span>🛡️</span> General Precautions
                </h3>
                <ul className="space-y-3 relative z-10">
                  {result.precautions.map((p, idx) => (
                    <motion.li key={idx}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.08 }}
                      className="flex items-start gap-3 text-zinc-300 text-sm"
                    >
                      <span className="text-cyan-500 mt-0.5 shrink-0">✓</span>
                      <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Specialist */}
              <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-cyan-900/30 rounded-3xl p-7 shadow-xl">
                <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-2">
                  <span>👨‍⚕️</span> Required Specialist
                </h3>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-3xl font-semibold text-cyan-400">{result.specialist}</p>
                    <p className="text-xs text-zinc-500 mt-1">Find top-rated specialists near you</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center text-3xl">
                    🩺
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Medicines | Nearby Hospitals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medicines */}
              <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl p-7 shadow-xl">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-2">
                  <span>💊</span> Recommended Medicines
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.medicines.map((med, idx) => (
                    <motion.span key={idx}
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      className="px-4 py-2 bg-zinc-800/80 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-medium"
                    >
                      {med}
                    </motion.span>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-4 flex gap-1.5">
                  <span className="text-rose-500/80">*</span>
                  Please consult a doctor before taking any medication.
                </p>
              </div>

              {/* Nearby Hospitals card */}
              <div className="relative overflow-hidden bg-zinc-950/60 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl p-7 shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-2">
                  <span>🏥</span> Nearby Hospitals
                </h3>
                <p className="text-zinc-500 text-sm mb-4">
                  Locate hospitals near you and get directions instantly.
                </p>
                <button
                  onClick={handleViewOnMap}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-800/40 hover:border-emerald-500/50 transition-all group"
                >
                  <span className="text-sm font-medium">View on Map</span>
                  <span className="h-8 w-8 rounded-full bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-400 transition-all shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] md:text-xs text-zinc-600 uppercase tracking-wider text-center pb-2">
              Disclaimer: This prediction is for informational purposes only. Always consult a qualified healthcare provider.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hospital Map Panel (Full-screen overlay) ── */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            key="map-overlay"
            initial={{ opacity: 0, scale: 0.85, borderRadius: "50%" }}
            animate={{ opacity: 1, scale: 1, borderRadius: "24px" }}
            exit={{ opacity: 0, scale: 0.85, borderRadius: "50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-4 md:inset-8 z-50 bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800/60 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            style={{ borderRadius: 24 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <h2 className="text-white font-semibold text-lg">Hospitals Near You</h2>
                  <p className="text-zinc-500 text-xs">
                    {hospitalsLoading
                      ? "Locating…"
                      : `${hospitals.length} hospitals found — click a marker for details`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setMapOpen(false); setSelectedHospital(null); }}
                className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">

              {/* ── Map area ── */}
              <div className="relative flex-1 overflow-hidden">
                {/* Dark grid background */}
                <div className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)",
                    backgroundImage: `
                      linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Road SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0,50 Q 25,45 50,52 Q 75,58 100,50" stroke="rgba(148,163,184,0.15)" strokeWidth="1.2" fill="none" />
                  <path d="M 50,0 Q 48,25 52,50 Q 55,75 50,100" stroke="rgba(148,163,184,0.15)" strokeWidth="1.2" fill="none" />
                  <path d="M 0,25 Q 30,22 60,28 Q 80,32 100,25" stroke="rgba(100,116,139,0.1)" strokeWidth="0.6" fill="none" />
                  <path d="M 0,75 Q 35,70 65,78 Q 85,82 100,75" stroke="rgba(100,116,139,0.1)" strokeWidth="0.6" fill="none" />
                  <path d="M 25,0 Q 22,40 28,70 Q 30,85 25,100" stroke="rgba(100,116,139,0.1)" strokeWidth="0.6" fill="none" />
                  <path d="M 75,0 Q 72,30 78,60 Q 80,80 75,100" stroke="rgba(100,116,139,0.1)" strokeWidth="0.6" fill="none" />
                </svg>

                {/* Loading indicator */}
                {hospitalsLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-zinc-400 text-sm animate-pulse tracking-widest uppercase">Fetching hospitals…</p>
                  </div>
                )}

                {/* "You are here" marker (center) */}
                {!hospitalsLoading && (
                  <div className="absolute z-10" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping scale-150" />
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    </div>
                  </div>
                )}

                {/* Hospital markers */}
                {!hospitalsLoading && hospitals.map((h) => {
                  const pos = toMapPos(h);
                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHospital(h)}
                      className="absolute z-20 group"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                      title={h.name}
                    >
                      <div className={`absolute inset-0 rounded-full animate-ping scale-150 ${selectedHospital?.id === h.id ? "bg-emerald-400/40" : "bg-emerald-500/20"}`} />
                      <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-lg transition-all duration-200 group-hover:scale-125
                        ${selectedHospital?.id === h.id
                          ? "bg-emerald-500 border-white shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-125"
                          : "bg-zinc-900 border-emerald-500/60 shadow-[0_0_10px_rgba(52,211,153,0.4)] group-hover:bg-emerald-900"
                        }`}
                      >
                        🏥
                      </div>
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-200 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700">
                        {h.name}
                      </div>
                    </button>
                  );
                })}

                {/* No results message */}
                {!hospitalsLoading && hospitals.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <p className="text-zinc-500 text-sm">No hospitals found within 5 km</p>
                  </div>
                )}

                {/* Legend */}
                {!hospitalsLoading && hospitals.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-zinc-500 z-20">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                      You
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                      Hospital
                    </span>
                  </div>
                )}
              </div>

              {/* ── Detail Panel ── */}
              <AnimatePresence mode="wait">
                {selectedHospital ? (
                  <motion.div
                    key={selectedHospital.id}
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-72 shrink-0 border-l border-zinc-800/60 bg-zinc-900/80 backdrop-blur-xl p-6 flex flex-col gap-5 overflow-y-auto"
                  >
                    <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 text-5xl mx-auto shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                      🏥
                    </div>

                    <div className="text-center">
                      <h3 className="text-white font-bold text-xl leading-snug">{selectedHospital.name}</h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-emerald-900/40 border border-emerald-700/40 rounded-full text-emerald-400 text-xs font-medium">
                        {selectedHospital.specialty}
                      </span>
                    </div>

                    <hr className="border-zinc-800" />

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">📍</span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Address</p>
                          <p className="text-zinc-200 text-sm leading-relaxed">{selectedHospital.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">📞</span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Phone</p>
                          {selectedHospital.phone !== "N/A" ? (
                            <a href={`tel:${selectedHospital.phone}`}
                              className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors font-mono"
                            >{selectedHospital.phone}</a>
                          ) : (
                            <p className="text-zinc-500 text-sm">Not available</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">🩺</span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Speciality</p>
                          <p className="text-zinc-200 text-sm">{selectedHospital.specialty}</p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-zinc-800" />

                    <div className="space-y-2 mt-auto">
                      <button
                        onClick={() => openDirections(selectedHospital)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                      >
                        Get Directions
                      </button>
                      <button className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors border border-zinc-700">
                        Book Appointment
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-72 shrink-0 border-l border-zinc-800/60 bg-zinc-900/60 backdrop-blur-xl p-6 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl">
                      🏥
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Select a hospital</p>
                    <p className="text-zinc-600 text-xs">Click any marker on the map to see details</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
