"use client";

import { motion } from "framer-motion";
import { previewCategories, sampleQuestions } from "@/lib/landing-data";
import { SectionBadge } from "./SectionBadge";

export function AssessmentPreview() {
  return (
    <section className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
        >
          <SectionBadge>Assessment preview</SectionBadge>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Intelligent prompts that adapt to the way your organization operates.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The assessment combines executive-level strategy questions with practical operating
            inputs, helping leaders connect ambition to current capability.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {previewCategories.map((category) => (
              <div
                key={category}
                className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white/70"
              >
                {category}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/25 backdrop-blur"
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/60">
                Question Set
              </p>
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                Personalized
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {sampleQuestions.map((question, index) => (
                <div key={question} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{question}</p>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((score) => (
                          <div
                            key={score}
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-300/30 to-fuchsia-300/30"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
