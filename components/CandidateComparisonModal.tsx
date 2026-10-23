"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPill } from "./StatusPill";

export function CandidateComparisonModal() {
  const {
    candidates,
    jobs,
    activeJobId,
    comparisonCandidateIds,
    toggleComparisonCandidate,
    isComparisonModalOpen,
    setComparisonModalOpen,
    updateCandidateStatus,
    setSelectedCandidateId,
  } = useBertStore();

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const compared = candidates.filter((c) =>
    comparisonCandidateIds.includes(c.id)
  );

  if (!isComparisonModalOpen || compared.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setComparisonModalOpen(false)}
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="relative z-10 w-full max-w-6xl max-h-[90vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-[#FAF8F9] dark:bg-zinc-900 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                Side-by-Side Matrix
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1.5">
                Comparing {compared.length} Candidates — {activeJob.title}
              </h2>
            </div>

            <button
              onClick={() => setComparisonModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Close Comparison
            </button>
          </div>

          {/* Scrollable Matrix */}
          <div className="flex-1 overflow-auto p-8">
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${compared.length}, minmax(260px, 1fr))`,
              }}
            >
              {compared.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-900 p-6 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-5">
                    {/* Top Identity & Score */}
                    <div className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs font-semibold text-zinc-500 mt-0.5 truncate">
                          {c.currentRole}
                        </p>
                        <div className="mt-2">
                          <StatusPill status={c.status} size="sm" />
                        </div>
                      </div>
                      <ScoreBadge score={c.bertMatchScore} size="md" />
                    </div>

                    {/* Core Metrics */}
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-zinc-200/70 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500">
                          Experience
                        </span>
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                          {c.yearsOfExperience} years
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-200/70 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500">
                          Semantic Fit
                        </span>
                        <span className="font-extrabold text-rose-600">
                          {c.scoreBreakdown.semanticRelevance}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-200/70 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500">
                          Skill Overlap
                        </span>
                        <span className="font-extrabold text-emerald-600">
                          {c.scoreBreakdown.skillOverlap}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-200/70 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500">
                          Experience Match
                        </span>
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                          {c.scoreBreakdown.experienceAlignment}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-zinc-200/70 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-500">
                          Cosine Similarity
                        </span>
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                          {c.rawCosineSimilarity}
                        </span>
                      </div>
                    </div>

                    {/* Role Skill Coverage Matrix */}
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2.5">
                        Role Skills ({c.matchedSkills.length}/
                        {activeJob.requiredSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeJob.requiredSkills.map((reqSkill) => {
                          const hasSkill = c.matchedSkills.some(
                            (m) => m.toLowerCase() === reqSkill.toLowerCase()
                          );
                          return (
                            <span
                              key={reqSkill}
                              className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                hasSkill
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-zinc-100 text-zinc-400 border-zinc-200 line-through dark:bg-zinc-800/50 dark:border-zinc-800"
                              }`}
                            >
                              {reqSkill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Education & Recommendation */}
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                        Education
                      </p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {c.education}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                        Summary
                      </p>
                      <p className="text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {c.aiRecommendation}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateCandidateStatus(c.id, "Selected")}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                          c.status === "Selected"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-zinc-950 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        Select
                      </button>
                      <button
                        onClick={() => updateCandidateStatus(c.id, "Rejected")}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                          c.status === "Rejected"
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-white dark:bg-zinc-950 text-rose-700 border-rose-300 hover:bg-rose-600 hover:text-white"
                        }`}
                      >
                        Reject
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setComparisonModalOpen(false);
                          setSelectedCandidateId(c.id);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Open Full Dossier
                      </button>
                      <button
                        onClick={() => toggleComparisonCandidate(c.id)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

