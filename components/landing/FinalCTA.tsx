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
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-[#244566]/10 bg-[#244566] px-6 py-16 text-center shadow-xl shadow-[#173244]/10 sm:px-10"
      >
        <div className="mesh-glow absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1BA38E]/18 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1ba38e]">
          Ready to validate your AI maturity?
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[0.02em] text-white sm:text-4xl">
          Turn AI ambition into an executable roadmap.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
          Start with a focused assessment, then use the results to move from uncertainty to
          implementation with clarity, structure, and confidence.
        </p>
        <a
          href="#lead-capture"
          className="mt-9 inline-flex items-center justify-center rounded-full bg-[#1BA38E] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#1BA38E]/20 transition hover:-translate-y-0.5 hover:bg-[#168b7a]"
        >
          Get Your AI Readiness Score
        </a>
      </motion.div>
    </section>
  );
}
