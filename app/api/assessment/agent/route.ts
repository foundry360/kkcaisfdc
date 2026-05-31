import { NextResponse } from "next/server";
import { assessmentQuestions, type AssessmentQuestion } from "@/lib/assessment-data";
import type { LeadCaptureValues } from "@/lib/types";

type AssessmentAnswer = {
  questionId: string;
  label: string;
  value: number;
  evidence?: string;
};

type AgentRequest = {
  lead?: Partial<LeadCaptureValues> | null;
  answers?: AssessmentAnswer[];
  questionId?: string;
  mode?: "question" | "summary";
};

type AgentTurn = {
  agentContext: string;
  prompt: string;
};

type AgentSummary = {
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

const anthropicApiUrl = "https://api.anthropic.com/v1/messages";
const anthropicVersion = "2023-06-01";

function getQuestion(questionId: string | undefined): AssessmentQuestion {
  return (
    assessmentQuestions.find((question) => question.id === questionId) ?? assessmentQuestions[0]
  );
}

function getFallbackTurn(question: AssessmentQuestion): AgentTurn {
  return {
    agentContext: question.agentContext,
    prompt: question.prompt
  };
}

function calculateReadinessScore(answers: AssessmentAnswer[]) {
  if (!answers.length) {
    return 0;
  }

  const { maxWeightedGap, weightedGap } = answers.reduce(
    (totals, answer) => {
      const question = getQuestion(answer.questionId);
      const questionGap = Math.max(0, question.targetScore - answer.value);

      return {
        maxWeightedGap: totals.maxWeightedGap + (question.targetScore - 1) * question.criticality,
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
}

function calculateCategoryScore(category: string, answers: AssessmentAnswer[]) {
  const categoryAnswers = answers.filter((answer) => getQuestion(answer.questionId).category === category);

  if (!categoryAnswers.length) {
    return 0;
  }

  const { maxWeightedGap, weightedGap } = categoryAnswers.reduce(
    (totals, answer) => {
      const question = getQuestion(answer.questionId);
      const questionGap = Math.max(0, question.targetScore - answer.value);

      return {
        maxWeightedGap: totals.maxWeightedGap + (question.targetScore - 1) * question.criticality,
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
}

function getAnsweredCategories(answers: AssessmentAnswer[]) {
  return Array.from(new Set(answers.map((answer) => getQuestion(answer.questionId).category)));
}

function getLowestScoringCategories(answers: AssessmentAnswer[]) {
  return getAnsweredCategories(answers)
    .map((category) => ({
      category,
      score: calculateCategoryScore(category, answers)
    }))
    .sort((first, second) => first.score - second.score);
}

function getFallbackSummary(answers: AssessmentAnswer[]): AgentSummary {
  const score = calculateReadinessScore(answers);
  const lowestCategories = getLowestScoringCategories(answers);
  const summary =
    score >= 75
      ? "Your responses suggest a strong AI readiness foundation with room to formalize execution practices."
      : score >= 55
        ? "Your responses suggest an emerging AI readiness foundation that would benefit from clearer operating standards."
        : "Your responses suggest early AI readiness with several foundational areas to clarify before scaling.";
  const domainBreakdowns = getAnsweredCategories(answers).map((category) => {
    const categoryScore = calculateCategoryScore(category, answers);
    const categoryQuestions = assessmentQuestions.filter((question) => question.category === category);
    const lowestQuestion =
      categoryQuestions
        .map((question) => ({
          question,
          answer: answers.find((answer) => answer.questionId === question.id)
        }))
        .sort((first, second) => (first.answer?.value ?? 0) - (second.answer?.value ?? 0))[0]
        ?.question ?? categoryQuestions[0];

    return {
      category,
      score: categoryScore,
      finding:
        categoryScore >= 75
          ? `${category} appears to have a solid readiness foundation.`
          : `${category} should be strengthened before AI practices are scaled further.`,
      recommendations: [
        lowestQuestion.goodLooksLike,
        `Confirm ownership and evidence for ${category.toLowerCase()} controls.`
      ]
    };
  });

  return {
    summary,
    overview:
      "This output combines selected maturity levels, rationale, target scores, and criticality weighting into a preliminary readiness view.",
    recommendations: [
      "Confirm executive ownership for AI decisions and governance.",
      "Prioritize policies, data controls, and monitoring practices before scaling use cases.",
      "Translate the strongest opportunity areas into a practical roadmap."
    ],
    domainBreakdowns,
    roadmap: [
      {
        priority: "First",
        focus: lowestCategories[0]?.category ?? "Governance foundation",
        actions: [
          "Validate the lowest scoring domains with stakeholders.",
          "Collect evidence for policies, decision rights, and control ownership."
        ]
      },
      {
        priority: "Next",
        focus: lowestCategories[1]?.category ?? "Risk and data controls",
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
}

function extractJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Anthropic response did not include JSON.");
  }

  return value.slice(start, end + 1);
}

function cleanGeneratedCopy(value: string | undefined) {
  return (value ?? "").replace(/\s*[—–]\s*/g, ", ");
}

function cleanSummary(summary: AgentSummary): AgentSummary {
  return {
    summary: cleanGeneratedCopy(summary.summary),
    overview: cleanGeneratedCopy(summary.overview),
    recommendations: (summary.recommendations ?? []).map(cleanGeneratedCopy),
    domainBreakdowns: (summary.domainBreakdowns ?? []).map((domain) => ({
      category: cleanGeneratedCopy(domain.category),
      score: domain.score,
      finding: cleanGeneratedCopy(domain.finding),
      recommendations: (domain.recommendations ?? []).map(cleanGeneratedCopy)
    })),
    roadmap: (summary.roadmap ?? []).map((item) => ({
      priority: cleanGeneratedCopy(item.priority),
      focus: cleanGeneratedCopy(item.focus),
      actions: (item.actions ?? []).map(cleanGeneratedCopy)
    }))
  };
}

async function callAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(anthropicApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": anthropicVersion
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      temperature: 0.3,
      system:
        "You are Kona Kai Corporation's AI readiness assessment agent. Write concise, business-first assessment copy. Do not use em dashes or en dashes. Use commas or periods instead. Return only valid JSON, with no markdown.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Anthropic request failed: ${message}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((item) => item.type === "text")?.text;

  if (!text) {
    throw new Error("Anthropic response did not include text.");
  }

  return text;
}

function buildQuestionPrompt({
  lead,
  answers,
  question
}: {
  lead: AgentRequest["lead"];
  answers: AssessmentAnswer[];
  question: AssessmentQuestion;
}) {
  return `Create the next chat turn for an AI readiness assessment.

Organization context:
- First name: ${lead?.firstName ?? "Unknown"}
- Company: ${lead?.company ?? "Unknown"}

Current category: ${question.category}
Base context: ${question.agentContext}
Base question: ${question.prompt}
Assessment statement: ${question.statement}
Good looks like: ${question.goodLooksLike}
Framework anchors: ${question.frameworkAnchors}
Target maturity: ${question.targetScore}/5
Criticality: ${question.criticality}/3

Prior answers:
${answers.length ? answers.map((answer) => `- ${answer.questionId}: ${answer.label} (${answer.value}/5)${answer.evidence ? `; evidence: ${answer.evidence}` : ""}`).join("\n") : "- None"}

Return JSON in this exact shape:
{
  "agentContext": "one concise sentence that frames this category using the assessment context",
  "prompt": "one clear question that stays aligned to the base question"
}`;
}

function buildSummaryPrompt({
  lead,
  answers
}: {
  lead: AgentRequest["lead"];
  answers: AssessmentAnswer[];
}) {
  const categories = getAnsweredCategories(answers)
    .map((category) => `- ${category}: ${calculateCategoryScore(category, answers)}/100`)
    .join("\n");

  return `Create a structured final AI readiness assessment output.

Organization context:
- First name: ${lead?.firstName ?? "Unknown"}
- Company: ${lead?.company ?? "Unknown"}

Overall readiness score: ${calculateReadinessScore(answers)}/100

Domain scores:
${categories}

Answers:
${answers
  .map((answer) => {
    const question = getQuestion(answer.questionId);

    return `- ${question.category} / ${answer.questionId}: ${answer.label} (${answer.value}/5), target ${question.targetScore}/5, criticality ${question.criticality}/3${answer.evidence ? `, evidence: ${answer.evidence}` : ""}`;
  })
  .join("\n")}

Instructions:
- Write in concise, executive-ready business language.
- Assess the submitted rationale where available, but do not overstate certainty.
- Domain findings should identify the most important gap, risk, or strength for that domain.
- Domain recommendations should be practical next steps for that domain.
- Roadmap priorities should be ordered by risk, readiness gap, and criticality.
- Do not use em dashes or en dashes.

Return JSON in this exact shape:
{
  "summary": "two concise sentences summarizing overall readiness",
  "overview": "one short paragraph explaining what the result means for the organization",
  "recommendations": ["enterprise-level recommendation", "enterprise-level recommendation", "enterprise-level recommendation"],
  "domainBreakdowns": [
    {
      "category": "domain name",
      "score": 0,
      "finding": "concise finding for this domain",
      "recommendations": ["domain recommendation", "domain recommendation"]
    }
  ],
  "roadmap": [
    {
      "priority": "First",
      "focus": "priority focus area",
      "actions": ["action", "action"]
    },
    {
      "priority": "Next",
      "focus": "priority focus area",
      "actions": ["action", "action"]
    },
    {
      "priority": "Then",
      "focus": "priority focus area",
      "actions": ["action", "action"]
    }
  ]
}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentRequest;
    const answers = body.answers ?? [];

    if (body.mode === "summary") {
      const fallback = getFallbackSummary(answers);
      const anthropicText = await callAnthropic(
        buildSummaryPrompt({
          lead: body.lead ?? null,
          answers
        })
      );

      if (!anthropicText) {
        return NextResponse.json({ mode: "fallback", ...fallback });
      }

      const summary = cleanSummary(JSON.parse(extractJsonObject(anthropicText)) as AgentSummary);

      return NextResponse.json({
        mode: "anthropic",
        ...summary
      });
    }

    const question = getQuestion(body.questionId);
    const fallback = getFallbackTurn(question);
    const anthropicText = await callAnthropic(
      buildQuestionPrompt({
        lead: body.lead ?? null,
        answers,
        question
      })
    );

    if (!anthropicText) {
      return NextResponse.json({ mode: "fallback", ...fallback });
    }

    const turn = JSON.parse(extractJsonObject(anthropicText)) as AgentTurn;

    return NextResponse.json({
      mode: "anthropic",
      agentContext: cleanGeneratedCopy(turn.agentContext),
      prompt: cleanGeneratedCopy(turn.prompt)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate assessment turn.";

    return NextResponse.json(
      {
        mode: "error",
        message
      },
      { status: 400 }
    );
  }
}
