"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { previewCategories } from "@/lib/landing-data";
import type { LeadCaptureValues } from "@/lib/types";

const readinessQuestions = [
  "Do you have a clear executive owner for AI strategy?",
  "Can teams access trusted operational data without heavy manual work?",
  "Are AI use cases prioritized by measurable business impact?"
];

export function AssessmentShell() {
  const [lead, setLead] = useState<LeadCaptureValues | null>(null);

  useEffect(() => {
    const storedLead = window.sessionStorage.getItem("ai-readiness-lead");

    if (storedLead) {
      try {
        setLead(JSON.parse(storedLead) as LeadCaptureValues);
      } catch {
        window.sessionStorage.removeItem("ai-readiness-lead");
      }
    }
  }, []);

  return (
    <main className="min-h-screen overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            &lt;- Back to overview
          </Link>
          <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Assessment Flow
          </span>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-[2.25rem] border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-cyan-950/25 backdrop-blur md:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
                AI Readiness Assessment
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">
                {lead ? `Welcome, ${lead.firstName}.` : "Your assessment is ready."}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                {lead
                  ? `We have your profile for ${lead.company}. The next step is to answer a focused set of readiness questions.`
                  : "Enter your contact information from the landing page to personalize this assessment session."}
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <p className="text-sm font-semibold text-white">Captured profile</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <p>Name: {lead ? `${lead.firstName} ${lead.lastName}` : "Not captured yet"}</p>
                  <p>Email: {lead?.email ?? "Not captured yet"}</p>
                  <p>Company: {lead?.company ?? "Not captured yet"}</p>
                  <p>Address: {lead?.address ?? "Not captured yet"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Readiness categories</p>
                <p className="text-sm text-white/45">Step 1 of 5</p>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full w-1/5 rounded-full bg-cyan-300" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {previewCategories.map((category) => (
                  <div
                    key={category}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-medium text-white/70"
                  >
                    {category}
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-4">
                {readinessQuestions.map((question) => (
                  <div key={question} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <p className="text-white">{question}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {["Not yet", "Planning", "In progress", "Mature"].map((answer) => (
                        <button
                          key={answer}
                          type="button"
                          className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:border-cyan-200/40 hover:bg-cyan-300/10 hover:text-white"
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-7 w-full rounded-full bg-cyan-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Continue Assessment
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
