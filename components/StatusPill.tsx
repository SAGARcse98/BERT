"use client";

import React from "react";
import { CandidateStatus } from "@/lib/types";

interface StatusPillProps {
  status: CandidateStatus;
  size?: "sm" | "md";
}

export function StatusPill({ status, size = "md" }: StatusPillProps) {
  const sizeClasses =
    size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm";

  if (status === "Selected") {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 ${sizeClasses}`}
      >
        Selected
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-lg border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 ${sizeClasses}`}
      >
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 ${sizeClasses}`}
    >
      Pending Review
    </span>
  );
}
