"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import type { LeadCaptureValues } from "@/lib/types";
import { SectionBadge } from "./SectionBadge";

const fields: Array<{
  name: keyof LeadCaptureValues;
  label: string;
  type: string;
  placeholder: string;
}> = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Avery"
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Stone"
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "avery@company.com"
  },
  {
    name: "company",
    label: "Company",
    type: "text",
    placeholder: "Northstar Analytics"
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "123 Market Street, San Francisco, CA"
  }
];

export function LeadCaptureForm() {
  const router = useRouter();
  const [leadSnapshot, setLeadSnapshot] = useState<LeadCaptureValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LeadCaptureValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      address: ""
    }
  });

  const onSubmit = async (data: LeadCaptureValues) => {
    setLeadSnapshot(data);

    // Temporary client-side persistence keeps the next route ready for API integration later.
    window.sessionStorage.setItem("ai-readiness-lead", JSON.stringify(data));
    router.push("/assessment");
  };

  return (
    <section id="lead-capture" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/12 via-white/[0.05] to-fuchsia-400/10 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur lg:p-10"
        >
          <SectionBadge>Start with your contact information</SectionBadge>
          <h2 className="mt-7 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Unlock your AI readiness score in one focused assessment.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            We collect your details first so the assessment can generate a personalized profile,
            route recommendations to the right team, and support a future report delivery workflow.
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/60">
              What happens next
            </p>
            <ul className="mt-5 space-y-4 text-slate-300">
              {[
                "Your profile is saved locally for this session.",
                "You are routed directly into the assessment flow.",
                "Backend/API integration can be connected at this submission point."
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-slate-950/25 backdrop-blur md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => {
              const message = errors[field.name]?.message;
              const validation =
                field.name === "email"
                  ? {
                      required: `${field.label} is required`,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address"
                      }
                    }
                  : {
                      required: `${field.label} is required`,
                      minLength: {
                        value: 2,
                        message: `${field.label} must be at least 2 characters`
                      }
                    };

              return (
                <label
                  key={field.name}
                  className={field.name === "address" ? "md:col-span-2" : undefined}
                >
                  <span className="text-sm font-medium text-white/75">{field.label}</span>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(message)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-cyan-300/10"
                    {...register(field.name, validation)}
                  />
                  {message ? (
                    <span className="mt-2 block text-sm text-rose-200">{message}</span>
                  ) : null}
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-cyan-300 px-7 py-4 text-base font-bold text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.22)] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Preparing Assessment..." : "Start Your Assessment"}
          </button>
          <p className="mt-4 text-center text-sm text-white/45">
            {leadSnapshot
              ? `Preparing a personalized flow for ${leadSnapshot.company}.`
              : "No spam. No backend submission yet. Your data stays in this browser session."}
          </p>
        </motion.form>
      </div>
    </section>
  );
}
