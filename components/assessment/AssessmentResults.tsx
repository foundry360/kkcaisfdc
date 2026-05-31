"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  assessmentResultsStorageKey,
  type AssessmentResultPayload
} from "@/lib/assessment-results";

let cachedResult: AssessmentResultPayload | null = null;
let cachedResultJson: string | null = null;

const sampleResult: AssessmentResultPayload = {
  lead: {
    firstName: "Taylor",
    lastName: "Morgan",
    email: "taylor.morgan@example.com",
    company: "Example Financial Services",
    address: "123 Market Street, San Francisco, CA"
  },
  answers: [],
  score: 62,
  readinessLabel: "Moderate Health, High Potential",
  completedAt: new Date().toISOString(),
  summary: {
    summary:
      "Example Financial Services shows an emerging AI readiness foundation with meaningful progress in leadership alignment and vendor oversight. The most important gaps are policy maturity, risk tiering, evidence collection, and monitoring practices that can support responsible scaling.",
    overview:
      "This sample output illustrates how the completed assessment will translate user responses into an executive-ready readiness view. The organization appears ready to move from informal AI activity toward a more governed operating model with clearer ownership, controls, and roadmap sequencing.",
    recommendations: [
      "Formalize AI decision rights, policy ownership, and approval standards before expanding use cases.",
      "Prioritize risk assessment, data governance, and model monitoring controls for high-impact AI workflows.",
      "Create a 90-day roadmap that converts governance gaps into accountable workstreams."
    ],
    domainBreakdowns: [
      {
        category: "Strategy & Leadership",
        score: 74,
        finding:
          "Leadership alignment is forming, but board-level reporting and executive ownership need to become more explicit.",
        recommendations: [
          "Name an executive owner for AI strategy, risk acceptance, and roadmap accountability.",
          "Add AI readiness, risk, and performance updates to recurring leadership or board reporting."
        ]
      },
      {
        category: "Policy & Standards",
        score: 48,
        finding:
          "AI usage standards appear early and may not yet give employees clear direction on acceptable use, approvals, and documentation.",
        recommendations: [
          "Create a practical AI acceptable-use policy for employees and business teams.",
          "Define approval expectations for internal tools, customer-facing AI, vendor AI, and GenAI use."
        ]
      },
      {
        category: "Risk Management",
        score: 55,
        finding:
          "Risk practices are emerging, but AI use cases need consistent assessment, tiering, and escalation thresholds.",
        recommendations: [
          "Introduce an AI risk intake and tiering process before new use cases go live.",
          "Connect AI risks to the enterprise risk register with clear ownership and escalation rules."
        ]
      },
      {
        category: "Model Lifecycle & Validation",
        score: 58,
        finding:
          "Model inventory and validation controls are partially in place but may not yet provide independent challenge for high-risk models.",
        recommendations: [
          "Create a production AI inventory with owner, version, risk tier, and model card details.",
          "Require independent validation for high-risk models before deployment."
        ]
      },
      {
        category: "Ethics, Fairness & Equity",
        score: 52,
        finding:
          "Fairness and human review expectations need stronger thresholds, documentation, and customer impact controls.",
        recommendations: [
          "Define fairness testing thresholds for customer-facing or high-impact AI systems.",
          "Document when human review, plain-language explanations, and appeal paths are required."
        ]
      },
      {
        category: "Data Governance For AI",
        score: 64,
        finding:
          "Data governance provides a useful starting point, but sensitive training data and decision logging need stronger traceability.",
        recommendations: [
          "Inventory sensitive data used for AI training and confirm legal basis, access, and de-identification controls.",
          "Retain AI inputs and outputs at a level that supports auditability and decision reconstruction."
        ]
      },
      {
        category: "Vendor & Third-Party AI",
        score: 67,
        finding:
          "Vendor AI oversight is improving, though due diligence and public GenAI controls should be made more consistent.",
        recommendations: [
          "Add AI-specific questions, audit rights, and model-change notification expectations to vendor review.",
          "Use approved tool lists, training, and DLP controls to reduce sensitive data exposure in public GenAI tools."
        ]
      },
      {
        category: "Monitoring & Incident Response",
        score: 50,
        finding:
          "Monitoring and incident response practices need clearer owners, alerts, and tested playbooks before AI scale increases.",
        recommendations: [
          "Define drift, fairness, leakage, and incident monitoring requirements for production AI.",
          "Test AI incident response procedures with business, legal, risk, security, and technology stakeholders."
        ]
      }
    ],
    roadmap: [
      {
        priority: "First",
        focus: "Policy and risk foundation",
        actions: [
          "Create AI acceptable-use, approval, and documentation standards.",
          "Launch a risk intake and tiering process for new AI use cases."
        ]
      },
      {
        priority: "Next",
        focus: "Data, model, and vendor controls",
        actions: [
          "Build inventories for production AI systems, sensitive training data, and third-party AI tools.",
          "Define validation, logging, and vendor diligence requirements for high-risk AI."
        ]
      },
      {
        priority: "Then",
        focus: "Monitoring and accountable scale",
        actions: [
          "Implement monitoring requirements for drift, fairness, leakage, and incidents.",
          "Review progress with executive sponsors and convert the roadmap into an operating rhythm."
        ]
      }
    ]
  }
};

function subscribeToResultsStore() {
  return () => undefined;
}

function getStoredResult() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedResult = window.sessionStorage.getItem(assessmentResultsStorageKey);

  if (!storedResult) {
    cachedResult = null;
    cachedResultJson = null;
    return null;
  }

  if (storedResult === cachedResultJson) {
    return cachedResult;
  }

  try {
    cachedResult = JSON.parse(storedResult) as AssessmentResultPayload;
    cachedResultJson = storedResult;

    return cachedResult;
  } catch {
    window.sessionStorage.removeItem(assessmentResultsStorageKey);
    cachedResult = null;
    cachedResultJson = null;
    return null;
  }
}

function getScoreTone(score: number) {
  if (score >= 75) {
    return "#00BFA6";
  }

  if (score >= 55) {
    return "#F5B942";
  }

  return "#FF5A5F";
}

function DonutChart({
  score,
  label,
  size = "large"
}: {
  score: number;
  label: string;
  size?: "large" | "small";
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreTone(clampedScore);
  const sizeClass = size === "large" ? "h-40 w-40" : "h-20 w-20";
  const innerClass = size === "large" ? "h-28 w-28" : "h-14 w-14";
  const scoreClass = size === "large" ? "text-4xl" : "text-base";

  return (
    <div
      className={`relative grid ${sizeClass} shrink-0 place-items-center rounded-full`}
      style={{
        background: `conic-gradient(${color} ${clampedScore * 3.6}deg, #dbe3ea 0deg)`
      }}
      aria-label={`${label}: ${clampedScore} out of 100`}
    >
      <div className={`grid ${innerClass} place-items-center rounded-full bg-white text-center shadow-inner`}>
        <div>
          <p className={`${scoreClass} font-semibold text-[#244566]`}>{clampedScore}</p>
        </div>
      </div>
    </div>
  );
}

function getRecommendationLabel(recommendation: string) {
  const normalizedRecommendation = recommendation.toLowerCase();

  if (normalizedRecommendation.includes("ownership") || normalizedRecommendation.includes("decision")) {
    return "Governance Focus";
  }

  if (
    normalizedRecommendation.includes("risk") ||
    normalizedRecommendation.includes("control") ||
    normalizedRecommendation.includes("monitoring")
  ) {
    return "Risk Focus";
  }

  if (
    normalizedRecommendation.includes("roadmap") ||
    normalizedRecommendation.includes("90-day") ||
    normalizedRecommendation.includes("workstream")
  ) {
    return "Roadmap Focus";
  }

  if (normalizedRecommendation.includes("policy") || normalizedRecommendation.includes("standard")) {
    return "Policy Focus";
  }

  return "Priority Focus";
}

export function AssessmentResults() {
  const storedResult = useSyncExternalStore(subscribeToResultsStore, getStoredResult, () => null);
  const result = storedResult ?? sampleResult;
  const isSampleResult = !storedResult;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl rounded-[2.25rem] border border-[#173244]/10 bg-white p-4 shadow-xl shadow-[#173244]/10 md:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a href="https://konakaicorp.com" aria-label="Kona Kai Corporation home">
            <Image
              src="/kona-kai-logo.png"
              alt="Kona Kai Corporation"
              width={238}
              height={40}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </a>
          <div className="flex gap-3">
            <Link
              href="/assessment"
              className="rounded-full border border-[#173244]/10 bg-white px-5 py-3 text-sm font-semibold text-[#173244] transition hover:border-[#1BA38E]/45 hover:bg-[#f8fafc]"
            >
              Retake assessment
            </Link>
            <Link
              href="/"
              className="rounded-full bg-[#244566] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#315a83]"
            >
              Return to overview
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          {isSampleResult ? (
            <div className="rounded-2xl border border-[#1BA38E]/20 bg-[#e9f5f4] px-4 py-3 text-sm font-semibold text-[#244566]">
              Sample results are displayed so the output page can be reviewed before a completed
              assessment is available.
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-[#173244]/10 bg-[#f8fafc] p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1BA38E]">
                  Overall Readiness Analysis
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[0.015em] text-[#244566] sm:text-4xl">
                  {result.readinessLabel}
                </h1>
                <p className="mt-4 text-sm leading-6 text-[#173244]">{result.summary.summary}</p>
                <p className="mt-3 text-sm leading-6 text-[#4f646d]">{result.summary.overview}</p>
              </div>
              <div className="rounded-3xl bg-white px-7 py-5 text-center shadow-sm">
                <DonutChart score={result.score} label="Overall readiness score" />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1BA38E]">
                Key Recommended Actions
              </p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {result.summary.recommendations.map((recommendation, index) => (
                <div
                  key={recommendation}
                  className="rounded-2xl border border-[#1BA38E]/20 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1BA38E] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#244566]">
                      {getRecommendationLabel(recommendation)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f646d]">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1BA38E]">
              Domain Breakdown
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[0.015em] text-[#244566]">
              Findings and recommendations by category
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.summary.domainBreakdowns.map((domain) => (
              <div
                key={domain.category}
                className="rounded-[1.5rem] border border-[#173244]/10 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#173244]">{domain.category}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f86]">
                      Domain score
                    </p>
                  </div>
                  <DonutChart score={domain.score} label={`${domain.category} score`} size="small" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1BA38E]">
                    Analysis
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#4f646d]">{domain.finding}</p>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1BA38E]">
                    Recommended Actions
                  </p>
                </div>
                <div className="mt-3 grid gap-2 rounded-2xl bg-[#e9f5f4]/70 p-4">
                  {domain.recommendations.map((recommendation) => (
                    <div
                      key={recommendation}
                      className="flex items-start gap-2 text-sm leading-6 text-[#4f646d]"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1BA38E]" />
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-[#173244]/10 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1BA38E]">
              Prioritized Roadmap
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {result.summary.roadmap.map((item, index) => (
                <div
                  key={`${item.priority}-${item.focus}`}
                  className="rounded-2xl border border-[#173244]/10 bg-[#f8fafc] p-4"
                >
                  <div className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#244566] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1BA38E]">
                        {item.priority}
                      </p>
                      <h3 className="mt-1 font-semibold text-[#173244]">{item.focus}</h3>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-left">
                    {item.actions.map((action) => (
                      <div
                        key={action}
                        className="flex items-start justify-start gap-2 text-left text-sm leading-6 text-[#4f646d]"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1BA38E]" />
                        <p>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[#244566] p-6 text-center text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1BA38E]">
              Next Step
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[0.015em]">
              Ready for a deeper dive assessment and discovery?
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/80">
              Kona Kai can validate these findings with stakeholders, review supporting evidence, and
              convert the roadmap into an execution plan.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-[#1BA38E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#158a79]"
            >
              Schedule discovery
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-[#173244]/10 bg-white p-4 text-xs leading-5 text-[#6f7f86] shadow-sm">
            <span className="font-semibold text-[#173244]">How results are determined: </span>
            This preliminary assessment is based on the maturity options selected, any rationale
            provided, the target score for each question, and the criticality weighting assigned to
            each control area. The output is intended to guide discovery and prioritization, not to
            serve as a formal audit, certification, or compliance determination.
          </div>
        </div>
      </motion.section>
    </main>
  );
}
