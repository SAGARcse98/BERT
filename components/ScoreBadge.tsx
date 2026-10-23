"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreBadge({
  score,
  size = "md",
  showLabel = false,
}: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, score));

  const tier =
    clamped >= 80
      ? {
          stroke: "#059669",
          track: "#E4E4E7",
          text: "text-emerald-700 dark:text-emerald-400",
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
          label: "Strong Fit",
        }
      : clamped >= 50
      ? {
          stroke: "#D97706",
          track: "#E4E4E7",
          text: "text-amber-700 dark:text-amber-400",
          pill: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
          label: "Moderate",
        }
      : {
          stroke: "#E11D48",
          track: "#E4E4E7",
          text: "text-rose-700 dark:text-rose-400",
          pill: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
          label: "Low Fit",
        };

  const dimensions =
    size === "sm"
      ? { box: 44, radius: 17, strokeWidth: 4, fontSize: "text-xs" }
      : size === "lg"
      ? { box: 72, radius: 29, strokeWidth: 5.5, fontSize: "text-lg" }
      : { box: 54, radius: 21.5, strokeWidth: 4.5, fontSize: "text-sm" };

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        <svg
          width={dimensions.box}
          height={dimensions.box}
          viewBox={`0 0 ${dimensions.box} ${dimensions.box}`}
          className="-rotate-90 transform"
        >
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.radius}
            fill="transparent"
            stroke={tier.track}
            strokeWidth={dimensions.strokeWidth}
          />
          <motion.circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.radius}
            fill="transparent"
            stroke={tier.stroke}
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        </svg>
        <span
          className={`absolute font-extrabold tracking-tight ${dimensions.fontSize} ${tier.text}`}
        >
          {clamped}%
        </span>
      </div>

      {showLabel && (
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-md border ${tier.pill}`}
        >
          {tier.label}
        </span>
      )}
    </div>
  );
}
