import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

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

export type SalesforceLeadResult =
  | {
      status: "created";
      id: string;
    }
  | {
      status: "not_configured";
    };

const requiredEnvVars = [
  "SALESFORCE_CLIENT_ID",
  "SALESFORCE_USERNAME"
] as const;

const defaultPrivateKeyPath = "salesforce/jwt/ai-readiness.key";

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
    Street: data.address,
    LeadSource: process.env.SALESFORCE_LEAD_SOURCE ?? "AI Readiness Assessment",
    Description: "Submitted from the Kona Kai AI Readiness Assessment landing page.",
    ...(process.env.SALESFORCE_LEAD_RECORD_TYPE_ID
      ? { RecordTypeId: process.env.SALESFORCE_LEAD_RECORD_TYPE_ID }
      : {})
  };
}

export async function createSalesforceLead(data: LeadCaptureValues): Promise<SalesforceLeadResult> {
  if (!isSalesforceConfigured()) {
    return { status: "not_configured" };
  }

  const token = await getAccessToken();
  const apiVersion = process.env.SALESFORCE_API_VERSION ?? "v60.0";
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
