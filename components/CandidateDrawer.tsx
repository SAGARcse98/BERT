"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPill } from "./StatusPill";

export function CandidateDrawer() {
  const {
    candidates,
    jobs,
    selectedCandidateId,
    setSelectedCandidateId,
    updateCandidateStatus,
    updateCandidateNotes,
    modelConfig,
  } = useBertStore();

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || null;
  const job = jobs.find((j) => j.id === candidate?.jobId) || jobs[0];

  const [notesDraft, setNotesDraft] = useState("");
  const [mobilePane, setMobilePane] = useState<"analysis" | "pdf">("analysis");
  const [docMode, setDocMode] = useState<"structured" | "pdf">("structured");

  useEffect(() => {
    if (candidate) {
      setNotesDraft(candidate.recruiterNotes || "");
      setDocMode(candidate.pdfPreviewUrl ? "pdf" : "structured");
    }
  }, [candidate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCandidateId) {
        setSelectedCandidateId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCandidateId, setSelectedCandidateId]);

  const handleSaveNotes = () => {
    if (!candidate) return;
    updateCandidateNotes(candidate.id, notesDraft);
  };

  return (
    <AnimatePresence>
      {candidate && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedCandidateId(null)}
            className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs"
          />

          {/* Slide-over Inspector Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-[#FAF8F9] dark:bg-zinc-900">
              <div className="flex items-center gap-5 min-w-0">
                <ScoreBadge score={candidate.bertMatchScore} size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                      {candidate.name}
                    </h2>
                    <StatusPill status={candidate.status} size="sm" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1 truncate">
                    {candidate.currentRole} · Role:{" "}
                    <span className="font-bold text-rose-700 dark:text-rose-400">
                      {job.title}
                    </span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex-wrap">
                    <span>{candidate.email}</span>
                    <span>·</span>
                    <span>{candidate.phone}</span>
                    <span>·</span>
                    <span>{candidate.location}</span>
                    <span>·</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold">
                      {candidate.yearsOfExperience} years experience
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidateId(null)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Mobile Pane Switcher */}
            <div className="lg:hidden flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-2.5 gap-2">
              <button
                onClick={() => setMobilePane("analysis")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg ${
                  mobilePane === "analysis"
                    ? "bg-rose-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Candidate Evaluation
              </button>
              <button
                onClick={() => setMobilePane("pdf")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg ${
                  mobilePane === "pdf"
                    ? "bg-rose-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Resume Document
              </button>
            </div>

            {/* Main Side-by-Side Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
              {/* LEFT PANE: Evaluation & Score Breakdown (7 cols) */}
              <div
                className={`lg:col-span-7 overflow-y-auto p-8 space-y-6 ${
                  mobilePane === "pdf" ? "hidden lg:block" : "block"
                }`}
              >
                {/* 1. Score Breakdown */}
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Score Breakdown
                    </h3>
                    <span className="text-xs font-bold text-zinc-500">
                      Cosine Similarity: {candidate.rawCosineSimilarity}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Semantic Relevance",
                        weight: `${modelConfig.semanticWeight}% Weight`,
                        value: candidate.scoreBreakdown.semanticRelevance,
                        bar: "bg-rose-600",
                      },
                      {
                        label: "Skill Overlap",
                        weight: `${modelConfig.skillWeight}% Weight`,
                        value: candidate.scoreBreakdown.skillOverlap,
                        bar: "bg-emerald-600",
                      },
                      {
                        label: `Experience Alignment (min ${job.minExperience} yrs)`,
                        weight: `${modelConfig.experienceWeight}% Weight`,
                        value: candidate.scoreBreakdown.experienceAlignment,
                        bar: "bg-zinc-700 dark:bg-zinc-400",
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {metric.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {metric.weight}
                            </span>
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 w-10 text-right">
                              {metric.value}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${metric.bar}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Key Evaluation Highlights (3 Bullet Points) */}
                <section className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-6 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Evaluation Summary &amp; Key Insights
                  </h3>

                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-rose-200/70 dark:border-zinc-800 rounded-xl px-4 py-3 leading-relaxed">
                    {candidate.aiRecommendation}
                  </p>

                  <ul className="space-y-3 pt-1">
                    {candidate.aiInsights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200"
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            insight.type === "gap"
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                        />
                        <span>{insight.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* 3. Matched Skills vs Missing Critical Skills */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                    <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center justify-between mb-3">
                      <span>Matched Skills</span>
                      <span>
                        {candidate.matchedSkills.length}/
                        {job.requiredSkills.length}
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchedSkills.length > 0 ? (
                        candidate.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">
                          No required skills matched.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                    <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-400 flex items-center justify-between mb-3">
                      <span>Missing Critical Skills</span>
                      <span>{candidate.missingCriticalSkills.length}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missingCriticalSkills.length > 0 ? (
                        candidate.missingCriticalSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          All required skills present on resume
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* 4. Education */}
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Education
                  </h4>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {candidate.education}
                  </p>
                </section>
              </div>

              {/* RIGHT PANE: Raw Resume Document Preview (5 cols) */}
              <div
                className={`lg:col-span-5 bg-[#F3F1F3] dark:bg-zinc-900 flex flex-col overflow-hidden ${
                  mobilePane === "analysis" ? "hidden lg:flex" : "flex"
                }`}
              >
                <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                    Document: {candidate.resumeFilename}
                  </span>
                  {candidate.pdfPreviewUrl ? (
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                      <button
                        onClick={() => setDocMode("pdf")}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          docMode === "pdf"
                            ? "bg-rose-600 text-white"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        Original PDF
                      </button>
                      <button
                        onClick={() => setDocMode("structured")}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          docMode === "structured"
                            ? "bg-rose-600 text-white"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        Parsed Text
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      Preview
                    </span>
                  )}
                </div>

                {candidate.pdfPreviewUrl && docMode === "pdf" ? (
                  <div className="flex-1 bg-zinc-200 dark:bg-zinc-950">
                    <iframe
                      src={candidate.pdfPreviewUrl}
                      title={candidate.resumeFilename}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs p-7 space-y-6">
                      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                          {candidate.name}
                        </h3>
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                          {candidate.currentRole}
                        </p>
                        <p className="text-xs font-medium text-zinc-500 mt-1">
                          {candidate.email} · {candidate.phone} ·{" "}
                          {candidate.location}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                          Summary
                        </h4>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {candidate.resumeSummary}
                        </p>
                      </div>

                      {candidate.resumeSections.map((sec, sIdx) => (
                        <div key={sIdx} className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                            {sec.heading}
                          </h4>
                          {sec.items.map((item, iIdx) => (
                            <div key={iIdx} className="space-y-1.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  {item.title}
                                </p>
                                {item.period && (
                                  <span className="text-xs font-bold text-zinc-400 shrink-0">
                                    {item.period}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-xs font-semibold text-zinc-500">
                                  {item.subtitle}
                                </p>
                              )}
                              <ul className="list-disc list-inside space-y-1.5 pt-1">
                                {item.bullets.map((b, bIdx) => (
                                  <li
                                    key={bIdx}
                                    className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                                  >
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer Decision Bar */}
            <div className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-[#FAF8F9] dark:bg-zinc-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-2.5">
                <input
                  type="text"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveNotes();
                  }}
                  placeholder="Add recruiter notes for this candidate..."
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  Save Note
                </button>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() =>
                    updateCandidateStatus(candidate.id, "Rejected", notesDraft)
                  }
                  className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all border ${
                    candidate.status === "Rejected"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white dark:bg-zinc-900 hover:bg-rose-600 text-rose-700 dark:text-rose-400 hover:text-white border-rose-300 dark:border-rose-800"
                  }`}
                >
                  Reject Application
                </button>

                <button
                  onClick={() =>
                    updateCandidateStatus(candidate.id, "Selected", notesDraft)
                  }
                  className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all border ${
                    candidate.status === "Selected"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
                  }`}
                >
                  Select for Interview
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
