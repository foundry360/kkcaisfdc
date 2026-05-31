"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { answerOptions, assessmentQuestions } from "@/lib/assessment-data";
import {
  assessmentResultsStorageKey,
  getAssessmentAttemptCount,
  incrementAssessmentAttemptCount,
  maxAssessmentAttemptsPerUser,
  type AssessmentAnswer,
  type AssessmentSummary
} from "@/lib/assessment-results";
import type { LeadCaptureValues } from "@/lib/types";

type AgentTurn = {
  agentContext: string;
  prompt: string;
};

let cachedStoredLead: LeadCaptureValues | null = null;
let cachedStoredLeadJson: string | null = null;

function subscribeToLeadStore() {
  return () => undefined;
}

function getStoredLead() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLead = window.sessionStorage.getItem("ai-readiness-lead");

  if (!storedLead) {
    cachedStoredLead = null;
    cachedStoredLeadJson = null;
    return null;
  }

  if (storedLead === cachedStoredLeadJson) {
    return cachedStoredLead;
  }

  try {
    cachedStoredLead = JSON.parse(storedLead) as LeadCaptureValues;
    cachedStoredLeadJson = storedLead;

    return cachedStoredLead;
  } catch {
    window.sessionStorage.removeItem("ai-readiness-lead");
    cachedStoredLead = null;
    cachedStoredLeadJson = null;
    return null;
  }
}

export function AssessmentShell() {
  const router = useRouter();
  const lead = useSyncExternalStore(subscribeToLeadStore, getStoredLead, () => null);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [agentTurns, setAgentTurns] = useState<Record<string, AgentTurn>>({});
  const [agentSummary, setAgentSummary] = useState<AssessmentSummary | null>(null);
  const [summaryAttempted, setSummaryAttempted] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [selectedOption, setSelectedOption] = useState<(typeof answerOptions)[number] | null>(null);
  const [evidence, setEvidence] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const evidenceInputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasStoredResultRef = useRef(false);
  const hasSentResultToSalesforceRef = useRef(false);
  const currentQuestion = assessmentQuestions[answers.length];
  const currentAgentTurn = currentQuestion ? agentTurns[currentQuestion.id] : undefined;
  const isComplete = answers.length === assessmentQuestions.length;
  const progress = Math.round((answers.length / assessmentQuestions.length) * 100);
  const remainingEvidenceCharacters = 300 - evidence.length;
  const canSubmitAnswer = Boolean(selectedOption);
  const hasReachedAttemptLimit = lead?.email
    ? getAssessmentAttemptCount(lead.email) >= maxAssessmentAttemptsPerUser
    : false;
  const score = useMemo(() => {
    if (answers.length === 0) {
      return 0;
    }

    const { maxWeightedGap, weightedGap } = answers.reduce(
      (totals, answer) => {
        const question =
          assessmentQuestions.find((assessmentQuestion) => assessmentQuestion.id === answer.questionId) ??
          assessmentQuestions[0];
        const questionGap = Math.max(0, question.targetScore - answer.value);

        return {
          maxWeightedGap:
            totals.maxWeightedGap + (question.targetScore - 1) * question.criticality,
          weightedGap: totals.weightedGap + questionGap * question.criticality
        };
      },
      {
        maxWeightedGap: 0,
        weightedGap: 0
      }
    );

    if (!maxWeightedGap) {
      return 0;
    }

    return Math.round((1 - weightedGap / maxWeightedGap) * 100);
  }, [answers]);

  const readinessLabel =
    score >= 75 ? "Strong Health, Ready to Scale" : score >= 55 ? "Moderate Health, High Potential" : "Early Health, Foundational Opportunity";
  const outputSummary = useMemo<AssessmentSummary>(() => {
    const categories = answers.reduce<string[]>((currentCategories, answer) => {
      const category = assessmentQuestions.find((question) => question.id === answer.questionId)?.category;

      if (!category || currentCategories.includes(category)) {
        return currentCategories;
      }

      return [...currentCategories, category];
    }, []);
    const domainBreakdowns = categories.map((category) => {
      const categoryAnswers = answers.filter((answer) =>
        assessmentQuestions.some(
          (question) => question.id === answer.questionId && question.category === category
        )
      );
      const categoryScore = categoryAnswers.length
        ? Math.round(
            (categoryAnswers.reduce((sum, answer) => sum + answer.value, 0) /
              (categoryAnswers.length * 5)) *
              100
          )
        : 0;

      return {
        category,
        score: categoryScore,
        finding:
          categoryScore >= 75
            ? `${category} appears to have a solid readiness foundation.`
            : `${category} should be strengthened before AI practices are scaled further.`,
        recommendations: [
          `Confirm ownership and evidence for ${category.toLowerCase()} controls.`,
          `Prioritize the highest-risk ${category.toLowerCase()} gaps before scaling AI use cases.`
        ]
      };
    });

    const fallbackSummary = {
      summary:
        score >= 75
          ? "Your responses suggest a strong AI readiness foundation with room to formalize execution practices."
          : score >= 55
            ? "Your responses suggest an emerging AI readiness foundation that would benefit from clearer operating standards."
            : "Your responses suggest early AI readiness with several foundational areas to clarify before scaling.",
      overview:
        "This preliminary output combines your selected maturity levels, rationale, target scores, and criticality weighting into a readiness view for follow-up discovery.",
      recommendations: [
        "Confirm executive ownership for AI decisions and governance.",
        "Prioritize policies, data controls, and monitoring practices before scaling use cases.",
        "Translate the strongest opportunity areas into a practical roadmap."
      ],
      domainBreakdowns,
      roadmap: [
        {
          priority: "First",
          focus: domainBreakdowns[0]?.category ?? "Governance foundation",
          actions: [
            "Validate the lowest scoring domains with stakeholders.",
            "Collect evidence for policies, decision rights, and control ownership."
          ]
        },
        {
          priority: "Next",
          focus: domainBreakdowns[1]?.category ?? "Risk and data controls",
          actions: [
            "Define target-state controls and close high-criticality gaps.",
            "Sequence improvements into 30, 60, and 90 day milestones."
          ]
        },
        {
          priority: "Then",
          focus: "Scale responsible AI execution",
          actions: [
            "Pilot governance improvements with priority AI use cases.",
            "Establish monitoring, reporting, and continuous improvement rhythms."
          ]
        }
      ]
    };

    if (!agentSummary) {
      return fallbackSummary;
    }

    return {
      summary: agentSummary.summary || fallbackSummary.summary,
      overview: agentSummary.overview || fallbackSummary.overview,
      recommendations: agentSummary.recommendations.length
        ? agentSummary.recommendations
        : fallbackSummary.recommendations,
      domainBreakdowns: agentSummary.domainBreakdowns.length
        ? agentSummary.domainBreakdowns
        : fallbackSummary.domainBreakdowns,
      roadmap: agentSummary.roadmap.length ? agentSummary.roadmap : fallbackSummary.roadmap
    };
  }, [agentSummary, answers, score]);

  useEffect(() => {
    if (!currentQuestion || currentAgentTurn) {
      return;
    }

    let isCancelled = false;

    async function loadAgentTurn() {
      setIsAgentThinking(true);

      try {
        const response = await fetch("/api/assessment/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mode: "question",
            lead,
            answers,
            questionId: currentQuestion.id
          })
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as Partial<AgentTurn>;

        if (!isCancelled && result.agentContext && result.prompt) {
          setAgentTurns((currentTurns) => ({
            ...currentTurns,
            [currentQuestion.id]: {
              agentContext: result.agentContext ?? currentQuestion.agentContext,
              prompt: result.prompt ?? currentQuestion.prompt
            }
          }));
        }
      } finally {
        if (!isCancelled) {
          setIsAgentThinking(false);
        }
      }
    }

    void loadAgentTurn();

    return () => {
      isCancelled = true;
    };
  }, [answers, currentAgentTurn, currentQuestion, lead]);

  useEffect(() => {
    if (!isComplete || agentSummary) {
      return;
    }

    let isCancelled = false;

    async function loadAgentSummary() {
      setIsAgentThinking(true);

      try {
        const response = await fetch("/api/assessment/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mode: "summary",
            lead,
            answers
          })
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as Partial<AssessmentSummary>;

        if (!isCancelled && result.summary && result.recommendations) {
          setAgentSummary({
            summary: result.summary,
            overview: result.overview ?? "",
            recommendations: result.recommendations,
            domainBreakdowns: result.domainBreakdowns ?? [],
            roadmap: result.roadmap ?? []
          });
        }
      } finally {
        if (!isCancelled) {
          setSummaryAttempted(true);
          setIsAgentThinking(false);
        }
      }
    }

    void loadAgentSummary();

    return () => {
      isCancelled = true;
    };
  }, [agentSummary, answers, isComplete, lead]);

  useEffect(() => {
    if (!isComplete || !summaryAttempted || hasStoredResultRef.current) {
      return;
    }

    hasStoredResultRef.current = true;
    incrementAssessmentAttemptCount(lead?.email);
    const completedResult = {
      lead,
      answers,
      score,
      readinessLabel,
      summary: outputSummary,
      completedAt: new Date().toISOString()
    };

    window.sessionStorage.setItem(assessmentResultsStorageKey, JSON.stringify(completedResult));

    if (!hasSentResultToSalesforceRef.current) {
      hasSentResultToSalesforceRef.current = true;
      void fetch("/api/assessment/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(completedResult)
      });
    }

    router.push("/assessment/results");
  }, [answers, isComplete, lead, outputSummary, readinessLabel, router, score, summaryAttempted]);

  useEffect(() => {
    const scrollFrame = window.requestAnimationFrame(() => {
      const chatScroll = chatScrollRef.current;

      if (chatScroll) {
        chatScroll.scrollTo({
          top: chatScroll.scrollHeight,
          behavior: "smooth"
        });
      }
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [answers.length, agentSummary]);

  useEffect(() => {
    const evidenceInput = evidenceInputRef.current;

    if (!evidenceInput) {
      return;
    }

    evidenceInput.style.height = "3rem";
    evidenceInput.style.height = `${evidenceInput.scrollHeight}px`;
  }, [evidence]);

  function selectAnswer(option: (typeof answerOptions)[number]) {
    setSelectedOption(option);
  }

  function submitAnswer() {
    if (!currentQuestion || !selectedOption) {
      return;
    }

    const trimmedEvidence = evidence.trim().slice(0, 300);

    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        questionId: currentQuestion.id,
        label: selectedOption.label,
        value: selectedOption.value,
        evidence: trimmedEvidence
      }
    ]);
    setSelectedOption(null);
    setEvidence("");
  }

  function updateEvidence(value: string) {
    setEvidence(value.slice(0, 300));
  }

  function resetAssessment() {
    setAnswers([]);
    setAgentSummary(null);
    setSummaryAttempted(false);
    hasStoredResultRef.current = false;
    hasSentResultToSalesforceRef.current = false;
    setSelectedOption(null);
    setEvidence("");
  }

  if (hasReachedAttemptLimit) {
    return (
      <main className="h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
        <div className="mx-auto grid h-full max-w-3xl place-items-center">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.25rem] border border-[#173244]/10 bg-white p-8 text-center shadow-xl shadow-[#173244]/10"
          >
            <a href="https://konakaicorp.com" aria-label="Kona Kai Corporation home">
              <Image
                src="/kona-kai-logo.png"
                alt="Kona Kai Corporation"
                width={238}
                height={40}
                priority
                className="mx-auto h-9 w-auto"
              />
            </a>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#1BA38E]">
              Assessment limit reached
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[0.015em] text-[#244566]">
              This email has already completed two assessments.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#4f646d]">
              To continue, please schedule a deeper dive assessment and discovery with Kona Kai.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-full bg-[#244566] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#315a83]"
              >
                Return to overview
              </Link>
              <a
                href="https://konakaicorp.com"
                className="rounded-full border border-[#173244]/10 bg-white px-6 py-3 text-sm font-semibold text-[#173244] transition hover:border-[#1BA38E]/45 hover:bg-[#f8fafc]"
              >
                Visit Kona Kai
              </a>
            </div>
          </motion.section>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 noise-overlay opacity-60" />
      <div className="mx-auto h-full max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex h-full flex-col rounded-[2.25rem] border border-[#173244]/10 bg-white p-4 shadow-xl shadow-[#173244]/10 md:p-6"
        >
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-[#4f646d] transition hover:text-[#173244]"
            >
              &lt;- Back to overview
            </Link>
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
          </div>

          <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
            <div className="flex min-h-0 flex-col">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2c6f7c]">
                AI Readiness Assessment
              </p>
              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[0.015em] text-[#244566] sm:text-3xl">
                {lead ? `Welcome, ${lead.firstName}` : "Your assessment is ready"}
              </h1>
              {!lead ? (
                <p className="mt-3 text-sm leading-6 text-[#4f646d] sm:text-base">
                  Enter your contact information from the landing page to personalize this assessment session.
                </p>
              ) : null}

              <div className="mt-5 rounded-3xl border border-[#173244]/10 bg-[#f8fafc] p-4">
                <p className="text-sm font-semibold text-[#173244]">Your Profile</p>
                <div className="mt-3 grid gap-2 text-sm text-[#4f646d]">
                  <p>Name: {lead ? `${lead.firstName} ${lead.lastName}` : "Not captured yet"}</p>
                  <p>Email: {lead?.email ?? "Not captured yet"}</p>
                  <p>Company: {lead?.company ?? "Not captured yet"}</p>
                  <p>Address: {lead?.address ?? "Not captured yet"}</p>
                </div>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#173244]/10 bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#173244]">Assessment progress</p>
                  <p className="text-sm font-semibold text-[#1BA38E]">{progress}%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full rounded-full bg-[#1BA38E] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="scrollbar-hidden mt-4 max-h-full space-y-2 overflow-y-auto pr-1">
                  {assessmentQuestions.map((question, index) => {
                    const answered = index < answers.length;
                    const active = index === answers.length && !isComplete;

                    return (
                      <div
                        key={question.id}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                          answered
                            ? "border-[#1BA38E]/35 bg-[#e9f5f4] text-[#173244]"
                            : active
                              ? "border-[#244566]/25 bg-white text-[#173244]"
                              : "border-[#173244]/10 bg-white text-[#6f7f86]"
                        }`}
                      >
                        <span className="font-semibold">{question.category}</span>
                        <span>{answered ? "Done" : active ? "Current" : "Queued"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#173244]/10 bg-[#f3f4f6] shadow-inner">
              <div className="flex shrink-0 items-center justify-between border-b border-[#173244]/10 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#244566] text-sm font-bold text-white">
                    KK
                  </div>
                  <div>
                    <p className="font-semibold text-[#173244]">Kona Kai Readiness Agent</p>
                    <p className="text-sm text-[#6f7f86]">Conversational assessment</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#e9f5f4] px-3 py-1 text-xs font-semibold text-[#1BA38E]">
                  {isComplete ? "Complete" : `Question ${answers.length + 1} of ${assessmentQuestions.length}`}
                </span>
              </div>

              <div
                ref={chatScrollRef}
                className="scrollbar-hidden min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
              >
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-[1.5rem] rounded-tl-sm border border-[#173244]/10 bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-[#244566]">Agent</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f646d]">
                      {lead
                        ? `Hi ${lead.firstName}. I will guide you through a focused AI readiness conversation for ${lead.company}.`
                        : "Hi. I will guide you through a focused AI readiness conversation. You can return to the landing page if you want this personalized first."}
                    </p>
                  </div>
                </div>

                {assessmentQuestions.map((question, index) => {
                  const answer = answers[index];
                  const agentTurn = agentTurns[question.id] ?? question;
                  const shouldShowQuestion = index < answers.length || index === answers.length;

                  if (!shouldShowQuestion) {
                    return null;
                  }

                  return (
                    <div key={question.id} className="space-y-4">
                      <div className="flex justify-start">
                        <div className="max-w-[82%] rounded-[1.5rem] rounded-tl-sm border border-[#173244]/10 bg-white px-4 py-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#244566]">{question.category}</p>
                          <p className="mt-2 text-sm leading-6 text-[#6f7f86]">
                            {agentTurn.agentContext}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#173244]">{agentTurn.prompt}</p>
                        </div>
                      </div>

                      {answer ? (
                        <div className="flex justify-end">
                          <div className="max-w-[76%] rounded-[1.5rem] rounded-tr-sm bg-[#1BA38E] px-4 py-3 text-white shadow-sm">
                            <p className="text-sm font-semibold">{lead?.firstName ?? "You"}</p>
                            <p className="mt-2 text-sm leading-5 text-white/90">
                              {answer.evidence
                                ? `${answer.evidence} (${answer.label}, ${answer.value}/5)`
                                : `${answer.label} (${answer.value}/5)`}
                            </p>
                          </div>
                        </div>
                      ) : null}

                    </div>
                  );
                })}

                {isAgentThinking && !isComplete ? (
                  <div className="flex justify-start">
                    <div className="rounded-[1.5rem] rounded-tl-sm border border-[#173244]/10 bg-white px-4 py-3 text-sm text-[#6f7f86] shadow-sm">
                      Refining the next prompt...
                    </div>
                  </div>
                ) : null}

                {isComplete ? (
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-[1.5rem] rounded-tl-sm border border-[#173244]/10 bg-white px-4 py-3 text-sm leading-6 text-[#4f646d] shadow-sm">
                      Preparing your assessment results...
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-[#173244]/10 bg-white p-4 shadow-[0_-12px_24px_rgba(23,50,68,0.08)]">
                {isComplete ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={resetAssessment}
                      className="flex-1 rounded-full border border-[#173244]/10 bg-white px-5 py-3 text-sm font-semibold text-[#173244] transition hover:border-[#1BA38E]/45 hover:bg-[#f8fafc]"
                    >
                      Restart conversation
                    </button>
                    <Link
                      href="/"
                      className="flex-1 rounded-full bg-[#244566] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#315a83]"
                    >
                      Return to overview
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-[#173244]">Choose the Closest Response</p>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {answerOptions.map((option) => {
                        const selected = selectedOption?.value === option.value;

                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => selectAnswer(option)}
                            className={`min-w-0 rounded-2xl border px-2 py-2 text-center transition hover:-translate-y-0.5 ${
                              selected
                                ? "border-[#1BA38E] bg-[#1BA38E]"
                                : "border-[#173244]/10 bg-[#f8fafc] hover:border-[#1BA38E]/55 hover:bg-white"
                            }`}
                          >
                            <span
                              className={`block truncate text-center text-xs font-semibold ${
                                selected ? "text-white" : "text-[#173244]"
                              }`}
                            >
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="assessment-evidence"
                          className="text-xs font-semibold text-[#173244]"
                        >
                          Why did you select this response?
                        </label>
                        <span className="text-xs font-semibold text-[#6f7f86]">
                          {remainingEvidenceCharacters} left
                        </span>
                      </div>
                      <div className="relative">
                        <textarea
                          ref={evidenceInputRef}
                          id="assessment-evidence"
                          value={evidence}
                          onChange={(event) => updateEvidence(event.target.value)}
                          maxLength={300}
                          rows={1}
                          placeholder="Share the context behind your selection."
                          className="min-h-12 w-full resize-none overflow-hidden rounded-2xl border border-[#173244]/10 bg-[#f8fafc] py-3 pl-3 pr-12 text-sm leading-6 text-[#173244] outline-none transition placeholder:text-[#8b9aa2] focus:border-[#1BA38E]/65 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={!canSubmitAnswer}
                          aria-label="Submit response"
                          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#244566] text-white transition hover:bg-[#315a83] disabled:cursor-not-allowed disabled:bg-[#9aa8ae]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                          >
                            <path
                              d="M5 12h13M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
