import { NextResponse } from "next/server";
import { renderAssessmentPdf } from "@/lib/assessment-pdf";
import { createSalesforceAssessmentTask } from "@/lib/salesforce";
import type { AssessmentResultPayload } from "@/lib/assessment-results";

export const runtime = "nodejs";

type AssessmentResultsApiResponse = {
  ok: boolean;
  mode: "salesforce" | "not_configured";
  salesforceTaskId?: string;
  salesforceContentDocumentId?: string;
  message?: string;
};

function isAssessmentResultPayload(value: unknown): value is AssessmentResultPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<AssessmentResultPayload>;

  return (
    Array.isArray(record.answers) &&
    typeof record.score === "number" &&
    typeof record.readinessLabel === "string" &&
    typeof record.completedAt === "string" &&
    Boolean(record.summary)
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!isAssessmentResultPayload(payload)) {
      throw new Error("Invalid assessment result payload");
    }

    const pdfBuffer = await renderAssessmentPdf(payload);
    const salesforceResult = await createSalesforceAssessmentTask(payload, pdfBuffer);

    if (salesforceResult.status === "not_configured") {
      return NextResponse.json<AssessmentResultsApiResponse>(
        {
          ok: true,
          mode: "not_configured",
          message: "Assessment result validated. Salesforce environment variables are not configured yet."
        },
        { status: 202 }
      );
    }

    return NextResponse.json<AssessmentResultsApiResponse>({
      ok: true,
      mode: "salesforce",
      salesforceTaskId: salesforceResult.taskId,
      salesforceContentDocumentId: salesforceResult.contentDocumentId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to store assessment result";

    return NextResponse.json<AssessmentResultsApiResponse>(
      {
        ok: false,
        mode: "not_configured",
        message
      },
      { status: 400 }
    );
  }
}
