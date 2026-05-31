import { NextResponse } from "next/server";
import { createSalesforceLead } from "@/lib/salesforce";
import type { LeadCaptureValues } from "@/lib/types";

type LeadApiResponse = {
  ok: boolean;
  mode: "salesforce" | "not_configured";
  salesforceLeadId?: string;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseLeadPayload(payload: unknown): LeadCaptureValues {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid lead payload");
  }

  const record = payload as Record<string, unknown>;
  const data: LeadCaptureValues = {
    firstName: readString(record.firstName),
    lastName: readString(record.lastName),
    email: readString(record.email),
    company: readString(record.company),
    address: readString(record.address)
  };

  const missingFields = Object.entries(data)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!emailPattern.test(data.email)) {
    throw new Error("Invalid email address");
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const data = parseLeadPayload(await request.json());
    const salesforceResult = await createSalesforceLead(data);

    if (salesforceResult.status === "not_configured") {
      return NextResponse.json<LeadApiResponse>(
        {
          ok: true,
          mode: "not_configured",
          message: "Lead validated. Salesforce environment variables are not configured yet."
        },
        { status: 202 }
      );
    }

    return NextResponse.json<LeadApiResponse>({
      ok: true,
      mode: "salesforce",
      salesforceLeadId: salesforceResult.id
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit lead";

    return NextResponse.json<LeadApiResponse>(
      {
        ok: false,
        mode: "not_configured",
        message
      },
      { status: 400 }
    );
  }
}
