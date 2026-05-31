import type { LeadCaptureValues } from "@/lib/types";

export type AssessmentAnswer = {
  questionId: string;
  label: string;
  value: number;
  evidence: string;
};

export type AssessmentSummary = {
  summary: string;
  overview: string;
  recommendations: string[];
  domainBreakdowns: Array<{
    category: string;
    score: number;
    finding: string;
    recommendations: string[];
  }>;
  roadmap: Array<{
    priority: string;
    focus: string;
    actions: string[];
  }>;
};

export type AssessmentResultPayload = {
  lead: Partial<LeadCaptureValues> | null;
  answers: AssessmentAnswer[];
  score: number;
  readinessLabel: string;
  summary: AssessmentSummary;
  completedAt: string;
};

export const assessmentResultsStorageKey = "ai-readiness-results";
export const assessmentAttemptCountsStorageKey = "ai-readiness-attempt-counts";
export const maxAssessmentAttemptsPerUser = 2;

function normalizeAssessmentEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function getAttemptCounts() {
  if (typeof window === "undefined") {
    return {};
  }

  const storedCounts = window.localStorage.getItem(assessmentAttemptCountsStorageKey);

  if (!storedCounts) {
    return {};
  }

  try {
    return JSON.parse(storedCounts) as Record<string, number>;
  } catch {
    window.localStorage.removeItem(assessmentAttemptCountsStorageKey);
    return {};
  }
}

export function getAssessmentAttemptCount(email: string | undefined) {
  const normalizedEmail = normalizeAssessmentEmail(email);

  if (!normalizedEmail) {
    return 0;
  }

  return getAttemptCounts()[normalizedEmail] ?? 0;
}

export function incrementAssessmentAttemptCount(email: string | undefined) {
  const normalizedEmail = normalizeAssessmentEmail(email);

  if (!normalizedEmail || typeof window === "undefined") {
    return 0;
  }

  const counts = getAttemptCounts();
  const nextCount = (counts[normalizedEmail] ?? 0) + 1;

  window.localStorage.setItem(
    assessmentAttemptCountsStorageKey,
    JSON.stringify({
      ...counts,
      [normalizedEmail]: nextCount
    })
  );

  return nextCount;
}
