import { NextRequest, NextResponse } from "next/server";
import { INITIAL_JOBS } from "@/lib/mock-data";
import { analyzeResumeWithBertEngine } from "@/lib/bert-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jobId = body.jobId || INITIAL_JOBS[0].id;
    const job =
      INITIAL_JOBS.find((j) => j.id === jobId) || INITIAL_JOBS[0];
    const resumes: { filename: string; rawText: string }[] =
      body.resumes || [];

    const results = resumes.map((r) =>
      analyzeResumeWithBertEngine(r.filename, r.rawText, job, {
        embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
        llmProvider: "groq",
        llmModel: "llama-3.3-70b-versatile",
        semanticWeight: 40,
        skillWeight: 40,
        experienceWeight: 20,
        backendUrl: "http://localhost:8000",
        autoRejectThreshold: 45,
      })
    );

    results.sort((a, b) => b.bertMatchScore - a.bertMatchScore);

    return NextResponse.json({
      job_id: job.id,
      job_title: job.title,
      model_used: "sentence-transformers/all-MiniLM-L6-v2",
      total_processed: results.length,
      candidates: results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to analyze resumes", details: String(err) },
      { status: 400 }
    );
  }
}

