"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPill } from "./StatusPill";

export function CandidateDrawer() {
  const {
    candidates,
    jobs,
    activeJobId,
    selectedCandidateId,
    setSelectedCandidateId,
    updateCandidateStatus,
    updateCandidateNotes,
    modelConfig,
    addToast,
  } = useBertStore();

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || null;
  const job = jobs.find((j) => j.id === candidate?.jobId) || jobs[0];

  // Ordered list of candidates in current role for Prev/Next rapid triage
  const roleOrderedCandidates = useMemo(() => {
    const scopeJobId = candidate?.jobId || activeJobId;
    return candidates
      .filter((c) => c.jobId === scopeJobId)
      .sort((a, b) => b.bertMatchScore - a.bertMatchScore);
  }, [candidates, candidate?.jobId, activeJobId]);

  const currentIndex = useMemo(
    () =>
      candidate
        ? roleOrderedCandidates.findIndex((c) => c.id === candidate.id)
        : -1,
    [roleOrderedCandidates, candidate]
  );

  const prevCandidate =
    currentIndex > 0 ? roleOrderedCandidates[currentIndex - 1] : null;
  const nextCandidate =
    currentIndex >= 0 && currentIndex < roleOrderedCandidates.length - 1
      ? roleOrderedCandidates[currentIndex + 1]
      : null;

  const [notesDraft, setNotesDraft] = useState("");
  const [mobilePane, setMobilePane] = useState<"analysis" | "pdf">("analysis");
  const [leftTab, setLeftTab] = useState<"evaluation" | "interview">(
    "evaluation"
  );
  const [docMode, setDocMode] = useState<"structured" | "pdf">("structured");
  const [emailTemplateType, setEmailTemplateType] = useState<
    "invite" | "reject"
  >("invite");

  useEffect(() => {
    if (candidate) {
      setNotesDraft(candidate.recruiterNotes || "");
      setDocMode(candidate.pdfPreviewUrl ? "pdf" : "structured");
      setEmailTemplateType(
        candidate.status === "Rejected" || candidate.bertMatchScore < 55
          ? "reject"
          : "invite"
      );
    }
  }, [candidate]);

  // Keyboard shortcuts for Rapid Triage: Esc, ArrowLeft/Right, S (Select), R (Reject)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCandidateId || !candidate) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (e.key === "Escape") setSelectedCandidateId(null);
        return;
      }

      if (e.key === "Escape") {
        setSelectedCandidateId(null);
      } else if (e.key === "ArrowLeft" && prevCandidate) {
        e.preventDefault();
        setSelectedCandidateId(prevCandidate.id);
      } else if (e.key === "ArrowRight" && nextCandidate) {
        e.preventDefault();
        setSelectedCandidateId(nextCandidate.id);
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        updateCandidateStatus(candidate.id, "Selected", notesDraft);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        updateCandidateStatus(candidate.id, "Rejected", notesDraft);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCandidateId,
    candidate,
    prevCandidate,
    nextCandidate,
    notesDraft,
    setSelectedCandidateId,
    updateCandidateStatus,
  ]);

  const handleSaveNotes = () => {
    if (!candidate) return;
    updateCandidateNotes(candidate.id, notesDraft);
  };

  // Tailored Interview Questions based on candidate's matched & missing skills
  const interviewQuestions = useMemo(() => {
    if (!candidate) return [];
    const topMatched = candidate.matchedSkills.slice(0, 2).join(" and ") || job.requiredSkills[0];
    const firstMissing = candidate.missingCriticalSkills[0];
    const secondMissing = candidate.missingCriticalSkills[1];

    return [
      {
        topic: `Production Depth in ${topMatched}`,
        question: `Walk us through the most complex production system you architected using ${topMatched} during your time as ${candidate.currentRole}. What were the latency, throughput, or reliability trade-offs?`,
      },
      firstMissing
        ? {
            topic: `Skill Gap Probe: ${firstMissing}`,
            question: `Our ${job.title} stack relies heavily on ${firstMissing}, which wasn't highlighted on your resume. Which adjacent tools have you used in production, and how would you approach ramping up on ${firstMissing} in your first 30 days?`,
          }
        : {
            topic: `System Architecture & Scaling`,
            question: `Your background covers 100% of our required stack for ${job.title}. How would you design a fault-tolerant, high-concurrency pipeline at Bertlab when traffic spikes 10x?`,
          },
      secondMissing
        ? {
            topic: `Applied Scenario: ${secondMissing}`,
            question: `If tasked with debugging a bottleneck involving ${secondMissing} and ${candidate.matchedSkills[0] || "our core service"}, what telemetry and profiling steps would you run first?`,
          }
        : {
            topic: `Cross-Functional Ownership (${candidate.yearsOfExperience} yrs exp)`,
            question: `Given your ${candidate.yearsOfExperience} years of experience, tell us about a technical decision where you had to align product and infrastructure teams under a tight deadline.`,
          },
    ];
  }, [candidate, job]);

  const generatedEmail = useMemo(() => {
    if (!candidate) return "";
    const firstName = candidate.name.split(" ")[0];
    if (emailTemplateType === "invite") {
      return `Subject: Interview Invitation — ${job.title} at Bertlab (${job.code})

Hi ${firstName},

Thank you for applying for the ${job.title} role at Bertlab. Our engineering team was impressed by your ${candidate.yearsOfExperience} years of experience and strong background in ${candidate.matchedSkills.slice(0, 4).join(", ")}.

We would love to invite you to a 45-minute technical & architecture conversation with our ${job.department} team this week. Please let us know your availability over the next few days.

Best regards,
Bertlab Talent Acquisition`;
    } else {
      return `Subject: Update on your application for ${job.title} at Bertlab

Hi ${firstName},

Thank you for taking the time to apply for the ${job.title} position (${job.code}) at Bertlab and sharing your experience in ${candidate.matchedSkills.slice(0, 2).join(" and ") || "software engineering"}.

While we were impressed by your background, we are currently prioritizing candidates with deeper hands-on production experience across ${
        candidate.missingCriticalSkills.slice(0, 3).join(", ") || "our specific target infrastructure stack"
      }. We will keep your profile on file for future openings at Bertlab.

Warm regards,
Bertlab Talent Acquisition`;
    }
  }, [candidate, job, emailTemplateType]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    addToast({
      title: "Outreach email copied to clipboard",
      description: `Ready to send to ${candidate?.email}`,
      variant: "emerald",
    });
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
            {/* Header with Rapid Triage Prev/Next Navigation */}
            <div className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F9] dark:bg-zinc-900">
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

              {/* Rapid Triage Controls (Prev / Next / Close) */}
              <div className="flex items-center gap-2 shrink-0">
                {currentIndex !== -1 && (
                  <span className="text-xs font-bold text-zinc-400 mr-1">
                    {currentIndex + 1} of {roleOrderedCandidates.length}
                  </span>
                )}
                <button
                  type="button"
                  disabled={!prevCandidate}
                  onClick={() =>
                    prevCandidate && setSelectedCandidateId(prevCandidate.id)
                  }
                  title="Previous Candidate (Left Arrow)"
                  className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-35 transition-colors"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!nextCandidate}
                  onClick={() =>
                    nextCandidate && setSelectedCandidateId(nextCandidate.id)
                  }
                  title="Next Candidate (Right Arrow)"
                  className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-35 transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => setSelectedCandidateId(null)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
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
              {/* LEFT PANE: Evaluation OR Interview & Outreach (7 cols) */}
              <div
                className={`lg:col-span-7 overflow-y-auto p-8 space-y-6 ${
                  mobilePane === "pdf" ? "hidden lg:block" : "block"
                }`}
              >
                {/* Sub-Navigation Tabs inside Left Pane */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLeftTab("evaluation")}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        leftTab === "evaluation"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      Score &amp; Evaluation
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftTab("interview")}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        leftTab === "interview"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      Interview Guide &amp; Outreach
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 hidden sm:inline">
                    Shortcuts: ←/→ Navigate · S Select · R Reject
                  </span>
                </div>

                {leftTab === "evaluation" ? (
                  <>
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
                  </>
                ) : (
                  /* INTERVIEW GUIDE & OUTREACH TAB */
                  <div className="space-y-6">
                    {/* Tailored Interview Questions */}
                    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-900/50 p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Recommended Technical Interview Questions
                        </h3>
                        <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                          Tailored to probe {candidate.name}&apos;s project
                          depth and skill gaps.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {interviewQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-1.5"
                          >
                            <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
                              Q{idx + 1} · {q.topic}
                            </span>
                            <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                              {q.question}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Outreach Email Composer */}
                    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                            Candidate Outreach Template
                          </h3>
                          <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                            Pre-filled with candidate details and role context.
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setEmailTemplateType("invite")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              emailTemplateType === "invite"
                                ? "bg-emerald-600 text-white"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            Interview Invite
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailTemplateType("reject")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              emailTemplateType === "reject"
                                ? "bg-rose-600 text-white"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            Rejection Note
                          </button>
                        </div>
                      </div>

                      <textarea
                        readOnly
                        rows={10}
                        value={generatedEmail}
                        className="w-full p-4 text-xs font-mono leading-relaxed rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                        >
                          Copy Email to Clipboard
                        </button>
                      </div>
                    </section>
                  </div>
                )}
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
