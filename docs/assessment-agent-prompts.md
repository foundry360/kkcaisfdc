# Assessment Agent Instructions

This document records the model instructions used by the Kona Kai AI Readiness Assessment. The implementation lives in `app/api/assessment/agent/route.ts`.

## Model

- Default model: `claude-haiku-4-5-20251001`
- Environment override: `ANTHROPIC_MODEL`
- API key: `ANTHROPIC_API_KEY`
- Temperature: `0.3`
- Max tokens: `1400`

## System Instruction

```text
You are Kona Kai Corporation's AI readiness assessment agent. Write concise, business-first assessment copy. Do not use em dashes or en dashes. Use commas or periods instead. Return only valid JSON, with no markdown.
```

Generated copy is also sanitized server-side to replace em dashes and en dashes before it is returned to the UI.

## Assessment Flow

The assessment uses two model request modes:

- `question`: Creates the conversational category explainer and question copy.
- `summary`: Produces the final readiness output after all questions are answered, including overall summary, domain findings, recommendations, roadmap, and discovery CTA context.

After the summary is generated, the chat assessment stores the completed result in session storage and redirects the user to `/assessment/results`, where the report cards are displayed.

The completed result is also posted to `/api/assessment/results`. When Salesforce is configured, that API creates an `AI_Readiness_Assessment__c` custom object record with the selected maturity score and validation response for each of the 14 questions. If the Lead was created through Salesforce, the assessment record is related to that Lead through `Lead__c`. The API also creates a completed Salesforce `Task` with subject `AI Readiness Assessment Completed` by default. If the Lead was created through Salesforce, the Task is linked to that Lead through `WhoId`. The API also generates a PDF copy of the report, uploads it to Salesforce Files using `ContentVersion`, and links the file to the Lead using `ContentDocumentLink`. Salesforce Flow or template automation can then trigger from the custom assessment record, completed Task, or attached File.

Lead submission uses Salesforce as the source of truth. The app searches for an existing unconverted Lead by email. If one exists, it updates that Lead and changes `LeadSource` to the configured assessment source. If no matching Lead exists, it creates a new Lead. The completed assessment Task and PDF are then attached to the returned Lead Id.

Each user response includes:

- Question ID
- Selected maturity label
- Selected maturity value from 1 to 5
- Required rationale, capped at 300 characters

The current app limits each email address to two completed assessment attempts using browser local storage. A server-side store or CRM-backed check is required to enforce this limit across devices and browsers.

Scoring remains deterministic in the application. The model does not calculate the score. It interprets all structured answers and rationales in the final output against the benchmark, target score, and criticality.

## Results Disclaimer

The final output includes a methodology disclaimer for users:

```text
This preliminary assessment is based on the maturity options selected, any rationale provided, the target score for each question, and the criticality weighting assigned to each control area. The output is intended to guide discovery and prioritization, not to serve as a formal audit, certification, or compliance determination.
```

## Question Prompt Template

```text
Create the next chat turn for an AI readiness assessment.

Organization context:
- First name: {{firstName}}
- Company: {{company}}

Current category: {{category}}
Base context: {{agentContext}}
Base question: {{prompt}}
Assessment statement: {{statement}}
Good looks like: {{goodLooksLike}}
Framework anchors: {{frameworkAnchors}}
Target maturity: {{targetScore}}/5
Criticality: {{criticality}}/3

Prior answers:
{{priorAnswers}}

Return JSON in this exact shape:
{
  "agentContext": "one concise sentence that frames this category using the assessment context",
  "prompt": "one clear question that stays aligned to the base question"
}
```

## Summary Prompt Template

```text
Create a structured final AI readiness assessment output.

Organization context:
- First name: {{firstName}}
- Company: {{company}}

Overall readiness score: {{score}}/100

Domain scores:
{{domainScores}}

Answers:
{{answersWithScoresTargetsCriticalityAndEvidence}}

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
}
```

## Fallback Behavior

If `ANTHROPIC_API_KEY` is not configured, the application returns deterministic fallback content:

- Questions use the static assessment category explainer and prompt from `lib/assessment-data.ts`.
- Summary uses the weighted readiness score to return the full output structure. If generated sections are missing, the UI falls back to deterministic report content.

If Anthropic returns text containing em dashes or en dashes, the API route replaces them before sending the response to the client.
