"use client";

import { motion } from "framer-motion";
import Hero from "@/components/HeroSection";
import NavCards from "@/components/NavCards";
import HeroSection from "@/components/HeroSection";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-10 pb-12">

      {/* ── Subtle radial glow behind hero ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(225,29,72,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Brand wordmark ─────────────────────────────────────────── */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="text-2xl font-bold tracking-wide text-white">
          Medi<span className="text-rose-500">Nexus</span>
        </span>
      </motion.div>

      {/* ── Login button — slides in from the left ──────────────────── */}
      <motion.button
        id="login-btn"
        className="absolute top-6 left-6 z-20 rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-semibold text-zinc-100 shadow-lg backdrop-blur-md hover:bg-zinc-800 hover:border-rose-500/60 transition-colors duration-200"
        initial={{ x: "-120%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        Login
      </motion.button>

      {/* ── SVG Hero ───────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <HeroSection />

        {/* 3. The Tagline Animation */}
        <motion.p
          initial={{ opacity: 0, y: 140 }}
          animate={{ opacity: 1, y: 95 }}
          transition={{
            delay: 3.5, // Starts exactly after the word "Medinexus" finishes typing
            duration: 1,
            ease: "easeOut"
          }}
          className="absolute bottom-32 z-20 text-zinc-400 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] md:tracking-[0.5em]"
        >
          Your health, intelligently connected
        </motion.p>




      </motion.div>

      {/* ── Nav Cards ───────────────────────────────────────────────── */}
      <NavCards />

      {/* ── Emergency button — fixed bottom-right, heartbeat pulse ─── */}
      <motion.button
        id="emergency-btn"
        aria-label="Emergency"
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full bg-rose-600 text-white font-bold text-xs tracking-wide shadow-[0_0_28px_rgba(225,29,72,0.5)] flex flex-col items-center justify-center gap-0.5 border-2 border-rose-400/40"
        animate={{
          scale: [1, 1.12, 1, 1.08, 1],
          boxShadow: [
            "0 0 20px rgba(225,29,72,0.45)",
            "0 0 40px rgba(225,29,72,0.80)",
            "0 0 20px rgba(225,29,72,0.45)",
            "0 0 36px rgba(225,29,72,0.75)",
            "0 0 20px rgba(225,29,72,0.45)",
          ],
        }}
        transition={{
          duration: 1.0,
          repeat: Infinity,
          repeatDelay: 0.4,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.2 }}
      >
        <span className="text-lg leading-none">🚨</span>
        <span className="text-[9px] font-bold tracking-widest uppercase leading-none">
          SOS
        </span>
      </motion.button>
    </main>
  );
}
