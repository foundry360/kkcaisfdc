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
        className="mx-auto max-w-7xl rounded-[2rem] border border-[#244566]/10 bg-[#244566] px-6 py-7 shadow-sm"
      >
        <div className="flex flex-col gap-5">
          <p className="mx-auto max-w-3xl text-center text-sm font-semibold uppercase tracking-[0.26em] text-white">
            Nearly 20 years helping organizations evolve through technology, process, and people
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {companyLogos.map((company) => (
              <div
                key={company}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-[#1BA38E]/60 hover:bg-white hover:text-[#244566]"
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
