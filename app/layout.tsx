import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Readiness Assessment | KKC AI",
  description:
    "Evaluate your organization's AI maturity, identify operational gaps, and receive a practical readiness roadmap."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
