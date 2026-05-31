import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Readiness Assessment | Kona Kai Corporation",
  description:
    "Validate your organization's AI readiness across people, processes, platforms, data, and governance with Kona Kai Corporation."
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
