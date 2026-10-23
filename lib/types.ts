export type CandidateStatus = "Pending" | "Selected" | "Rejected";

export interface ScoreBreakdown {
  semanticRelevance: number; // 0-100 (Weight: 40%)
  skillOverlap: number; // 0-100 (Weight: 40%)
  experienceAlignment: number; // 0-100 (Weight: 20%)
}

export interface ResumeSection {
  heading: string;
  items: {
    title: string;
    subtitle?: string;
    period?: string;
    bullets: string[];
  }[];
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  yearsOfExperience: number;
  education: string;
  bertMatchScore: number; // 0-100
  rawCosineSimilarity: number; // e.g. 0.874
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  aiRecommendation: string;
  aiInsights: {
    type: "strength" | "strength_secondary" | "gap";
    text: string;
  }[];
  status: CandidateStatus;
  recruiterNotes: string;
  resumeFilename: string;
  appliedAt: string;
  resumeSummary: string;
  resumeSections: ResumeSection[];
  pdfPreviewUrl?: string;
}

export interface JobOpening {
  id: string;
  code: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  minExperience: number;
  requiredSkills: string[];
  description: string;
}

export type ActiveNavTab = "dashboard" | "jobs" | "candidates" | "settings" | "upload";

export interface BertModelConfig {
  embeddingModel: "sentence-transformers/all-MiniLM-L6-v2" | "google-bert/bert-base-uncased" | "BAAI/bge-large-en-v1.5";
  llmProvider: "ollama" | "groq" | "openai";
  llmModel: string;
  semanticWeight: number; // default 40
  skillWeight: number; // default 40
  experienceWeight: number; // default 20
  backendUrl: string;
  autoRejectThreshold: number;
}
