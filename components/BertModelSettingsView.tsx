"use client";

import React, { useEffect, useState } from "react";
import { useBertStore } from "@/lib/store";
import { BertModelConfig } from "@/lib/types";

export function BertModelSettingsView() {
  const { modelConfig, updateModelConfig, resetDemoData, addToast } =
    useBertStore();

  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(
          `${modelConfig.backendUrl || "http://localhost:8000"}/api/health`
        );
        if (res.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };
    checkHealth();
  }, [modelConfig.backendUrl]);

  const handleResetWeights = () => {
    updateModelConfig({
      semanticWeight: 40,
      skillWeight: 40,
      experienceWeight: 20,
    });
    addToast({
      title: "Weights restored",
      description: "Semantic 40% · Skill Overlap 40% · Experience 20%",
      variant: "neutral",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-100/80 text-rose-800 border border-rose-200">
            Configuration
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Scoring &amp; Model Settings
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Configure the semantic embedding model, scoring weights, and local
            storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDemoData}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            Reset Demo Data
          </button>
          <button
            onClick={() =>
              addToast({
                title: "Settings saved",
                description: `Active model: ${modelConfig.embeddingModel}`,
                variant: "emerald",
              })
            }
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Embedding Model */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            1. Embedding Model
          </h2>

          <div className="space-y-3">
            {(
              [
                {
                  id: "sentence-transformers/all-MiniLM-L6-v2",
                  title: "all-MiniLM-L6-v2",
                  desc: "Fast 384-dimensional semantic encoder — default for high-volume resume screening.",
                  badge: "Default",
                },
                {
                  id: "google-bert/bert-base-uncased",
                  title: "bert-base-uncased",
                  desc: "768-dimensional bidirectional transformer encoder for full-document matching.",
                  badge: "768-d",
                },
                {
                  id: "BAAI/bge-large-en-v1.5",
                  title: "bge-large-en-v1.5",
                  desc: "1024-dimensional retrieval encoder for deep technical role matching.",
                  badge: "High Precision",
                },
              ] as const
            ).map((m) => {
              const selected = modelConfig.embeddingModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => updateModelConfig({ embeddingModel: m.id })}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    selected
                      ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-rose-300 bg-[#FAF9FB] dark:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {m.title}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Scoring Weights */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              2. Scoring Formula Weights
            </h2>
            <button
              onClick={handleResetWeights}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Reset to 40 / 40 / 20
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Semantic Relevance
                </span>
                <span className="font-extrabold text-rose-600">
                  {modelConfig.semanticWeight}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={modelConfig.semanticWeight}
                onChange={(e) =>
                  updateModelConfig({ semanticWeight: Number(e.target.value) })
                }
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Skill Overlap
                </span>
                <span className="font-extrabold text-emerald-600">
                  {modelConfig.skillWeight}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={modelConfig.skillWeight}
                onChange={(e) =>
                  updateModelConfig({ skillWeight: Number(e.target.value) })
                }
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Experience Alignment
                </span>
                <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                  {modelConfig.experienceWeight}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={modelConfig.experienceWeight}
                onChange={(e) =>
                  updateModelConfig({
                    experienceWeight: Number(e.target.value),
                  })
                }
                className="w-full accent-zinc-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Extraction Provider
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["groq", "ollama", "openai"] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() =>
                    updateModelConfig({
                      llmProvider: prov as BertModelConfig["llmProvider"],
                    })
                  }
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase border transition-all ${
                    modelConfig.llmProvider === prov
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Backend Connection Bar */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              FastAPI + SQLite Server Connection
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                backendStatus === "online"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-zinc-100 text-zinc-700 border border-zinc-200"
              }`}
            >
              {backendStatus === "online"
                ? "Connected (Port 8000)"
                : "Local Engine Active (Port 8000 Offline)"}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 mt-1">
            When `python main.py` is running on port 8000, uploads use PyMuPDF +
            Hugging Face SentenceTransformers and save to `backend/bert_ats.db`.
          </p>
        </div>

        <input
          type="text"
          value={modelConfig.backendUrl}
          onChange={(e) => updateModelConfig({ backendUrl: e.target.value })}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 w-56"
        />
      </div>
    </div>
  );
}
