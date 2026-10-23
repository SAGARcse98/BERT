"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useBertStore } from "@/lib/store";
import { ScoreBadge } from "./ScoreBadge";

export function ActiveJobsView() {
  const {
    jobs,
    candidates,
    activeJobId,
    setActiveJobId,
    setActiveTab,
    addJob,
  } = useBertStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("BERT-ENG-04");
  const [department, setDepartment] = useState("Product & AI Engineering");
  const [location, setLocation] = useState("San Francisco, CA / Remote");
  const [minExperience, setMinExperience] = useState(3);
  const [skillsText, setSkillsText] = useState(
    "Python, TypeScript, PyTorch, Next.js, PostgreSQL, Docker"
  );
  const [description, setDescription] = useState(
    "We are looking for an experienced engineer to build and scale core product & AI features at Bertlab."
  );

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    addJob({
      id: `job-${Date.now()}`,
      code: code.trim() || "BERT-NEW",
      title: title.trim(),
      department: department.trim() || "Engineering",
      location: location.trim() || "Remote",
      employmentType: "Full-Time",
      minExperience: Number(minExperience) || 2,
      requiredSkills: skills.length > 0 ? skills : ["Python", "TypeScript"],
      description: description.trim(),
    });

    setTitle("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100/80 text-rose-800 border border-rose-200">
            Bertlab Openings
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Active Job Openings ({jobs.length})
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Select an opening to view ranked applicants, upload resumes, or
            create a new requisition.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors w-fit"
        >
          + Create Job Opening
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const jobCandidates = candidates.filter((c) => c.jobId === job.id);
          const avgScore = jobCandidates.length
            ? Math.round(
                jobCandidates.reduce((s, c) => s + c.bertMatchScore, 0) /
                  jobCandidates.length
              )
            : 0;
          const selectedCount = jobCandidates.filter(
            (c) => c.status === "Selected"
          ).length;
          const isCurrent = job.id === activeJobId;

          return (
            <div
              key={job.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isCurrent
                  ? "border-rose-300 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {job.code} · {job.department}
                    </span>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
                      {job.title}
                    </h2>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                      {job.location} · Min {job.minExperience}+ years
                    </p>
                  </div>
                  <ScoreBadge score={avgScore} size="md" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Required Skills ({job.requiredSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {job.description.replace(/###/g, "")}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                  <span>{jobCandidates.length} Total Applicants</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {selectedCount} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setActiveJobId(job.id);
                      setActiveTab("dashboard");
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-extrabold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    View Candidates
                  </button>

                  <Link
                    href={`/jobs/${job.id}/upload`}
                    onClick={() => setActiveJobId(job.id)}
                    className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white text-center transition-colors shadow-xs"
                  >
                    Upload Resumes
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
            />
            <motion.form
              onSubmit={handleCreateJob}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  Create New Job Opening
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Job Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Data Engineer"
                    className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Role Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Min. Years Exp
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={minExperience}
                    onChange={(e) =>
                      setMinExperience(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Required Skills (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Job Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
