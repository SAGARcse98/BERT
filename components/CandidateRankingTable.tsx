"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { Candidate, CandidateStatus } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPill } from "./StatusPill";

interface CandidateRankingTableProps {
  showAllJobs?: boolean;
}

export function CandidateRankingTable({
  showAllJobs = false,
}: CandidateRankingTableProps) {
  const {
    candidates,
    jobs,
    activeJobId,
    statusFilter,
    setStatusFilter,
    minScoreFilter,
    setMinScoreFilter,
    searchQuery,
    setSearchQuery,
    skillFilter,
    setSkillFilter,
    resetFilters,
    setSelectedCandidateId,
    updateCandidateStatus,
    bulkUpdateCandidateStatus,
    comparisonCandidateIds,
    toggleComparisonCandidate,
    setComparisonCandidateIds,
    setComparisonModalOpen,
    addToast,
  } = useBertStore();

  const [sortDesc, setSortDesc] = useState(true);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  const availableSkills = useMemo(() => {
    if (!showAllJobs) return activeJob.requiredSkills;
    const all = new Set<string>();
    jobs.forEach((j) => j.requiredSkills.forEach((s) => all.add(s)));
    return Array.from(all).slice(0, 14);
  }, [showAllJobs, activeJob, jobs]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        if (!showAllJobs && c.jobId !== activeJobId) return false;
        if (statusFilter !== "All" && c.status !== statusFilter) return false;
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
          const inRole = c.currentRole.toLowerCase().includes(q);
          const inSkills = c.matchedSkills.some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!inName && !inEmail && !inRole && !inSkills) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortDesc
          ? b.bertMatchScore - a.bertMatchScore
          : a.bertMatchScore - b.bertMatchScore
      );
  }, [
    candidates,
    showAllJobs,
    activeJobId,
    statusFilter,
    minScoreFilter,
    skillFilter,
    searchQuery,
    sortDesc,
  ]);

  const hasActiveFilters =
    statusFilter !== "All" ||
    minScoreFilter > 0 ||
    searchQuery.trim() !== "" ||
    skillFilter !== null;

  const handleCompareTopFinalists = () => {
    const topIds = filteredCandidates.slice(0, 3).map((c) => c.id);
    if (topIds.length < 2) {
      addToast({
        title: "Need at least 2 candidates to compare",
        description: "Adjust filters or upload more resumes.",
        variant: "amber",
      });
      return;
    }
    setComparisonCandidateIds(topIds);
    setComparisonModalOpen(true);
  };

  const handleAutoSelectHighFit = () => {
    const highFitIds = filteredCandidates
      .filter((c) => c.bertMatchScore >= 80 && c.status !== "Selected")
      .map((c) => c.id);
    if (highFitIds.length === 0) {
      addToast({
        title: "All 80%+ candidates are already Selected",
        variant: "neutral",
      });
      return;
    }
    bulkUpdateCandidateStatus(highFitIds, "Selected");
  };

  const handleExportCSV = () => {
    const rowsToExport =
      comparisonCandidateIds.length > 0
        ? filteredCandidates.filter((c) =>
            comparisonCandidateIds.includes(c.id)
          )
        : filteredCandidates;

    if (rowsToExport.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Years Experience",
      "BERT Match Score (%)",
      "Semantic Relevance (%)",
      "Skill Overlap (%)",
      "Experience Alignment (%)",
      "Status",
      "Matched Skills",
      "Missing Skills",
      "Recruiter Notes",
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.join(","),
      ...rowsToExport.map((c) =>
        [
          escapeCsv(c.name),
          escapeCsv(c.email),
          escapeCsv(c.phone),
          escapeCsv(c.currentRole),
          escapeCsv(c.yearsOfExperience),
          escapeCsv(c.bertMatchScore),
          escapeCsv(c.scoreBreakdown.semanticRelevance),
          escapeCsv(c.scoreBreakdown.skillOverlap),
          escapeCsv(c.scoreBreakdown.experienceAlignment),
          escapeCsv(c.status),
          escapeCsv(c.matchedSkills.join("; ")),
          escapeCsv(c.missingCriticalSkills.join("; ")),
          escapeCsv(c.recruiterNotes),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bertlab_${activeJob.code}_Candidates.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: `Exported ${rowsToExport.length} candidates to CSV`,
      description: `Bertlab_${activeJob.code}_Candidates.csv downloaded.`,
      variant: "emerald",
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      {/* Top Filter & Search Bar */}
      <div className="p-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-4 bg-[#FAF9FB] dark:bg-zinc-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-200/75 dark:bg-zinc-950 border border-zinc-300/60 dark:border-zinc-800 w-fit">
            {(["All", "Pending", "Selected", "Rejected"] as const).map(
              (status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status as "All" | CandidateStatus)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      isActive
                        ? "bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-300 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {status === "Pending" ? "Pending Review" : status}
                  </button>
                );
              }
            )}
          </div>

          {/* Search Input + Minimum Match Score Slider + Sort Order */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or skill..."
                className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                Min Score
              </span>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="w-24 accent-rose-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 w-11 text-right">
                {minScoreFilter > 0 ? `${minScoreFilter}%+` : "Any"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setMinScoreFilter(minScoreFilter === 75 ? 0 : 75)
                }
                className={`text-xs font-bold px-2.5 py-1 rounded-md border transition-colors ${
                  minScoreFilter === 75
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-rose-400"
                }`}
              >
                75%+
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSortDesc((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {sortDesc ? "Score: High to Low" : "Score: Low to High"}
            </button>
          </div>
        </div>

        {/* Skill Filter Pills + Batch & Export Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Filter by Skill:
            </span>
            {availableSkills.map((skill) => {
              const active = skillFilter === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setSkillFilter(active ? null : skill)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    active
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-rose-300 hover:bg-rose-50/50"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-2"
              >
                Reset filters ({filteredCandidates.length})
              </button>
            )}
          </div>

          {/* Action Toolbar: Compare, Auto-Select 80%+, Export CSV */}
          <div className="flex items-center gap-2 flex-wrap">
            {comparisonCandidateIds.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setComparisonModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                >
                  Compare Checked ({comparisonCandidateIds.length})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    bulkUpdateCandidateStatus(
                      comparisonCandidateIds,
                      "Selected"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  Select Checked
                </button>
                <button
                  type="button"
                  onClick={() =>
                    bulkUpdateCandidateStatus(
                      comparisonCandidateIds,
                      "Rejected"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors"
                >
                  Reject Checked
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonCandidateIds([])}
                  className="px-2.5 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCompareTopFinalists}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                >
                  Compare Top 3 Finalists
                </button>
                <button
                  type="button"
                  onClick={handleAutoSelectHighFit}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  Select All 80%+
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-950/50">
              <th className="py-4 pl-6 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={
                    filteredCandidates.length > 0 &&
                    filteredCandidates
                      .slice(0, 4)
                      .every((c) => comparisonCandidateIds.includes(c.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setComparisonCandidateIds(
                        filteredCandidates.slice(0, 4).map((c) => c.id)
                      );
                    } else {
                      setComparisonCandidateIds([]);
                    }
                  }}
                  title="Select up to 4 candidates to compare or batch update"
                  className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4">Candidate &amp; Experience</th>
              <th className="py-4 px-4">Match Score</th>
              <th className="py-4 px-4">Matched &amp; Missing Skills</th>
              <th className="py-4 px-4 max-w-sm">Executive Summary</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 pl-4 pr-6 text-right">Decision</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800 text-sm">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-zinc-500 dark:text-zinc-400"
                >
                  <p className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                    No candidates match your current filters
                  </p>
                  <p className="text-sm mt-1">
                    Try lowering the minimum score filter or clearing the skill
                    selection.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate: Candidate, index: number) => {
                const candidateJob = jobs.find(
                  (j) => j.id === candidate.jobId
                );
                const isChecked = comparisonCandidateIds.includes(candidate.id);
                return (
                  <motion.tr
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, delay: index * 0.015 }}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`group cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-rose-50/70 dark:bg-rose-950/30"
                        : "hover:bg-rose-50/40 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-4 pl-6 pr-2 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleComparisonCandidate(candidate.id)}
                        className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                      />
                    </td>

                    {/* Col 1: Candidate Name, Email & Total Years of Experience */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-extrabold text-sm text-rose-800 dark:text-rose-300 shrink-0">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">
                              {candidate.name}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {candidate.yearsOfExperience} yrs
                            </span>
                          </div>
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {candidate.email}
                          </p>
                          {showAllJobs && candidateJob && (
                            <span className="inline-block mt-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                              {candidateJob.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Match Score */}
                    <td className="py-4 px-4 align-middle">
                      <ScoreBadge
                        score={candidate.bertMatchScore}
                        size="md"
                        showLabel
                      />
                    </td>

                    {/* Col 3: Matched Skills vs Missing Critical Skills */}
                    <td className="py-4 px-4 align-middle max-w-[300px]">
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.matchedSkills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.matchedSkills.length > 4 && (
                          <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            +{candidate.matchedSkills.length - 4}
                          </span>
                        )}

                        {candidate.missingCriticalSkills
                          .slice(0, 2)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                            >
                              Missing: {skill}
                            </span>
                          ))}
                        {candidate.missingCriticalSkills.length > 2 && (
                          <span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                            +{candidate.missingCriticalSkills.length - 2} gap
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Col 4: Recommendation */}
                    <td className="py-4 px-4 align-middle max-w-sm">
                      <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {candidate.aiRecommendation}
                      </p>
                    </td>

                    {/* Col 5: Current Status */}
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <StatusPill status={candidate.status} size="sm" />
                    </td>

                    {/* Col 6: Quick Actions */}
                    <td
                      className="py-4 pl-4 pr-6 align-middle text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCandidateStatus(candidate.id, "Selected")
                          }
                          className={`px-3.5 py-2 rounded-lg text-xs font-extrabold border transition-all ${
                            candidate.status === "Selected"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                          }`}
                        >
                          Select
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateCandidateStatus(candidate.id, "Rejected")
                          }
                          className={`px-3.5 py-2 rounded-lg text-xs font-extrabold border transition-all ${
                            candidate.status === "Rejected"
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
