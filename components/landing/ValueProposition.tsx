"use client";

import { motion } from "framer-motion";
import { valueCards } from "@/lib/landing-data";

export function ValueProposition() {
  return (
    <section id="value" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-semibold leading-tight tracking-[0.02em] text-[#244566] sm:text-4xl">
            A practical assessment built for transformation leaders, not technology theater.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#4f646d]">
            Kona Kai evaluates the operational foundation that determines whether AI can deliver
            durable business value across teams, workflows, systems, and customers.
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
              className="group rounded-[1.75rem] border border-[#173244]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1BA38E]/50 hover:shadow-xl hover:shadow-[#173244]/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1BA38E]">
                {card.eyebrow}
              </p>
              <h3 className="mt-5 text-[0.95rem] font-semibold leading-snug tracking-normal text-[#173244] xl:text-[1rem]">
                {card.title}
              </h3>
              <p className="mt-4 leading-7 text-[#4f646d]">{card.description}</p>
              <div className="mt-7 h-1.5 rounded-full bg-[#1BA38E]/50 transition group-hover:bg-[#1BA38E]" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
