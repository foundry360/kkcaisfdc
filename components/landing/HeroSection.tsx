"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#173244]/10 bg-white/90 p-3 shadow-sm backdrop-blur md:p-4">
        <a href="#" className="flex items-center" aria-label="Kona Kai Corporation home">
          <Image
            src="/kona-kai-logo.png"
            alt="Kona Kai Corporation"
            width={238}
            height={40}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#5e7078] md:flex">
          <a className="transition hover:text-[#173244]" href="#value">
            Value
          </a>
          <a className="transition hover:text-[#173244]" href="#how-it-works">
            Process
          </a>
          <a className="transition hover:text-[#173244]" href="#lead-capture">
            Assessment
          </a>
        </nav>
        <a
          href="#lead-capture"
          className="rounded-full bg-[#244566] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#315a83]"
        >
          Get Started
        </a>
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 pb-20 pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="max-w-5xl text-4xl font-semibold tracking-[0.015em] text-[#244566] sm:text-5xl lg:text-6xl">
            Start an evolution toward responsible AI execution.
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[#4f646d] sm:text-xl">
            Kona Kai helps organizations move from AI uncertainty to clarity with a practical
            assessment across people, processes, platforms, data, governance, and business outcomes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#lead-capture"
              className="group inline-flex items-center justify-center rounded-full bg-[#244566] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#244566]/20 transition hover:-translate-y-0.5 hover:bg-[#315a83]"
            >
              Start Assessment
              <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
            </a>
            <a
              href="#value"
              className="inline-flex items-center justify-center rounded-full border border-[#173244]/15 bg-white px-7 py-4 text-base font-semibold text-[#173244] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2c6f7c]/30 hover:bg-[#f8fafc]"
            >
              Learn More
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm text-[#6f7f86]">
            <div>
              <p className="text-2xl font-semibold text-[#173244]">12 min</p>
              <p>average completion</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#173244]">5</p>
              <p>business dimensions</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#173244]">1</p>
              <p>evolution roadmap</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="relative"
        >
          <div className="mesh-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg,rgba(48,139,150,0.16),rgba(226,152,62,0.18),rgba(23,50,68,0.1),rgba(48,139,150,0.16))] blur-3xl" />
          <div className="rounded-[2rem] border border-[#173244]/10 bg-white/95 p-4 shadow-2xl shadow-[#173244]/10 sm:p-5">
            <div className="flex items-center justify-between rounded-3xl border border-[#173244]/10 bg-[#f8fafc] px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#1ba38e]">
                  Proceed With Confidence
                </p>
                <p className="mt-1 text-sm font-semibold text-[#173244]">
                  AI readiness baseline
                </p>
              </div>
              <div className="rounded-full bg-[#e9f5f4] px-3 py-1 text-xs font-semibold text-[#2c6f7c]">
                Guided
              </div>
            </div>

            <div className="relative mt-5 grid h-72 place-items-center overflow-hidden rounded-[2rem] border border-[#173244]/10 bg-gradient-to-br from-[#f3f4f6] to-white sm:h-80 lg:h-[21rem]">
              <div className="absolute h-56 w-56 rounded-full border border-[#2c6f7c]/15 sm:h-64 sm:w-64" />
              <div className="absolute h-40 w-40 rounded-full border border-[#1BA38E]/20 sm:h-48 sm:w-48" />
              <div className="orbit-dot absolute h-3 w-3 rounded-full bg-[#1BA38E] shadow-[0_0_22px_rgba(27,163,142,0.75)]" />
              <div className="grid h-32 w-32 place-items-center rounded-full border border-[#173244]/10 bg-white text-center shadow-xl shadow-[#173244]/10 sm:h-36 sm:w-36">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-[#173244] sm:text-5xl">
                    82
                  </p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.22em] text-[#2c6f7c] sm:text-xs">
                    AI Score
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["People", "Process", "Data"].map((label, index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#173244]/10 bg-[#f8fafc] p-3 sm:p-4"
                >
                  <div className="h-1.5 rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[#1BA38E]"
                      style={{ width: `${84 - index * 12}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#173244]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
