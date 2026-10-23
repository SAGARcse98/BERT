"use client";

import React, { useMemo } from "react";
import { useBertStore } from "@/lib/store";

export function TalentPoolInsights() {
  const {
    candidates,
    jobs,
    activeJobId,
    skillFilter,
    setSkillFilter,
    minScoreFilter,
    setMinScoreFilter,
  } = useBertStore();

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const roleCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === activeJobId),
    [candidates, activeJobId]
  );

  const stats = useMemo(() => {
    const total = Math.max(1, roleCandidates.length);
    const strong = roleCandidates.filter((c) => c.bertMatchScore >= 80).length;
    const moderate = roleCandidates.filter(
      (c) => c.bertMatchScore >= 50 && c.bertMatchScore < 80
    ).length;
    const low = roleCandidates.filter((c) => c.bertMatchScore < 50).length;

    // Count skill gaps across applicants
    const gapCounts = new Map<string, number>();
    activeJob.requiredSkills.forEach((s) => gapCounts.set(s, 0));

    roleCandidates.forEach((c) => {
      c.missingCriticalSkills.forEach((ms) => {
        gapCounts.set(ms, (gapCounts.get(ms) || 0) + 1);
      });
    });

    const topGaps = Array.from(gapCounts.entries())
      .map(([skill, missingCount]) => ({
        skill,
        missingCount,
        matchedCount: roleCandidates.length - missingCount,
        coveragePct: Math.round(
          ((roleCandidates.length - missingCount) / total) * 100
        ),
      }))
      .sort((a, b) => a.coveragePct - b.coveragePct);

    return {
      total: roleCandidates.length,
      strong,
      moderate,
      low,
      strongPct: Math.round((strong / total) * 100),
      moderatePct: Math.round((moderate / total) * 100),
      lowPct: Math.round((low / total) * 100),
      topGaps,
    };
  }, [roleCandidates, activeJob]);

  if (roleCandidates.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left: Score Tier Distribution */}
      <div className="lg:col-span-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Applicant Pool Score Distribution
          </span>
          <button
            type="button"
            onClick={() => setMinScoreFilter(minScoreFilter === 80 ? 0 : 80)}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            {minScoreFilter === 80 ? "Show All Tiers" : "Filter Strong Fit (80%+)"}
          </button>
        </div>

        {/* Stacked Progress Bar */}
        <div className="mt-4 h-3.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
          {stats.strong > 0 && (
            <div
              style={{ width: `${stats.strongPct}%` }}
              className="bg-emerald-600 h-full transition-all"
              title={`Strong Fit (80%+): ${stats.strong}`}
            />
          )}
          {stats.moderate > 0 && (
            <div
              style={{ width: `${stats.moderatePct}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Moderate Fit (50-79%): ${stats.moderate}`}
            />
          )}
          {stats.low > 0 && (
            <div
              style={{ width: `${stats.lowPct}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Low Fit (<50%): ${stats.low}`}
            />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-bold">
          <span className="text-emerald-700 dark:text-emerald-400">
            Strong (80%+): {stats.strong} ({stats.strongPct}%)
          </span>
          <span className="text-amber-700 dark:text-amber-400">
            Moderate: {stats.moderate} ({stats.moderatePct}%)
          </span>
          <span className="text-rose-700 dark:text-rose-400">
            Low (&lt;50%): {stats.low} ({stats.lowPct}%)
          </span>
        </div>
      </div>

      {/* Right: Role Skill Coverage & Bottlenecks */}
      <div className="lg:col-span-7 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Role Skill Coverage Across {stats.total} Applicants (Click to Filter)
          </span>
          {skillFilter && (
            <button
              type="button"
              onClick={() => setSkillFilter(null)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Clear Skill Filter ({skillFilter})
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.topGaps.slice(0, 8).map((item) => {
            const isSelected = skillFilter === item.skill;
            return (
              <button
                key={item.skill}
                type="button"
                onClick={() =>
                  setSkillFilter(isSelected ? null : item.skill)
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-rose-600 bg-rose-50/80 dark:bg-rose-950/40"
                    : "border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-950 hover:border-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.skill}
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      item.coveragePct >= 75
                        ? "text-emerald-700 dark:text-emerald-400"
                        : item.coveragePct >= 50
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {item.coveragePct}%
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 mt-0.5">
                  {item.matchedCount} of {stats.total} have skill
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
