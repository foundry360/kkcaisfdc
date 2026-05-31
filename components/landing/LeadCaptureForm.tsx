"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import type { LeadCaptureValues } from "@/lib/types";

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
    placeholder: "Acme Health Partners"
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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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
    setSubmissionError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to start your assessment.");
      }

      setLeadSnapshot(data);
      window.sessionStorage.setItem("ai-readiness-lead", JSON.stringify(data));
      router.push("/assessment");
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to start your assessment."
      );
    }
  };

  return (
    <section id="lead-capture" className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="rounded-[2rem] border border-[#173244]/10 bg-[#f8fafc] p-8 shadow-sm lg:p-10"
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-[0.02em] text-[#244566] sm:text-4xl">
            Begin your evolution with a readiness baseline.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#4f646d]">
            Kona Kai collects your details first so the assessment can be personalized around your
            organization and prepared for follow-up guidance from an experienced consulting team.
          </p>
          <div className="mt-8 rounded-3xl border border-[#173244]/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1ba38e]">
              What happens next
            </p>
            <ul className="mt-5 space-y-4 text-[#4f646d]">
              {[
                "Your profile is saved locally for this session.",
                "You are routed directly into the assessment flow.",
                "A future API can send submissions to Kona Kai's CRM or intake workflow."
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1BA38E]" />
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
          className="rounded-[2rem] border border-[#173244]/10 bg-white p-6 shadow-xl shadow-[#173244]/10 md:p-8"
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
                  <span className="text-sm font-semibold text-[#173244]">{field.label}</span>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(message)}
                    className="mt-2 w-full rounded-2xl border border-[#173244]/12 bg-[#f3f4f6] px-4 py-4 text-[#173244] outline-none transition placeholder:text-[#8a979c] focus:border-[#2c6f7c]/50 focus:bg-white focus:ring-4 focus:ring-[#2c6f7c]/10"
                    {...register(field.name, validation)}
                  />
                  {message ? (
                    <span className="mt-2 block text-sm text-rose-700">{message}</span>
                  ) : null}
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#244566] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#244566]/20 transition hover:-translate-y-0.5 hover:bg-[#315a83] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Preparing Assessment..." : "Start Your Assessment"}
          </button>
          <p className="mt-4 text-center text-sm text-[#6f7f86]">
            {leadSnapshot
              ? `Preparing a personalized flow for ${leadSnapshot.company}.`
              : "Your details submit securely to the backend before the assessment starts."}
          </p>
          {submissionError ? (
            <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">
              {submissionError}
            </p>
          ) : null}
        </motion.form>
      </div>
    </section>
  );
}
