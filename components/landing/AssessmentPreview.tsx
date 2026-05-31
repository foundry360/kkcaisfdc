"use client";

import { motion } from "framer-motion";
import { previewCategories, sampleQuestions } from "@/lib/landing-data";

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
          <h2 className="text-3xl font-semibold leading-tight tracking-[0.02em] text-[#244566] sm:text-4xl">
            Business-first prompts that examine how work really happens.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#4f646d]">
            The assessment uses Kona Kai&apos;s day-in-the-life lens to connect AI ambition with
            decision patterns, workflow friction, platform realities, and adoption risk.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {previewCategories.map((category) => (
              <div
                key={category}
                className="rounded-2xl border border-[#173244]/10 bg-white px-4 py-3 text-sm font-semibold text-[#4f646d] shadow-sm"
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
          className="rounded-[2rem] border border-[#173244]/10 bg-white p-5 shadow-xl shadow-[#173244]/10"
        >
          <div className="rounded-[1.5rem] border border-[#173244]/10 bg-[#f8fafc] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1ba38e]">
                Question Set
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2c6f7c] shadow-sm">
                Personalized
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {sampleQuestions.map((question, index) => (
                <div key={question} className="rounded-2xl border border-[#173244]/10 bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e9f5f4] text-sm font-semibold text-[#2c6f7c]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#173244]">{question}</p>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((score) => (
                          <div
                            key={score}
                            className="h-2 rounded-full bg-gradient-to-r from-[#2c6f7c]/25 to-[#1BA38E]/35"
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
