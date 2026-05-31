"use client";

import { motion } from "framer-motion";
import { SectionBadge } from "./SectionBadge";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-70" />
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur md:p-5">
        <a href="#" className="flex items-center gap-3" aria-label="KKC AI home">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-cyan-400/20">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-white/80">KKC AI</p>
            <p className="text-xs text-white/45">Readiness Intelligence</p>
          </div>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a className="transition hover:text-white" href="#value">
            Value
          </a>
          <a className="transition hover:text-white" href="#how-it-works">
            Process
          </a>
          <a className="transition hover:text-white" href="#lead-capture">
            Assessment
          </a>
        </nav>
        <a
          href="#lead-capture"
          className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200/40 hover:bg-white/15"
        >
          Start
        </a>
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 pb-20 pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <SectionBadge>AI readiness assessment for modern enterprise teams</SectionBadge>
          <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Know exactly where your company is ready for AI transformation.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Capture your organization&apos;s AI maturity, uncover the highest-value opportunities,
            and get a practical roadmap built around strategy, data, governance, and adoption.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#lead-capture"
              className="group inline-flex items-center justify-center rounded-full bg-cyan-300 px-7 py-4 text-base font-bold text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.3)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Start Assessment
              <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
            </a>
            <a
              href="#value"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-7 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]"
            >
              Learn More
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm text-white/55">
            <div>
              <p className="text-2xl font-semibold text-white">12 min</p>
              <p>average completion</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">5</p>
              <p>readiness dimensions</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">1</p>
              <p>actionable roadmap</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="relative min-h-[34rem]"
        >
          <div className="mesh-glow absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg,rgba(34,211,238,0.48),rgba(99,102,241,0.42),rgba(217,70,239,0.36),rgba(34,211,238,0.48))] blur-3xl" />
          <div className="absolute inset-6 rounded-[2rem] border border-cyan-200/10 bg-slate-950/35 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl" />
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/14 via-white/[0.04] to-white/[0.02] p-5 backdrop-blur">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">
                  Readiness Engine
                </p>
                <p className="mt-1 text-sm font-semibold text-white">Live maturity model</p>
              </div>
              <div className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-medium text-emerald-200">
                Active
              </div>
            </div>

            <div className="relative mt-8 grid aspect-square place-items-center rounded-[2rem] border border-white/10 bg-slate-950/50">
              <div className="absolute h-72 w-72 rounded-full border border-cyan-200/10" />
              <div className="absolute h-52 w-52 rounded-full border border-fuchsia-200/10" />
              <div className="orbit-dot absolute h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_28px_rgba(103,232,249,0.95)]" />
              <div className="grid h-40 w-40 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-center shadow-2xl shadow-cyan-950/40 backdrop-blur">
                <div>
                  <p className="text-5xl font-semibold tracking-tight text-white">82</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-cyan-100/70">
                    AI Score
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Strategy", "Data", "Governance"].map((label, index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${84 - index * 12}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
