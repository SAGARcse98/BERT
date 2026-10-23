"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { Candidate, CandidateStatus } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

export function CandidateKanbanBoard({
  showAllJobs = false,
}: {
  showAllJobs?: boolean;
}) {
  const {
    candidates,
    activeJobId,
    minScoreFilter,
    searchQuery,
    skillFilter,
    setSelectedCandidateId,
    updateCandidateStatus,
  } = useBertStore();

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        if (!showAllJobs && c.jobId !== activeJobId) return false;
        if (c.bertMatchScore < minScoreFilter) return false;
        if (
          skillFilter &&
          !c.matchedSkills.some(
            (s) => s.toLowerCase() === skillFilter.toLowerCase()
          )
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = c.name.toLowerCase().includes(q);
          const inEmail = c.email.toLowerCase().includes(q);
          const inSkills = c.matchedSkills.some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!inName && !inEmail && !inSkills) return false;
        }
        return true;
      })
      .sort((a, b) => b.bertMatchScore - a.bertMatchScore);
  }, [candidates, showAllJobs, activeJobId, minScoreFilter, skillFilter, searchQuery]);

  const columns: {
    status: CandidateStatus;
    title: string;
    subtitle: string;
    headerClass: string;
  }[] = [
    {
      status: "Pending",
      title: "Pending Review",
      subtitle: "Awaiting recruiter screening",
      headerClass:
        "bg-zinc-100 border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200",
    },
    {
      status: "Selected",
      title: "Selected for Interview",
      subtitle: "Shortlisted candidates",
      headerClass:
        "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200",
    },
    {
      status: "Rejected",
      title: "Rejected",
      subtitle: "Archived applications",
      headerClass:
        "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colCandidates = filtered.filter((c) => c.status === col.status);
        return (
          <div
            key={col.status}
            className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-900/40 flex flex-col min-h-[480px]"
          >
            {/* Column Header */}
            <div
              className={`p-4 rounded-t-2xl border-b ${col.headerClass} flex items-center justify-between`}
            >
              <div>
                <h3 className="text-base font-extrabold">{col.title}</h3>
                <p className="text-xs font-semibold opacity-75">
                  {col.subtitle}
                </p>
              </div>
              <span className="text-sm font-extrabold px-3 py-1 rounded-lg bg-white/80 dark:bg-zinc-950/70">
                {colCandidates.length}
              </span>
            </div>

            {/* Cards Stack */}
            <div className="p-4 space-y-3.5 flex-1">
              {colCandidates.length === 0 ? (
                <div className="py-12 text-center text-sm font-semibold text-zinc-400">
                  No candidates in {col.title}
                </div>
              ) : (
                colCandidates.map((c: Candidate) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCandidateId(c.id)}
                    className="cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-rose-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                          {c.name}
                        </h4>
                        <p className="text-xs font-semibold text-zinc-500 mt-0.5 truncate">
                          {c.yearsOfExperience} yrs · {c.currentRole}
                        </p>
                      </div>
                      <ScoreBadge score={c.bertMatchScore} size="sm" />
                    </div>

                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {c.aiRecommendation}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {c.matchedSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {c.missingCriticalSkills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                        >
                          Missing: {skill}
                        </span>
                      ))}
                    </div>

                    {/* Quick Stage Transition Buttons */}
                    <div
                      className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {col.status !== "Selected" && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(c.id, "Selected")}
                          className="flex-1 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 transition-colors"
                        >
                          Move to Selected
                        </button>
                      )}
                      {col.status !== "Rejected" && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(c.id, "Rejected")}
                          className="flex-1 py-1.5 rounded-lg text-xs font-extrabold bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-200 transition-colors"
                        >
                          Move to Rejected
                        </button>
                      )}
                      {col.status !== "Pending" && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(c.id, "Pending")}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        >
                          Pending
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
