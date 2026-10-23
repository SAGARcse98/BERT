"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { ActiveNavTab } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { CandidateRankingTable } from "./CandidateRankingTable";
import { CandidateKanbanBoard } from "./CandidateKanbanBoard";
import { TalentPoolInsights } from "./TalentPoolInsights";
import { CandidateDrawer } from "./CandidateDrawer";
import { CandidateComparisonModal } from "./CandidateComparisonModal";
import { ResumeIngestionFlow } from "./ResumeIngestionFlow";
import { ActiveJobsView } from "./ActiveJobsView";
import { BertModelSettingsView } from "./BertModelSettingsView";
import { ToastContainer } from "./ToastContainer";

interface BertWorkspaceProps {
  initialTab?: ActiveNavTab;
  initialJobId?: string;
}

export function BertWorkspace({
  initialTab,
  initialJobId,
}: BertWorkspaceProps) {
  const {
    theme,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    jobs,
    activeJobId,
    setActiveJobId,
    candidates,
  } = useBertStore();

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  useEffect(() => {
    if (initialJobId && jobs.some((j) => j.id === initialJobId)) {
      setActiveJobId(initialJobId);
    }
  }, [initialJobId, jobs, setActiveJobId]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  const roleCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === activeJobId),
    [candidates, activeJobId]
  );

  const kpis = useMemo(() => {
    const total = roleCandidates.length;
    const avgScore = total
      ? Math.round(
          roleCandidates.reduce((sum, c) => sum + c.bertMatchScore, 0) / total
        )
      : 0;
    const selected = roleCandidates.filter(
      (c) => c.status === "Selected"
    ).length;
    const rejected = roleCandidates.filter(
      (c) => c.status === "Rejected"
    ).length;
    const pending = roleCandidates.filter((c) => c.status === "Pending").length;

    return { total, avgScore, selected, rejected, pending };
  }, [roleCandidates]);

  return (
    <div className="min-h-screen flex bg-[#F5F4F6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 px-8 border-b border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold text-zinc-400">Bertlab</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 capitalize truncate">
              {activeTab === "dashboard"
                ? `${activeJob.title} Overview`
                : activeTab === "upload"
                ? `Upload Resumes — ${activeJob.title}`
                : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {(activeTab === "dashboard" || activeTab === "candidates") && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/70 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("board")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    viewMode === "board"
                      ? "bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Board View
                </button>
              </div>
            )}

            <Link
              href={`/jobs/${activeJob.id}/upload`}
              onClick={() => setActiveTab("upload")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
            >
              Upload Resumes
            </Link>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {activeTab === "dashboard" && (
            <>
              {/* Overview & Role Header */}
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {activeJob.code} · {activeJob.department}
                      </span>
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        {activeJob.location}
                      </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                      {activeJob.title}
                    </h1>
                  </div>

                  {/* Role Switcher Tabs */}
                  <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/70 dark:border-zinc-800 self-start flex-wrap">
                    {jobs.map((job) => {
                      const isSelected = job.id === activeJobId;
                      const count = candidates.filter(
                        (c) => c.jobId === job.id
                      ).length;
                      return (
                        <button
                          key={job.id}
                          onClick={() => setActiveJobId(job.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-2 ${
                            isSelected
                              ? "bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-300 shadow-xs"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          <span>{job.title}</span>
                          <span
                            className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-zinc-300/70 dark:bg-zinc-800 text-zinc-600"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5 KPI Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Total Applications",
                      value: kpis.total,
                      sub: "Resumes received",
                      style:
                        "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800",
                    },
                    {
                      label: "Average Match",
                      value: `${kpis.avgScore}%`,
                      sub: "Semantic score",
                      style:
                        "bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/60",
                    },
                    {
                      label: "Selected",
                      value: kpis.selected,
                      sub: "Shortlisted for interview",
                      style:
                        "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800",
                    },
                    {
                      label: "Rejected",
                      value: kpis.rejected,
                      sub: "Archived",
                      style:
                        "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800",
                    },
                    {
                      label: "Pending Review",
                      value: kpis.pending,
                      sub: "Awaiting decision",
                      style:
                        "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800",
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.03 }}
                      className={`rounded-2xl border ${card.style} p-5 shadow-xs flex flex-col justify-between`}
                    >
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        {card.label}
                      </span>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                          {card.value}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">
                          {card.sub}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Role Talent Pool Insights (Score Tier Bar + Skill Bottlenecks) */}
                <TalentPoolInsights />
              </div>

              {/* Candidate Ranking Table OR Kanban Pipeline Board */}
              {viewMode === "table" ? (
                <CandidateRankingTable showAllJobs={false} />
              ) : (
                <CandidateKanbanBoard showAllJobs={false} />
              )}
            </>
          )}

          {activeTab === "jobs" && <ActiveJobsView />}

          {activeTab === "candidates" && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100/80 text-rose-800 border border-rose-200">
                  Talent Directory
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                  All Candidates ({candidates.length})
                </h1>
              </div>
              {viewMode === "table" ? (
                <CandidateRankingTable showAllJobs={true} />
              ) : (
                <CandidateKanbanBoard showAllJobs={true} />
              )}
            </div>
          )}

          {activeTab === "upload" && <ResumeIngestionFlow />}

          {activeTab === "settings" && <BertModelSettingsView />}
        </main>
      </div>

      {/* Slide-Over Candidate Deep-Dive Drawer */}
      <CandidateDrawer />

      {/* Side-by-Side Candidate Comparison Modal */}
      <CandidateComparisonModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
