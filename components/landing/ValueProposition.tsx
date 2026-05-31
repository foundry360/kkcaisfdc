"use client";

import { motion } from "framer-motion";
import { valueCards } from "@/lib/landing-data";
import { SectionBadge } from "./SectionBadge";

export function ValueProposition() {
  return (
    <section id="value" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge>From curiosity to confident execution</SectionBadge>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            A readiness assessment designed to create momentum, not more noise.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The experience is structured around the decisions leaders need to make before
            launching AI initiatives at scale.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="group rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-slate-950/20 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-200/25 hover:bg-white/[0.07]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                {card.eyebrow}
              </p>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
                {card.title}
              </h3>
              <p className="mt-4 leading-7 text-slate-300">{card.description}</p>
              <div className="mt-7 h-12 rounded-2xl bg-gradient-to-r from-cyan-300/20 via-indigo-400/15 to-fuchsia-400/20 opacity-70 blur-xl transition group-hover:opacity-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
