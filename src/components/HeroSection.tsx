"use client";
import { motion, Variants } from "framer-motion";

export default function HeroSection() {
  // 1. Configuration for Medinexus text
  const textContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 2.2, // Waits for the heart to finish glowing
      },
    },
  };

  const letterVariant: Variants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 200 }
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-zinc-950 overflow-hidden">

      {/* 1. The Sequenced Image: Converge -> Wait -> Glow */}
      <motion.div
        animate={{
          scale: [1.3, 1, 1],
          opacity: [0, 1, 1],
          filter: [
            "blur(20px) drop-shadow(0px 0px 0px rgba(225,29,72,0))",
            "blur(0px) drop-shadow(0px 0px 0px rgba(225,29,72,0))",
            "blur(0px) drop-shadow(0px 0px 100px rgba(225,29,72,0.7))"
          ]
        }}
        transition={{
          duration: 2,
          times: [0, 0.5, 1],
          ease: "easeInOut"
        }}
        className="absolute z-0 flex items-center justify-center w-full h-full pointer-events-none"
      >
        <img
          src="/heart-stethoscope.png"
          alt="Medinexus Heart"
          className="w-[90vw] md:w-[70vw] max-w-[1000px] object-contain opacity-90"
        />
      </motion.div>

      {/* 2. The Split Layered Text */}
      <motion.div
        variants={textContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-[1400px] items-center justify-center px-6 md:px-24 text-6xl md:text-[9rem] lg:text-[11rem] font-extrabold tracking-tighter"
      >
        {/* The White "Medi" (Pushed Left with Margin) */}
        <span className="flex text-white drop-shadow-2xl mr-[20vw]">
          {["M", "e", "d", "i"].map((char, index) => (
            <motion.span key={index} variants={letterVariant}>
              {char}
            </motion.span>
          ))}
        </span>

        {/* The Red "nexus" (Sits on the Right) */}
        <span className="flex text-rose-600 drop-shadow-2xl">
          {["n", "e", "x", "u", "s"].map((char, index) => (
            <motion.span key={index} variants={letterVariant}>
              {char}
            </motion.span>
          ))}
        </span>
      </motion.div>




    </div>
  );
}