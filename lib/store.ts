"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_CANDIDATES, INITIAL_JOBS } from "./mock-data";
import {
  ActiveNavTab,
  BertModelConfig,
  Candidate,
  CandidateStatus,
  JobOpening,
} from "./types";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: "emerald" | "rose" | "neutral" | "amber";
}

function recalculateCandidateForJob(
  candidate: Candidate,
  job: JobOpening,
  config: BertModelConfig
): Candidate {
  const knownCandidateSkills = new Set(
    [
      ...candidate.matchedSkills,
      ...candidate.resumeSummary.split(/[\s,.;()/]+/),
      ...candidate.resumeSections.flatMap((s) =>
        s.items.flatMap((i) => i.bullets.join(" ").split(/[\s,.;()/]+/))
      ),
    ].map((s) => s.toLowerCase())
  );

  const fullCorpus = [
    candidate.matchedSkills.join(" "),
    candidate.resumeSummary,
    candidate.currentRole,
    candidate.resumeSections
      .flatMap((s) => s.items.flatMap((i) => [i.title, ...i.bullets]))
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const matchedSkills: string[] = [];
  const missingCriticalSkills: string[] = [];

  for (const reqSkill of job.requiredSkills) {
    const lowerReq = reqSkill.toLowerCase();
    if (
      knownCandidateSkills.has(lowerReq) ||
      fullCorpus.includes(lowerReq)
    ) {
      matchedSkills.push(reqSkill);
    } else {
      missingCriticalSkills.push(reqSkill);
    }
  }

  const skillOverlap = Math.round(
    (matchedSkills.length / Math.max(1, job.requiredSkills.length)) * 100
  );

  const expRatio =
    job.minExperience > 0
      ? candidate.yearsOfExperience / job.minExperience
      : 1.1;
  const experienceAlignment = Math.min(
    100,
    Math.max(30, Math.round(expRatio * 88))
  );

  const semanticRelevance = candidate.scoreBreakdown.semanticRelevance;

  const totalWeight =
    config.semanticWeight + config.skillWeight + config.experienceWeight || 100;
  const wSem = config.semanticWeight / totalWeight;
  const wSkill = config.skillWeight / totalWeight;
  const wExp = config.experienceWeight / totalWeight;

  const bertMatchScore = Math.min(
    99,
    Math.max(
      20,
      Math.round(
        semanticRelevance * wSem +
          skillOverlap * wSkill +
          experienceAlignment * wExp
      )
    )
  );

  return {
    ...candidate,
    matchedSkills,
    missingCriticalSkills,
    bertMatchScore,
    scoreBreakdown: {
      semanticRelevance,
      skillOverlap,
      experienceAlignment,
    },
  };
}

interface BertStoreState {
  // Theme (Default: Light Rose & Warm Grey)
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Navigation & View Mode
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  viewMode: "table" | "board";
  setViewMode: (mode: "table" | "board") => void;

  // Jobs & Active Role
  jobs: JobOpening[];
  activeJobId: string;
  setActiveJobId: (id: string) => void;
  updateJob: (jobId: string, updates: Partial<JobOpening>) => void;
  addJob: (newJob: JobOpening) => void;

  // Candidates
  candidates: Candidate[];
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
  updateCandidateStatus: (
    candidateId: string,
    status: CandidateStatus,
    notes?: string
  ) => void;
  bulkUpdateCandidateStatus: (
    candidateIds: string[],
    status: CandidateStatus
  ) => void;
  updateCandidateNotes: (candidateId: string, notes: string) => void;
  addAnalyzedCandidates: (newCandidates: Candidate[]) => void;
  recalculateAllScores: () => void;

  // Side-by-Side Candidate Comparison
  comparisonCandidateIds: string[];
  toggleComparisonCandidate: (id: string) => void;
  setComparisonCandidateIds: (ids: string[]) => void;
  isComparisonModalOpen: boolean;
  setComparisonModalOpen: (open: boolean) => void;

  // Filters
  statusFilter: "All" | CandidateStatus;
  setStatusFilter: (status: "All" | CandidateStatus) => void;
  minScoreFilter: number;
  setMinScoreFilter: (score: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  skillFilter: string | null;
  setSkillFilter: (skill: string | null) => void;
  resetFilters: () => void;

  // BERT Model Settings
  modelConfig: BertModelConfig;
  updateModelConfig: (updates: Partial<BertModelConfig>) => void;
  resetDemoData: () => void;

  // Toast Notifications
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useBertStore = create<BertStoreState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),
      viewMode: "table",
      setViewMode: (viewMode) => set({ viewMode }),

      jobs: INITIAL_JOBS,
      activeJobId: INITIAL_JOBS[0].id,
      setActiveJobId: (id) =>
        set({
          activeJobId: id,
          skillFilter: null,
        }),
      updateJob: (jobId, updates) =>
        set((state) => {
          const updatedJobs = state.jobs.map((j) =>
            j.id === jobId ? { ...j, ...updates } : j
          );
          const targetJob = updatedJobs.find((j) => j.id === jobId);

          // Automatically re-score candidates for this job if skills or minExperience changed
          const shouldRescore =
            targetJob &&
            (updates.requiredSkills !== undefined ||
              updates.minExperience !== undefined);

          const updatedCandidates = shouldRescore
            ? state.candidates.map((c) =>
                c.jobId === jobId
                  ? recalculateCandidateForJob(c, targetJob!, state.modelConfig)
                  : c
              )
            : state.candidates;

          return {
            jobs: updatedJobs,
            candidates: updatedCandidates,
          };
        }),
      addJob: (newJob) => {
        set((state) => ({
          jobs: [newJob, ...state.jobs],
          activeJobId: newJob.id,
        }));
        get().addToast({
          title: `Created role: ${newJob.title}`,
          description: `${newJob.code} · ${newJob.department}`,
          variant: "emerald",
        });

        const backendUrl =
          get().modelConfig.backendUrl || "http://localhost:8000";
        fetch(`${backendUrl}/api/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newJob.id,
            code: newJob.code,
            title: newJob.title,
            department: newJob.department,
            location: newJob.location,
            min_experience: newJob.minExperience,
            required_skills: newJob.requiredSkills,
            description: newJob.description,
          }),
        }).catch(() => {});
      },

      candidates: INITIAL_CANDIDATES,
      selectedCandidateId: null,
      setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),

      updateCandidateStatus: (candidateId, status, notes) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === candidateId
              ? {
                  ...c,
                  status,
                  recruiterNotes:
                    notes !== undefined ? notes : c.recruiterNotes,
                }
              : c
          ),
        }));

        if (candidate) {
          get().addToast({
            title:
              status === "Selected"
                ? `${candidate.name} marked as Selected`
                : status === "Rejected"
                ? `${candidate.name} marked as Rejected`
                : `${candidate.name} moved to Pending`,
            description: `Match Score: ${candidate.bertMatchScore}%`,
            variant:
              status === "Selected"
                ? "emerald"
                : status === "Rejected"
                ? "rose"
                : "neutral",
          });
        }

        const payload = JSON.stringify({
          status,
          recruiter_notes: notes,
        });
        const backendUrl =
          get().modelConfig.backendUrl || "http://localhost:8000";

        fetch(`${backendUrl}/api/candidates/${candidateId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: payload,
        }).catch(() => {
          fetch(`/api/candidates/${candidateId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: payload,
          }).catch(() => {});
        });
      },

      bulkUpdateCandidateStatus: (candidateIds, status) => {
        if (candidateIds.length === 0) return;
        const idSet = new Set(candidateIds);
        set((state) => ({
          candidates: state.candidates.map((c) =>
            idSet.has(c.id) ? { ...c, status } : c
          ),
        }));

        get().addToast({
          title: `Updated ${candidateIds.length} candidates to ${status}`,
          description: "Batch update saved.",
          variant: status === "Selected" ? "emerald" : "rose",
        });

        const backendUrl =
          get().modelConfig.backendUrl || "http://localhost:8000";
        candidateIds.forEach((id) => {
          fetch(`${backendUrl}/api/candidates/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }).catch(() => {});
        });
      },

      updateCandidateNotes: (candidateId, notes) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === candidateId ? { ...c, recruiterNotes: notes } : c
          ),
        }));
        get().addToast({
          title: "Notes saved",
          description: "Recruiter notes updated on candidate profile.",
          variant: "neutral",
        });

        if (candidate) {
          const backendUrl =
            get().modelConfig.backendUrl || "http://localhost:8000";
          fetch(`${backendUrl}/api/candidates/${candidateId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: candidate.status,
              recruiter_notes: notes,
            }),
          }).catch(() => {});
        }
      },

      addAnalyzedCandidates: (newCandidates) => {
        set((state) => ({
          candidates: [...newCandidates, ...state.candidates],
        }));
      },

      recalculateAllScores: () => {
        set((state) => {
          const jobMap = new Map(state.jobs.map((j) => [j.id, j]));
          return {
            candidates: state.candidates.map((c) => {
              const job = jobMap.get(c.jobId);
              return job
                ? recalculateCandidateForJob(c, job, state.modelConfig)
                : c;
            }),
          };
        });
        get().addToast({
          title: "All candidate scores recalculated",
          description: "Rankings updated using current role skills and weights.",
          variant: "emerald",
        });
      },

      comparisonCandidateIds: [],
      toggleComparisonCandidate: (id) =>
        set((state) => {
          const exists = state.comparisonCandidateIds.includes(id);
          if (exists) {
            return {
              comparisonCandidateIds: state.comparisonCandidateIds.filter(
                (item) => item !== id
              ),
            };
          }
          if (state.comparisonCandidateIds.length >= 4) {
            get().addToast({
              title: "Maximum 4 candidates for comparison",
              description: "Deselect a candidate first to add another.",
              variant: "amber",
            });
            return state;
          }
          return {
            comparisonCandidateIds: [...state.comparisonCandidateIds, id],
          };
        }),
      setComparisonCandidateIds: (ids) =>
        set({ comparisonCandidateIds: ids.slice(0, 4) }),
      isComparisonModalOpen: false,
      setComparisonModalOpen: (open) => set({ isComparisonModalOpen: open }),

      statusFilter: "All",
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      minScoreFilter: 0,
      setMinScoreFilter: (minScoreFilter) => set({ minScoreFilter }),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      skillFilter: null,
      setSkillFilter: (skillFilter) => set({ skillFilter }),
      resetFilters: () =>
        set({
          statusFilter: "All",
          minScoreFilter: 0,
          searchQuery: "",
          skillFilter: null,
        }),

      modelConfig: {
        embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
        llmProvider: "groq",
        llmModel: "llama-3.3-70b-versatile",
        semanticWeight: 40,
        skillWeight: 40,
        experienceWeight: 20,
        backendUrl: "http://localhost:8000",
        autoRejectThreshold: 45,
      },
      updateModelConfig: (updates) =>
        set((state) => {
          const nextConfig = { ...state.modelConfig, ...updates };
          const weightsChanged =
            updates.semanticWeight !== undefined ||
            updates.skillWeight !== undefined ||
            updates.experienceWeight !== undefined;

          if (!weightsChanged) {
            return { modelConfig: nextConfig };
          }

          const jobMap = new Map(state.jobs.map((j) => [j.id, j]));
          return {
            modelConfig: nextConfig,
            candidates: state.candidates.map((c) => {
              const job = jobMap.get(c.jobId);
              return job ? recalculateCandidateForJob(c, job, nextConfig) : c;
            }),
          };
        }),
      resetDemoData: () => {
        set({
          jobs: INITIAL_JOBS,
          activeJobId: INITIAL_JOBS[0].id,
          candidates: INITIAL_CANDIDATES,
          comparisonCandidateIds: [],
          selectedCandidateId: null,
        });
        get().addToast({
          title: "Demo data restored",
          description: "Jobs and candidates reset to initial Bertlab dataset.",
          variant: "neutral",
        });
      },

      toasts: [],
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts.slice(-3), { ...toast, id }],
        }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 3500);
      },
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "bertlab-ats-storage-v2",
      partialize: (state) => ({
        theme: state.theme,
        jobs: state.jobs,
        activeJobId: state.activeJobId,
        candidates: state.candidates,
        modelConfig: state.modelConfig,
        viewMode: state.viewMode,
      }),
    }
  )
);
