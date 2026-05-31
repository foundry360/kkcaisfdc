"use client";

import { motion } from "framer-motion";
import { howItWorksSteps } from "@/lib/landing-data";
import { SectionBadge } from "./SectionBadge";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <SectionBadge>How it works</SectionBadge>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Three focused steps from lead capture to AI readiness clarity.
            </h2>
          </div>
          <a
            href="#lead-capture"
            className="inline-flex w-fit items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
          >
            Start now
          </a>
        </div>

        <div className="relative mt-12 grid gap-5 lg:grid-cols-3">
          <div className="absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent lg:block" />
          {howItWorksSteps.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-lg font-bold text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                {item.step}
              </div>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em] text-white">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
