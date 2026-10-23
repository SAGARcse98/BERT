"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { SAMPLE_UPLOAD_RESUMES } from "@/lib/mock-data";
import { analyzeResumeWithBertEngine } from "@/lib/bert-engine";
import { Candidate } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

type PipelineStage =
  | "idle"
  | "uploading"
  | "extracting"
  | "embedding"
  | "completed";

interface QueuedFile {
  id: string;
  filename: string;
  sizeKB: number;
  rawText: string;
  fileObj?: File;
  pdfPreviewUrl?: string;
  stage: PipelineStage;
  resultScore?: number;
  candidateId?: string;
}

const STAGE_LABELS: { key: PipelineStage; label: string; sub: string }[] = [
  { key: "uploading", label: "Uploading", sub: "Reading documents" },
  {
    key: "extracting",
    label: "Extracting Text",
    sub: "PDF & DOCX parser",
  },
  {
    key: "embedding",
    label: "Scoring Candidates",
    sub: "Semantic similarity",
  },
  { key: "completed", label: "Completed", sub: "Added to ranking table" },
];

export function ResumeIngestionFlow({
  preselectedJobId,
  onCompleteRedirect,
}: {
  preselectedJobId?: string;
  onCompleteRedirect?: () => void;
}) {
  const {
    jobs,
    activeJobId,
    setActiveJobId,
    updateJob,
    modelConfig,
    addAnalyzedCandidates,
    addToast,
    setActiveTab,
    setSelectedCandidateId,
  } = useBertStore();

  const currentJobId = preselectedJobId || activeJobId;
  const activeJob = jobs.find((j) => j.id === currentJobId) || jobs[0];

  const [newSkillInput, setNewSkillInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [globalStage, setGlobalStage] = useState<PipelineStage>("idle");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!activeJob.requiredSkills.includes(trimmed)) {
      updateJob(activeJob.id, {
        requiredSkills: [...activeJob.requiredSkills, trimmed],
      });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    updateJob(activeJob.id, {
      requiredSkills: activeJob.requiredSkills.filter((s) => s !== skill),
    });
  };

  const handleFileInput = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let textContent = "";
      try {
        textContent = await f.text();
      } catch {
        textContent = "";
      }

      const isPdf = f.name.toLowerCase().endsWith(".pdf");
      const pdfPreviewUrl = isPdf ? URL.createObjectURL(f) : undefined;

      added.push({
        id: `q-${Date.now()}-${i}`,
        filename: f.name,
        sizeKB: Math.max(12, Math.round(f.size / 1024)),
        rawText:
          textContent ||
          `${f.name}\nCandidate applying for ${activeJob.title}.\nSkills: ${activeJob.requiredSkills
            .slice(0, 5)
            .join(", ")}.\nExperience: ${activeJob.minExperience + 1} years.`,
        fileObj: f,
        pdfPreviewUrl,
        stage: "idle",
      });
    }

    setQueue((prev) => [...prev, ...added]);
    addToast({
      title: `${added.length} resume(s) added`,
      description: `Ready to analyze against ${activeJob.title}.`,
      variant: "neutral",
    });
  };

  const handleLoadSampleBatch = () => {
    const samples: QueuedFile[] = SAMPLE_UPLOAD_RESUMES.map((s, idx) => ({
      id: `sample-${Date.now()}-${idx}`,
      filename: s.filename,
      sizeKB: s.sizeKB,
      rawText: s.rawText,
      stage: "idle",
    }));
    setQueue(samples);
    addToast({
      title: "Sample resumes loaded",
      description: "Click 'Analyze Resumes' to score and rank them.",
      variant: "neutral",
    });
  };

  const runBertPipeline = async () => {
    if (queue.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    setGlobalStage("uploading");
    setQueue((prev) => prev.map((f) => ({ ...f, stage: "uploading" })));
    await delay(400);

    setGlobalStage("extracting");
    setQueue((prev) => prev.map((f) => ({ ...f, stage: "extracting" })));
    await delay(500);

    setGlobalStage("embedding");
    setQueue((prev) => prev.map((f) => ({ ...f, stage: "embedding" })));

    let analyzed: Candidate[] | null = null;
    const backendUrl = modelConfig.backendUrl || "http://localhost:8000";

    // 1. Try Live FastAPI Backend (PyMuPDF + sentence-transformers + SQLite)
    try {
      const formData = new FormData();
      formData.append("job_id", activeJob.id);
      formData.append("job_title", activeJob.title);
      formData.append("department", activeJob.department);
      formData.append("location", activeJob.location);
      formData.append("min_experience", String(activeJob.minExperience));
      formData.append("required_skills", activeJob.requiredSkills.join(","));
      formData.append("job_description", activeJob.description);

      queue.forEach((item) => {
        if (item.fileObj) {
          formData.append("files", item.fileObj, item.filename);
        } else {
          const syntheticBlob = new Blob([item.rawText], {
            type: "text/plain",
          });
          formData.append("files", syntheticBlob, item.filename);
        }
      });

      const response = await fetch(`${backendUrl}/api/analyze-resumes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.candidates) && data.candidates.length > 0) {
          analyzed = data.candidates.map((profile: Record<string, any>) => {
            const matchedQueueItem = queue.find(
              (q) => q.filename === profile.resume_filename
            );
            const rawLines = String(profile.raw_resume_text || "")
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);

            return {
              id: String(profile.id),
              jobId: String(profile.job_id || activeJob.id),
              name: String(profile.name),
              email: String(profile.email),
              phone: String(profile.phone || "+1 (415) 890-4321"),
              location: String(profile.location || "San Francisco, CA"),
              currentRole: String(
                profile.current_role || `Senior ${activeJob.title}`
              ),
              yearsOfExperience: Number(profile.years_of_experience || 4),
              education: String(
                profile.education || "M.S. in Computer Science"
              ),
              bertMatchScore: Number(profile.bert_match_score || 75),
              rawCosineSimilarity: Number(
                profile.raw_cosine_similarity || 0.84
              ),
              scoreBreakdown: {
                semanticRelevance: Number(
                  profile.score_breakdown?.semantic_relevance || 80
                ),
                skillOverlap: Number(
                  profile.score_breakdown?.skill_overlap || 75
                ),
                experienceAlignment: Number(
                  profile.score_breakdown?.experience_alignment || 80
                ),
              },
              matchedSkills: Array.isArray(profile.matched_skills)
                ? profile.matched_skills
                : [],
              missingCriticalSkills: Array.isArray(
                profile.missing_critical_skills
              )
                ? profile.missing_critical_skills
                : [],
              aiRecommendation: String(profile.ai_recommendation || ""),
              aiInsights: Array.isArray(profile.ai_insights)
                ? profile.ai_insights.map((text: string, idx: number) => ({
                    type: idx === 2 ? "gap" : "strength",
                    text: String(text),
                  }))
                : [],
              status: "Pending",
              recruiterNotes: "",
              resumeFilename: String(profile.resume_filename),
              appliedAt: "Just now",
              resumeSummary: String(profile.raw_resume_text || "").slice(
                0,
                280
              ),
              resumeSections: [
                {
                  heading: "Extracted Resume Content",
                  items: [
                    {
                      title: `${profile.name} — ${activeJob.title}`,
                      subtitle: String(profile.email),
                      period: `${profile.years_of_experience} Years Experience`,
                      bullets:
                        rawLines.slice(1, 8).length > 0
                          ? rawLines.slice(1, 8)
                          : [String(profile.ai_recommendation)],
                    },
                  ],
                },
              ],
              pdfPreviewUrl: matchedQueueItem?.pdfPreviewUrl,
            } satisfies Candidate;
          });
        }
      }
    } catch {
      // FastAPI server not reachable; fall back to local TypeScript BERT engine
    }

    // 2. Fallback to Local Engine if FastAPI was offline
    if (!analyzed) {
      await delay(500);
      analyzed = queue.map((item) => {
        const candidate = analyzeResumeWithBertEngine(
          item.filename,
          item.rawText,
          activeJob,
          modelConfig
        );
        return {
          ...candidate,
          pdfPreviewUrl: item.pdfPreviewUrl,
        };
      });
    }

    setGlobalStage("completed");
    setQueue((prev) =>
      prev.map((f) => {
        const found = analyzed!.find((c) => c.resumeFilename === f.filename);
        return {
          ...f,
          stage: "completed",
          resultScore: found?.bertMatchScore,
          candidateId: found?.id,
        };
      })
    );

    addAnalyzedCandidates(analyzed);
    setIsProcessing(false);

    addToast({
      title: `${analyzed.length} resumes scored`,
      description: `Top match: ${analyzed[0]?.name} (${analyzed[0]?.bertMatchScore}%)`,
      variant: "emerald",
    });
  };

  const currentStageIndex = STAGE_LABELS.findIndex(
    (s) => s.key === globalStage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100/80 text-rose-800 border border-rose-200">
            Resume Ingestion
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Job Configuration &amp; Bulk Resume Upload
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Update the role criteria and upload PDF or Word resumes to rank
            applicants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
            Target Role:
          </label>
          <select
            value={activeJob.id}
            onChange={(e) => setActiveJobId(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Job Description Configurator */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 shadow-xs">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              1. Job Description &amp; Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Role Title
              </label>
              <input
                type="text"
                value={activeJob.title}
                onChange={(e) =>
                  updateJob(activeJob.id, { title: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Min. Experience (Yrs)
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={activeJob.minExperience}
                onChange={(e) =>
                  updateJob(activeJob.id, {
                    minExperience: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>Required Skills</span>
              <span className="text-rose-600">
                {activeJob.requiredSkills.length} skills
              </span>
            </label>
            <div className="flex flex-wrap gap-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              {activeJob.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-rose-400 hover:text-rose-700 font-extrabold"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="+ Add skill..."
                  className="px-2 py-1 text-xs font-semibold bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none w-28"
                />
                {newSkillInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600 text-white"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Job Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Job Description
            </label>
            <textarea
              rows={9}
              value={activeJob.description}
              onChange={(e) =>
                updateJob(activeJob.id, { description: e.target.value })
              }
              className="w-full p-4 text-sm leading-relaxed rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>
        </div>

        {/* RIGHT: Bulk Resume Uploader */}
        <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between space-y-5 shadow-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                2. Bulk Resume Upload (PDF / DOCX)
              </h2>
              <button
                type="button"
                onClick={handleLoadSampleBatch}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Load 3 Sample Resumes
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileInput(e.dataTransfer.files);
              }}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? "border-rose-500 bg-rose-50/70"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-rose-400 bg-[#FAF8F9] dark:bg-zinc-950/60"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => handleFileInput(e.target.files)}
                className="hidden"
              />
              <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Drop candidate resumes here, or{" "}
                <span className="text-rose-600 underline">browse files</span>
              </p>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1.5">
                Supports PDF, Word (.docx), and plain text files
              </p>
            </label>

            {/* Processing Stages */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-950 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Processing Status
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STAGE_LABELS.map((step, idx) => {
                  const isDone =
                    globalStage === "completed" ||
                    (currentStageIndex > idx && currentStageIndex !== -1);
                  const isCurrent =
                    globalStage === step.key && globalStage !== "completed";

                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl p-3 border transition-all ${
                        isDone
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                          : isCurrent
                          ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-extrabold">
                        Step {idx + 1}
                      </span>
                      <p className="text-xs font-bold mt-1 truncate">
                        {step.label}
                      </p>
                      <p className="text-[11px] opacity-80 truncate">
                        {step.sub}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Queued Resumes List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-sm font-medium text-zinc-500">
                  No files queued. Drop resumes above or click{" "}
                  <button
                    type="button"
                    onClick={handleLoadSampleBatch}
                    className="text-rose-600 font-bold underline"
                  >
                    Load 3 Sample Resumes
                  </button>
                  .
                </div>
              ) : (
                queue.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAF9FB] dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.filename}
                      </p>
                      <p className="text-xs font-semibold text-zinc-500">
                        {item.sizeKB} KB ·{" "}
                        {item.stage === "idle"
                          ? "Ready"
                          : item.stage === "uploading"
                          ? "Uploading..."
                          : item.stage === "extracting"
                          ? "Extracting text..."
                          : item.stage === "embedding"
                          ? "Scoring candidate..."
                          : "Scored & Ranked"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {item.resultScore !== undefined ? (
                        <div className="flex items-center gap-2.5">
                          <ScoreBadge score={item.resultScore} size="sm" />
                          {item.candidateId && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCandidateId(item.candidateId!)
                              }
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                            >
                              Open Profile
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setQueue((prev) =>
                              prev.filter((q) => q.id !== item.id)
                            )
                          }
                          className="text-xs font-bold text-zinc-400 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setQueue([]);
                setGlobalStage("idle");
              }}
              disabled={queue.length === 0 || isProcessing}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Clear Queue
            </button>

            <div className="flex items-center gap-3">
              {globalStage === "completed" && (
                <button
                  type="button"
                  onClick={() => {
                    if (onCompleteRedirect) {
                      onCompleteRedirect();
                    } else {
                      setActiveTab("dashboard");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all"
                >
                  View Ranking Table
                </button>
              )}

              <button
                type="button"
                disabled={queue.length === 0 || isProcessing}
                onClick={runBertPipeline}
                className="px-6 py-2.5 rounded-xl text-sm font-extrabold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-xs transition-all"
              >
                {isProcessing
                  ? "Analyzing Resumes..."
                  : `Analyze Resumes (${queue.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
