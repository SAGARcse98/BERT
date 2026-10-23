"use client";

import React from "react";
import { useBertStore } from "@/lib/store";
import { ActiveNavTab } from "@/lib/types";

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    jobs,
    activeJobId,
    setActiveJobId,
    candidates,
    theme,
    toggleTheme,
  } = useBertStore();

  const pendingCount = candidates.filter((c) => c.status === "Pending").length;
  const selectedCount = candidates.filter((c) => c.status === "Selected").length;

  const navItems: {
    id: ActiveNavTab;
    label: string;
    count?: number;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "jobs",
      label: "Active Jobs",
      count: jobs.length,
    },
    {
      id: "candidates",
      label: "Candidates",
      count: candidates.length,
    },
    {
      id: "upload",
      label: "Upload Resumes",
    },
    {
      id: "settings",
      label: "Model Settings",
    },
  ];

  return (
    <aside className="w-72 shrink-0 border-r border-zinc-200/90 dark:border-zinc-800 bg-[#EFECEEF0] dark:bg-zinc-900 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-extrabold text-lg tracking-tight shadow-xs">
              B
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 block leading-none">
                Bertlab
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1 block">
                Talent &amp; ATS
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="p-4 space-y-1.5">
          <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-rose-50/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Open Roles List */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between px-3 py-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Open Roles
            </p>
          </div>
          <div className="mt-1 space-y-1.5">
            {jobs.map((job) => {
              const isSelected = job.id === activeJobId;
              const roleCount = candidates.filter(
                (c) => c.jobId === job.id
              ).length;
              return (
                <button
                  key={job.id}
                  onClick={() => {
                    setActiveJobId(job.id);
                    if (activeTab !== "dashboard" && activeTab !== "upload") {
                      setActiveTab("dashboard");
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all ${
                    isSelected
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold border border-rose-200 dark:border-rose-800/70"
                      : "text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="truncate">{job.title}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-rose-200/70 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {roleCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Summary Card */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Pipeline Summary
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900 px-3 py-2">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block">
                Selected
              </span>
              <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-300">
                {selectedCount}
              </span>
            </div>
            <div className="rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900 px-3 py-2">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-400 block">
                Pending
              </span>
              <span className="text-lg font-extrabold text-rose-900 dark:text-rose-300">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
