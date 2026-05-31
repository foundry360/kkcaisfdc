"use client";

import { motion } from "framer-motion";
import { companyLogos } from "@/lib/landing-data";

export function TrustBar() {
  return (
    <section className="px-6 pb-16 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-7 backdrop-blur"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-sm text-sm font-medium uppercase tracking-[0.26em] text-white/45">
            Built for modern enterprise teams evaluating AI responsibly
          </p>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-5">
            {companyLogos.map((company) => (
              <div
                key={company}
                className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-center text-sm font-semibold text-white/50 transition hover:border-cyan-200/25 hover:text-white"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
