import type { ReactNode } from "react";

type SectionBadgeProps = {
  children: ReactNode;
};

export function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
      {children}
    </div>
  );
}
