import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { assessmentQuestions } from "@/lib/assessment-data";
import type { AssessmentResultPayload } from "@/lib/assessment-results";
import type { LeadCaptureValues } from "@/lib/types";

type SalesforceTokenResponse = {
  access_token: string;
  instance_url: string;
};

type SalesforceCreateResponse = {
  id: string;
  success: boolean;
  errors: unknown[];
};

type SalesforceQueryResponse<T> = {
  records: T[];
};

export type SalesforceLeadResult =
  | {
      status: "created" | "updated";
      id: string;
    }
  | {
      status: "not_configured";
    };

export type SalesforceAssessmentResult =
  | {
      status: "created";
      taskId: string;
      assessmentRecordId?: string;
      contentDocumentId?: string;
    }
  | {
      status: "not_configured";
    };

const requiredEnvVars = [
  "SALESFORCE_CLIENT_ID",
  "SALESFORCE_USERNAME"
] as const;

const defaultPrivateKeyPath = "salesforce/jwt/ai-readiness.key";
const aiReadinessAssessmentObject = "AI_Readiness_Assessment__c";
const assessmentResponseFieldMaxLength = 300;
const rawResponseFieldMaxLength = 32768;

const assessmentQuestionSalesforceFields: Record<
  string,
  {
    scoreField: string;
    responseField: string;
  }
> = {
  "q01-ai-strategy": {
    scoreField: "Q1_Strategy_Leadership_Score__c",
    responseField: "Q1_Strategy_Leadership_Response__c"
  },
  "q02-governance-group": {
    scoreField: "Q2_Strategy_Leadership_Score__c",
    responseField: "Q2_Strategy_Leadership_Response__c"
  },
  "q03-ai-policies": {
    scoreField: "Q3_Policy_Standards_Score__c",
    responseField: "Q3_Policy_Standards_Response__c"
  },
  "q04-risk-assessment-tiering": {
    scoreField: "Q4_Risk_Mangement_Score__c",
    responseField: "Q4_Risk_Mangement_Response__c"
  },
  "q05-risk-register": {
    scoreField: "Q5_Risk_Mangement_Score__c",
    responseField: "Q5_Risk_Mangement_Response__c"
  },
  "q06-model-inventory": {
    scoreField: "Q06_Model_Lifecycle_Validation_Score__c",
    responseField: "Q06_Model_Lifecycle_Validation_Respons__c"
  },
  "q07-independent-validation": {
    scoreField: "Q07_Model_Lifecycle_Validation_Score__c",
    responseField: "Q07_Model_Lifecycle_Validation_Respons__c"
  },
  "q08-fairness-testing": {
    scoreField: "Q08_Ethics_Fairness_Equity_Score__c",
    responseField: "Q08_Ethics_Fairness_Equity_Response__c"
  },
  "q09-human-review-appeals": {
    scoreField: "Q09_Ethics_Fairness_Equity_Score__c",
    responseField: "Q09_Ethics_Fairness_Equity_Response__c"
  },
  "q10-training-data-governance": {
    scoreField: "Q10_Data_Governance_for_AI_Score__c",
    responseField: "Q10_Data_Governance_for_AI_Response__c"
  },
  "q11-decision-logging": {
    scoreField: "Q11_Data_Governance_for_AI_Score__c",
    responseField: "Q11_Data_Governance_for_AI_Response__c"
  },
  "q12-ai-vendor-diligence": {
    scoreField: "Q12_Vendor_Third_Party_AI_Score__c",
    responseField: "Q12_Vendor_Third_Party_AI_Response__c"
  },
  "q13-public-genai-controls": {
    scoreField: "Q13_Vendor_Third_Party_AI_Score__c",
    responseField: "Q13_Vendor_Third_Party_AI_Response__c"
  },
  "q14-monitoring-incident-response": {
    scoreField: "Q14_Monitoring_Incident_Response_Score__c",
    responseField: "Q14_Monitoring_Incident_Response_Respo__c"
  }
};

function isSalesforceConfigured() {
  return (
    requiredEnvVars.every((key) => Boolean(process.env[key])) &&
    Boolean(process.env.SALESFORCE_JWT_PRIVATE_KEY || existsSync(defaultPrivateKeyPath))
  );
}

function getLoginUrl() {
  return process.env.SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com";
}

function getPrivateKey() {
  const privateKey = process.env.SALESFORCE_JWT_PRIVATE_KEY;

  if (privateKey) {
    return privateKey.replace(/\\n/g, "\n");
  }

  if (!existsSync(defaultPrivateKeyPath)) {
    throw new Error("Salesforce JWT private key is not configured.");
  }

  return readFileSync(defaultPrivateKeyPath, "utf8");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwtAssertion() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: process.env.SALESFORCE_CLIENT_ID,
      sub: process.env.SALESFORCE_USERNAME,
      aud: getLoginUrl(),
      exp: issuedAt + 180
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${signer
    .sign(getPrivateKey(), "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;
}

async function getAccessToken(): Promise<SalesforceTokenResponse> {
  const tokenUrl = new URL("/services/oauth2/token", getLoginUrl());
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    client_id: process.env.SALESFORCE_CLIENT_ID ?? "",
    assertion: signJwtAssertion()
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce authentication failed: ${message}`);
  }

  return response.json() as Promise<SalesforceTokenResponse>;
}

function mapLeadToSalesforce(data: LeadCaptureValues) {
  return {
    FirstName: data.firstName,
    LastName: data.lastName,
    Email: data.email,
    Company: data.company,
    LeadSource: process.env.SALESFORCE_LEAD_SOURCE ?? "AI Readiness Assessment",
    Description: "Submitted from the Kona Kai AI Readiness Assessment landing page.",
    ...(data.address ? { Street: data.address } : {}),
    ...(process.env.SALESFORCE_LEAD_RECORD_TYPE_ID
      ? { RecordTypeId: process.env.SALESFORCE_LEAD_RECORD_TYPE_ID }
      : {})
  };
}

function escapeSoqlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function getApiVersion() {
  return process.env.SALESFORCE_API_VERSION ?? "v60.0";
}

async function findExistingLeadByEmail({
  token,
  email
}: {
  token: SalesforceTokenResponse;
  email: string;
}) {
  const apiVersion = getApiVersion();
  const query = encodeURIComponent(
    `SELECT Id FROM Lead WHERE Email = '${escapeSoqlString(email)}' AND IsConverted = false ORDER BY LastModifiedDate DESC LIMIT 1`
  );
  const response = await fetch(`${token.instance_url}/services/data/${apiVersion}/query?q=${query}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce lead lookup failed: ${message}`);
  }

  const result = (await response.json()) as SalesforceQueryResponse<{ Id: string }>;

  return result.records[0]?.Id ?? null;
}

async function updateSalesforceLead({
  token,
  leadId,
  data
}: {
  token: SalesforceTokenResponse;
  leadId: string;
  data: LeadCaptureValues;
}) {
  const apiVersion = getApiVersion();
  const response = await fetch(`${token.instance_url}/services/data/${apiVersion}/sobjects/Lead/${leadId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mapLeadToSalesforce(data)),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce lead update failed: ${message}`);
  }
}

function formatAssessmentDescription(result: AssessmentResultPayload) {
  const leadName = [result.lead?.firstName, result.lead?.lastName].filter(Boolean).join(" ");
  const domainSections = result.summary.domainBreakdowns
    .map(
      (domain) => `Domain: ${domain.category}
Score: ${domain.score}/100
Finding: ${domain.finding}
Recommended Actions:
${domain.recommendations.map((recommendation) => `- ${recommendation}`).join("\n")}`
    )
    .join("\n\n");
  const roadmap = result.summary.roadmap
    .map(
      (item) => `${item.priority}: ${item.focus}
${item.actions.map((action) => `- ${action}`).join("\n")}`
    )
    .join("\n\n");

  return `AI Readiness Assessment Completed

Contact: ${leadName || "Unknown"}
Company: ${result.lead?.company ?? "Unknown"}
Email: ${result.lead?.email ?? "Unknown"}
Completed At: ${result.completedAt}

Overall Readiness: ${result.readinessLabel}
Overall Score: ${result.score}/100

Summary:
${result.summary.summary}

Overview:
${result.summary.overview}

Key Recommended Actions:
${result.summary.recommendations.map((recommendation) => `- ${recommendation}`).join("\n")}

Domain Breakdown:
${domainSections}

Prioritized Roadmap:
${roadmap}

How results are determined:
This preliminary assessment is based on the maturity options selected, any rationale provided, the target score for each question, and the criticality weighting assigned to each control area. The output is intended to guide discovery and prioritization, not to serve as a formal audit, certification, or compliance determination.

Raw Assessment Responses:
${result.answers.map((answer) => `- ${answer.questionId}: ${answer.label} (${answer.value}/5)${answer.evidence ? `, rationale: ${answer.evidence}` : ""}`).join("\n")}`;
}

function mapAssessmentToSalesforceTask(result: AssessmentResultPayload) {
  return {
    Subject: process.env.SALESFORCE_ASSESSMENT_TASK_SUBJECT ?? "AI Readiness Assessment Completed",
    Status: "Completed",
    Priority: "Normal",
    Description: formatAssessmentDescription(result).slice(0, 32000),
    ...(result.lead?.salesforceLeadId ? { WhoId: result.lead.salesforceLeadId } : {})
  };
}

function truncateSalesforceText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

function formatAssessmentScoreValue(label: string, value: number) {
  return `${label} (${value}/5)`;
}

function buildRawAssessmentResponse(result: AssessmentResultPayload) {
  const questionsById = new Map<string, (typeof assessmentQuestions)[number]>(
    assessmentQuestions.map((question) => [question.id, question])
  );

  return truncateSalesforceText(
    JSON.stringify(
      {
        lead: result.lead,
        completedAt: result.completedAt,
        readinessLabel: result.readinessLabel,
        score: result.score,
        answers: result.answers.map((answer) => {
          const question = questionsById.get(answer.questionId);

          return {
            questionId: answer.questionId,
            category: question?.category,
            statement: question?.statement,
            prompt: question?.prompt,
            targetScore: question?.targetScore,
            criticality: question?.criticality,
            selectedMaturity: answer.label,
            selectedValue: answer.value,
            evidence: answer.evidence
          };
        })
      },
      null,
      2
    ),
    rawResponseFieldMaxLength
  );
}

function mapAssessmentToSalesforceRecord(result: AssessmentResultPayload) {
  const mappedFields = result.answers.reduce<Record<string, string>>((fields, answer) => {
    const salesforceFields = assessmentQuestionSalesforceFields[answer.questionId];

    if (!salesforceFields) {
      return fields;
    }

    return {
      ...fields,
      [salesforceFields.scoreField]: formatAssessmentScoreValue(answer.label, answer.value),
      [salesforceFields.responseField]: truncateSalesforceText(
        answer.evidence,
        assessmentResponseFieldMaxLength
      )
    };
  }, {});

  return {
    ...mappedFields,
    ...(result.lead?.salesforceLeadId ? { Lead__c: result.lead.salesforceLeadId } : {}),
    RawResponse__c: buildRawAssessmentResponse(result)
  };
}

function getAssessmentPdfTitle(result: AssessmentResultPayload) {
  const companyOrName =
    result.lead?.company ??
    [result.lead?.firstName, result.lead?.lastName].filter(Boolean).join(" ") ??
    "Assessment";

  return `AI Readiness Assessment - ${companyOrName}`;
}

async function uploadPdfToSalesforce({
  token,
  result,
  pdfBuffer
}: {
  token: SalesforceTokenResponse;
  result: AssessmentResultPayload;
  pdfBuffer: Buffer;
}) {
  const apiVersion = getApiVersion();
  const title = getAssessmentPdfTitle(result);
  const contentVersionResponse = await fetch(
    `${token.instance_url}/services/data/${apiVersion}/sobjects/ContentVersion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Title: title,
        PathOnClient: `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}.pdf`,
        VersionData: pdfBuffer.toString("base64")
      }),
      cache: "no-store"
    }
  );

  if (!contentVersionResponse.ok) {
    const message = await contentVersionResponse.text();
    throw new Error(`Salesforce PDF upload failed: ${message}`);
  }

  const contentVersionResult = (await contentVersionResponse.json()) as SalesforceCreateResponse;

  if (!contentVersionResult.success) {
    throw new Error(`Salesforce PDF upload failed: ${JSON.stringify(contentVersionResult.errors)}`);
  }

  const query = encodeURIComponent(
    `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionResult.id}'`
  );
  const queryResponse = await fetch(`${token.instance_url}/services/data/${apiVersion}/query?q=${query}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    },
    cache: "no-store"
  });

  if (!queryResponse.ok) {
    const message = await queryResponse.text();
    throw new Error(`Salesforce PDF lookup failed: ${message}`);
  }

  const queryResult = (await queryResponse.json()) as SalesforceQueryResponse<{
    ContentDocumentId: string;
  }>;
  const contentDocumentId = queryResult.records[0]?.ContentDocumentId;

  if (!contentDocumentId) {
    throw new Error("Salesforce PDF upload did not return a ContentDocumentId.");
  }

  const linkedEntityId = result.lead?.salesforceLeadId;

  if (!linkedEntityId) {
    return contentDocumentId;
  }

  const linkResponse = await fetch(
    `${token.instance_url}/services/data/${apiVersion}/sobjects/ContentDocumentLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ContentDocumentId: contentDocumentId,
        LinkedEntityId: linkedEntityId,
        ShareType: "V",
        Visibility: "AllUsers"
      }),
      cache: "no-store"
    }
  );

  if (!linkResponse.ok) {
    const message = await linkResponse.text();
    throw new Error(`Salesforce PDF link failed: ${message}`);
  }

  const linkResult = (await linkResponse.json()) as SalesforceCreateResponse;

  if (!linkResult.success) {
    throw new Error(`Salesforce PDF link failed: ${JSON.stringify(linkResult.errors)}`);
  }

  return contentDocumentId;
}

async function createSalesforceAssessmentRecord({
  token,
  result
}: {
  token: SalesforceTokenResponse;
  result: AssessmentResultPayload;
}) {
  const apiVersion = getApiVersion();
  const response = await fetch(
    `${token.instance_url}/services/data/${apiVersion}/sobjects/${aiReadinessAssessmentObject}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mapAssessmentToSalesforceRecord(result)),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce AI readiness assessment creation failed: ${message}`);
  }

  const assessmentResult = (await response.json()) as SalesforceCreateResponse;

  if (!assessmentResult.success) {
    throw new Error(
      `Salesforce AI readiness assessment creation failed: ${JSON.stringify(assessmentResult.errors)}`
    );
  }

  return assessmentResult.id;
}

export async function createSalesforceLead(data: LeadCaptureValues): Promise<SalesforceLeadResult> {
  if (!isSalesforceConfigured()) {
    return { status: "not_configured" };
  }

  const token = await getAccessToken();
  const apiVersion = getApiVersion();
  const existingLeadId = await findExistingLeadByEmail({
    token,
    email: data.email
  });

  if (existingLeadId) {
    await updateSalesforceLead({
      token,
      leadId: existingLeadId,
      data
    });

    return {
      status: "updated",
      id: existingLeadId
    };
  }

  const response = await fetch(`${token.instance_url}/services/data/${apiVersion}/sobjects/Lead`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mapLeadToSalesforce(data)),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce lead creation failed: ${message}`);
  }

  const result = (await response.json()) as SalesforceCreateResponse;

  if (!result.success) {
    throw new Error(`Salesforce lead creation failed: ${JSON.stringify(result.errors)}`);
  }

  return {
    status: "created",
    id: result.id
  };
}

export async function createSalesforceAssessmentTask(
  result: AssessmentResultPayload,
  pdfBuffer?: Buffer
): Promise<SalesforceAssessmentResult> {
  if (!isSalesforceConfigured()) {
    return { status: "not_configured" };
  }

  const token = await getAccessToken();
  const apiVersion = getApiVersion();
  const assessmentRecordId = await createSalesforceAssessmentRecord({
    token,
    result
  });
  const response = await fetch(`${token.instance_url}/services/data/${apiVersion}/sobjects/Task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mapAssessmentToSalesforceTask(result)),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Salesforce assessment task creation failed: ${message}`);
  }

  const taskResult = (await response.json()) as SalesforceCreateResponse;

  if (!taskResult.success) {
    throw new Error(`Salesforce assessment task creation failed: ${JSON.stringify(taskResult.errors)}`);
  }

  const contentDocumentId = pdfBuffer
    ? await uploadPdfToSalesforce({
        token,
        result,
        pdfBuffer
      })
    : undefined;

  return {
    status: "created",
    taskId: taskResult.id,
    assessmentRecordId,
    contentDocumentId
  };
}
