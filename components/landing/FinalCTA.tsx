"use client";

import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="px-6 py-20 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.055] px-6 py-16 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur sm:px-10"
      >
        <div className="mesh-glow absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/25 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
          Make AI investment decisions with clarity
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">
          Get your AI readiness score before your next initiative begins.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Start with a focused assessment, then turn the results into a prioritized roadmap your
          team can act on.
        </p>
        <a
          href="#lead-capture"
          className="mt-9 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-slate-950 shadow-[0_20px_70px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
        >
          Get Your AI Readiness Score
        </a>
      </motion.div>
    </section>
  );
}
