"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Scheme {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  eligibility: string[];
  link: string;
  icon: string;
  color: string;
}

const mockSchemes: Scheme[] = [
  {
    id: "s1",
    name: "Ayushman Bharat (PM-JAY)",
    shortDesc: "World's largest health insurance/assurance scheme.",
    description: "Pradhan Mantri Jan Arogya Yojana (PM-JAY) aims to provide a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization to over 10.74 crores poor and vulnerable families.",
    eligibility: [
      "Must belong to socio-economic caste census (SECC) 2011 categories.",
      "Families with no adult male member between 16 and 59 years.",
      "Landless households deriving major part of their income from manual casual labor.",
      "Destitute and those living on alms."
    ],
    link: "https://pmjay.gov.in/",
    icon: "🏥",
    color: "from-orange-500/20 to-rose-500/20"
  },
  {
    id: "s2",
    name: "Central Government Health Scheme (CGHS)",
    shortDesc: "Comprehensive medical care for Central Government employees.",
    description: "CGHS provides comprehensive health care facilities for Central Govt. employees and pensioners and their dependents residing in CGHS covered cities through Allopathic, Homeopathic, and AYUSH systems of medicines.",
    eligibility: [
      "All Central Government employees drawing salary from Central Civil Estimates.",
      "Central Government Pensioners/family pensioners.",
      "Sitting and Ex-Members of Parliament.",
      "Freedom Fighters."
    ],
    link: "https://cghs.gov.in/",
    icon: "🏛️",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: "s3",
    name: "Aam Aadmi Bima Yojana (AABY)",
    shortDesc: "Social security scheme for rural landless households.",
    description: "AABY is a social security scheme administered through LIC, offering life insurance protection to the rural and urban poor persons living below the poverty line and marginally above the poverty line.",
    eligibility: [
      "Aged between 18 and 59 years.",
      "Must belong to one of the 48 recognized vocational/occupational groups.",
      "Head of the family or one earning member in the family."
    ],
    link: "https://licindia.in/",
    icon: "🌾",
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: "s4",
    name: "Pradhan Mantri Suraksha Bima Yojana",
    shortDesc: "Accident insurance scheme with a premium of Rs. 20/year.",
    description: "An accident insurance scheme providing accidental death and disability cover for death or disability on account of an accident. Highly affordable and accessible through direct bank-auto debit.",
    eligibility: [
      "Individuals aged between 18 and 70 years.",
      "Must hold a functional savings bank account.",
      "Must give consent to join / enable auto-debit."
    ],
    link: "https://jansuraksha.gov.in/",
    icon: "🛡️",
    color: "from-purple-500/20 to-pink-500/20"
  }
];

export default function GovernmentSchemes() {
  const [expandedId, setExpandedId] = useState<string | null>(mockSchemes[0].id);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow bg behind sidebar */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Healthcare Schemes</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore national and state-level government programs designed to provide financial aid, insurance coverage, and free medical care for eligible citizens.
            </p>
          </div>

          <div className="space-y-4">
            {mockSchemes.map((scheme) => {
              const isExpanded = expandedId === scheme.id;

              return (
                <div
                  key={scheme.id}
                  className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isExpanded
                      ? "bg-zinc-800/80 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleAccordion(scheme.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${scheme.color} border border-white/5`}>
                        {scheme.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold transition-colors ${isExpanded ? "text-purple-400" : "text-zinc-100"}`}>
                          {scheme.name}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1 hidden md:block">
                          {scheme.shortDesc}
                        </p>
                      </div>
                    </div>
                    <div className="text-zinc-500 ml-4">
                      <motion.svg
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </motion.svg>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-zinc-700/50 mt-2">
                          <p className="text-zinc-300 leading-relaxed mb-6">
                            {scheme.description}
                          </p>

                          <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                            {/* Left: Eligibility */}
                            <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800/60">
                              <h4 className="text-sm font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-2">
                                <span className="text-purple-500">📋</span> Eligibility Criteria
                              </h4>
                              <ul className="space-y-2">
                                {scheme.eligibility.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                                    <span className="text-purple-500 mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col justify-center items-center gap-4 bg-gradient-to-br from-zinc-800/30 to-zinc-900/50 rounded-xl p-6 border border-zinc-800/60 text-center">
                              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl mb-2 border border-purple-500/30">
                                🔗
                              </div>
                              <div>
                                <h4 className="font-semibold text-zinc-200 mb-1">Ready to Apply?</h4>
                                <p className="text-xs text-zinc-400 mb-4 px-2">Submit your application on the official government portal.</p>
                              </div>
                              <a
                                href={scheme.link}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
                              >
                                Apply Here <span>↗</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
