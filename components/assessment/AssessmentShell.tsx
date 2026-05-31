"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { previewCategories } from "@/lib/landing-data";
import type { LeadCaptureValues } from "@/lib/types";

const readinessQuestions = [
  "Do you have clear ownership for AI strategy, governance, and business outcomes?",
  "Can teams access trusted operational data without heavy manual work?",
  "Are AI opportunities prioritized by workflow value and adoption readiness?"
];

function subscribeToLeadStore() {
  return () => undefined;
}

function getStoredLead() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLead = window.sessionStorage.getItem("ai-readiness-lead");

  if (!storedLead) {
    return null;
  }

  try {
    return JSON.parse(storedLead) as LeadCaptureValues;
  } catch {
    window.sessionStorage.removeItem("ai-readiness-lead");
    return null;
  }
}

export function AssessmentShell() {
  const lead = useSyncExternalStore(subscribeToLeadStore, getStoredLead, () => null);

  return (
    <main className="min-h-screen overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-[#173244]/10 bg-white/90 p-4 shadow-sm">
          <Link href="/" className="text-sm font-semibold text-[#4f646d] transition hover:text-[#173244]">
            &lt;- Back to overview
          </Link>
          <span className="rounded-full bg-[#f1f5f9] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#2c6f7c]">
            Kona Kai Assessment
          </span>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-[2.25rem] border border-[#173244]/10 bg-white p-6 shadow-xl shadow-[#173244]/10 md:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2c6f7c]">
                AI Readiness Assessment
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.015em] text-[#173244] sm:text-6xl">
                {lead ? `Welcome, ${lead.firstName}.` : "Your assessment is ready."}
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#4f646d]">
                {lead
                  ? `We have your profile for ${lead.company}. The next step is to answer a focused set of Kona Kai readiness questions.`
                  : "Enter your contact information from the landing page to personalize this assessment session."}
              </p>

              <div className="mt-8 rounded-3xl border border-[#173244]/10 bg-[#f8fafc] p-5">
                <p className="text-sm font-semibold text-[#173244]">Captured profile</p>
                <div className="mt-4 grid gap-3 text-sm text-[#4f646d]">
                  <p>Name: {lead ? `${lead.firstName} ${lead.lastName}` : "Not captured yet"}</p>
                  <p>Email: {lead?.email ?? "Not captured yet"}</p>
                  <p>Company: {lead?.company ?? "Not captured yet"}</p>
                  <p>Address: {lead?.address ?? "Not captured yet"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#173244]/10 bg-[#f3f4f6] p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#173244]">Readiness categories</p>
                <p className="text-sm text-[#6f7f86]">Step 1 of 5</p>
              </div>
              <div className="mt-5 h-2 rounded-full bg-[#e5e7eb]">
                <div className="h-full w-1/5 rounded-full bg-[#1BA38E]" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {previewCategories.map((category) => (
                  <div
                    key={category}
                    className="rounded-2xl border border-[#173244]/10 bg-white p-4 text-sm font-semibold text-[#4f646d]"
                  >
                    {category}
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-4">
                {readinessQuestions.map((question) => (
                  <div key={question} className="rounded-2xl border border-[#173244]/10 bg-white p-4">
                    <p className="text-[#173244]">{question}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {["Not yet", "Planning", "In progress", "Mature"].map((answer) => (
                        <button
                          key={answer}
                          type="button"
                          className="rounded-full border border-[#173244]/10 bg-[#f8fafc] px-3 py-2 text-sm text-[#4f646d] transition hover:border-[#1BA38E]/55 hover:bg-white hover:text-[#173244]"
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
                className="mt-7 w-full rounded-full bg-[#244566] px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#315a83]"
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
