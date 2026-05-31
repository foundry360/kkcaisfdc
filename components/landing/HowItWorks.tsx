"use client";

import { motion } from "framer-motion";
import { howItWorksSteps } from "@/lib/landing-data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#244566]/10 bg-[#244566] p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-5xl">
            <h2 className="text-4xl font-semibold tracking-[-0.015em] text-white sm:text-5xl">
              Three focused steps from contact to clarity.
            </h2>
          </div>
          <a
            href="#lead-capture"
            className="inline-flex w-fit items-center rounded-full bg-[#1BA38E] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#168b7a]"
          >
            Start now
          </a>
        </div>

        <div className="relative mt-12 grid gap-5 lg:grid-cols-3">
          {howItWorksSteps.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group relative rounded-[1.5rem] border border-white/15 bg-white/10 p-6 transition hover:border-[#1BA38E] hover:bg-[#1BA38E]"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full border border-[#1BA38E]/50 bg-white text-lg font-bold text-[#244566] shadow-sm transition group-hover:border-white">
                {item.step}
              </div>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-0.01em] text-white">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-white/75 transition group-hover:text-white">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
