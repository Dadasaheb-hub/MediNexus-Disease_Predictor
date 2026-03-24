"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import DiseasePredictor from "./DiseasePredictor";
import MedicalLocator from "./MedicalLocator";
import GovernmentSchemes from "./GovernmentSchemes";

const cards = [
  {
    id: "disease-predictor",
    label: "Disease Predictor",
    icon: "🧬",
    gradient:
      "linear-gradient(145deg, #09090b 0%, #0f172a 60%, rgba(6,182,212,0.15) 100%)",
    glow: "rgba(6,182,212,0.20)",
    accent: "#06b6d4",
  },
  {
    id: "government-schemes",
    label: "Government Schemes",
    icon: "🏛️",
    gradient:
      "linear-gradient(145deg, #09090b 0%, #1a0a2e 60%, rgba(139,92,246,0.15) 100%)",
    glow: "rgba(139,92,246,0.20)",
    accent: "#8b5cf6",
  },
  {
    id: "medical-locator",
    label: "Medical Locator",
    icon: "📍",
    gradient:
      "linear-gradient(145deg, #09090b 0%, #1a0808 60%, rgba(225,29,72,0.15) 100%)",
    glow: "rgba(225,29,72,0.20)",
    accent: "#e11d48",
  },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: {
    y: 300,
    opacity: 0,
    borderRadius: "50%",
    height: 56,
    scaleX: 0.26,
  },
  visible: {
    y: 0,
    opacity: 1,
    borderRadius: "16px",
    height: 280,
    scaleX: 1,
    transition: {
      y:            { duration: 0.65, ease: EASE_OUT_EXPO },
      opacity:      { duration: 0.25 },
      borderRadius: { duration: 0.5,  ease: "easeOut",   delay: 0.4 },
      height:       { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.4 },
      scaleX:       { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.4 },
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.9 } },
};

export default function NavCards() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Prevent background scrolling when a card is expanded
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedId]);

  return (
    <>
      <motion.div
        className="w-full max-w-4xl px-6 flex flex-row items-end justify-center gap-5 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layoutId={`card-container-${card.id}`}
            onClick={() => setSelectedId(card.id)}
            className="relative flex flex-col justify-end overflow-hidden cursor-pointer"
            style={{
              width: 220,
              background: card.gradient,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 0 40px ${card.glow}, inset 0 0 0 1px rgba(255,255,255,0.05)`,
            }}
            variants={cardVariants}
            whileHover={{ scale: 0.95, transition: { duration: 0.2 } }}
          >
            {/* Top-left glass highlight */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
              }}
            />

            {/* Icon */}
            <motion.div
              layoutId={`icon-container-${card.id}`}
              className="absolute top-0 left-0 right-0 flex items-center justify-center"
              style={{ height: "65%" }}
              variants={contentVariants}
            >
              <motion.span
                layoutId={`icon-${card.id}`}
                className="text-5xl select-none inline-block relative z-10"
                style={{ filter: `drop-shadow(0 0 18px ${card.accent})` }}
              >
                {card.icon}
              </motion.span>
            </motion.div>

            {/* Accent divider */}
            <motion.div
              layoutId={`divider-${card.id}`}
              className="absolute bottom-12 left-5 right-5 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${card.accent}66, transparent)`,
              }}
              variants={contentVariants}
            />

            {/* Label */}
            <motion.div
              className="relative px-5 pb-5 pt-3 flex justify-center w-full"
              variants={contentVariants}
            >
              <motion.p
                layoutId={`title-${card.id}`}
                className="text-sm font-semibold tracking-widest uppercase text-zinc-100 text-center whitespace-nowrap"
                style={{ textShadow: `0 0 14px ${card.accent}99` }}
              >
                {card.label}
              </motion.p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedId && (
          <ExpandedCard
            card={cards.find((c) => c.id === selectedId)!}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ExpandedCard({ card, onClose }: { card: typeof cards[0]; onClose: () => void }) {
  return (
    <motion.div
      layoutId={`card-container-${card.id}`}
      className="fixed inset-0 z-[100] flex flex-col items-center overflow-y-auto"
      style={{
        background: card.gradient,
        borderRadius: "0px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
      />
      
      {/* Top Bar Area */}
      <div className="w-full max-w-7xl mx-auto px-8 pt-12 pb-6 flex flex-row items-center justify-between relative z-10">
        <div className="flex items-center gap-6" style={{ width: "100%" }}>
          <motion.div layoutId={`icon-container-${card.id}`} className="flex items-center justify-center">
            <motion.span
              layoutId={`icon-${card.id}`}
              className="text-6xl select-none inline-block"
              style={{ filter: `drop-shadow(0 0 24px ${card.accent})` }}
            >
              {card.icon}
            </motion.span>
          </motion.div>
          
          <motion.div style={{ flex: 1 }}>
            <motion.h2
              layoutId={`title-${card.id}`}
              className="text-3xl font-bold tracking-widest uppercase text-zinc-100 m-0 leading-none"
              style={{ textShadow: `0 0 14px ${card.accent}99`, width: "max-content" }}
            >
              {card.label}
            </motion.h2>
          </motion.div>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClose}
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-md border border-white/10 transition-colors shadow-lg ml-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-100">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </motion.button>
      </div>

      <motion.div
        layoutId={`divider-${card.id}`}
        className="w-full max-w-7xl mx-auto h-px opacity-30 origin-left"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
        }}
      />

      {/* Expanded Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-7xl mx-auto px-8 py-12 relative z-10 flex-1 flex flex-col"
      >
        {card.id === "disease-predictor" ? (
          <DiseasePredictor />
        ) : card.id === "medical-locator" ? (
          <MedicalLocator />
        ) : card.id === "government-schemes" ? (
          <GovernmentSchemes />
        ) : (
          <div className="bg-zinc-950/40 backdrop-blur-2xl border border-zinc-700/30 rounded-3xl p-10 flex-1 shadow-2xl flex flex-col">
            <p className="text-zinc-300 text-xl font-medium mb-6 animate-pulse">
              Loading {card.label} module...
            </p>
            <div className="w-full max-w-2xl space-y-4">
              <div className="h-4 bg-zinc-800/50 rounded-full w-full"></div>
              <div className="h-4 bg-zinc-800/50 rounded-full w-5/6"></div>
              <div className="h-4 bg-zinc-800/50 rounded-full w-4/6"></div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
