# BERT — Intelligent Resume Analyzer & Applicant Tracking System (ATS)

Built for **Bertlab**, **BERT** is a full-stack AI-powered recruitment and resume-screening platform that analyzes incoming candidate resumes against specific Job Descriptions (JDs), scores applicants using transformer-based semantic matching (`sentence-transformers/all-MiniLM-L6-v2` & `BERT-base`), extracts structured candidate profiles, and enables recruiters to seamlessly **Select**, **Reject**, **Compare**, and **Export** applicants through a clean, bold dashboard.

---

## Key Features

### 1. Overview & Analytics Dashboard (`/dashboard`)
- **KPI Metric Cards:** Real-time counters for *Total Applications*, *Average Match Score*, *Selected*, *Rejected*, and *Pending Review*.
- **Quick Role Switcher:** Switch effortlessly between active Bertlab job openings (*AI/ML Engineer*, *Full-Stack Developer*, *HPC Systems Engineer*, or custom requisitions).

### 2. Candidate Ranking & Action Table
- **Automatic Semantic Ranking:** Sorted by **BERT Match Score (Highest → Lowest)** with toggleable sort order.
- **Visual Radial Score Badges:** Color-coded circular progress rings (`>80%` Emerald Strong Fit, `50–79%` Amber Moderate Fit, `<50%` Rose Low Fit).
- **Skill Gap Tagging:** Highlights **Matched Skills** alongside **Missing Critical Skills** for each candidate.
- **Filtering & Batch Actions:** Filter by status (`All`, `Pending Review`, `Selected`, `Rejected`), minimum score slider (`75%+` quick toggle), skill pills, or text search. Includes batch checkboxes (`Select Checked`, `Reject Checked`, `Select All 80%+`) and **1-click CSV Shortlist Export**.

### 3. Side-by-Side Candidate Comparison Matrix
- Compare 2 to 4 shortlisted finalists side-by-side across Match Score, Cosine Similarity, Semantic Relevance, Skill Overlap, Experience Alignment, and a complete Required Skills checklist.

### 4. Slide-Over Candidate Deep-Dive Inspector
- **Weighted Score Breakdown:**
  - **Semantic Relevance (40%):** Transformer vector cosine similarity between the Job Description and Resume.
  - **Skill Overlap (40%):** Coverage of required role technical skills.
  - **Experience Alignment (20%):** Candidate years of experience vs. role minimum requirement.
- **Evaluation Insights:** 3-bullet "Why Select / Why Reject" summary highlighting candidate strengths and skill gaps.
- **Side-by-Side Document Preview:** View structured extracted resume sections or toggle to the **Original Embedded PDF Viewer** for uploaded PDFs.
- **Sticky Decision Footer:** Instant **[ Select for Interview ]** and **[ Reject Application ]** buttons with persistent recruiter notes.

### 5. Job Configurator & Bulk Resume Ingestion (`/jobs/[id]/upload`)
- **Interactive JD Editor:** Customize role title, minimum experience, required skill tags, and full Job Description text.
- **Create New Job Openings:** Add custom requisitions directly from the `Active Jobs` view.
- **Drag-and-Drop Multi-File Uploader:** Drop multiple `.pdf`, `.docx`, or `.txt` resumes (or load the built-in sample batch) with real-time step tracking (*Uploading → Extracting Text → Scoring Candidates → Completed*).

---

## Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, TypeScript, React 19) |
| **Styling & Typography** | Tailwind CSS, Plus Jakarta Sans & JetBrains Mono, Light Rose & Warm Grey Palette |
| **State & Persistence** | Zustand (`persist` localStorage middleware) + Framer Motion animations |
| **Backend API** | FastAPI (Python), Uvicorn |
| **Document Parsing** | `PyMuPDF` (`fitz`) for PDFs, `python-docx` for Word files |
| **AI & Semantic Engine** | Hugging Face `sentence-transformers` (`all-MiniLM-L6-v2` / `bert-base-uncased`) + OpenAI/Groq/Ollama Pydantic structured extraction |
| **Database** | Built-in SQLite (`backend/bert_ats.db`) + PostgreSQL/Prisma schema (`backend/schema.prisma`) |

---

## Project Structure

```text
BERT/
├── app/
│   ├── layout.tsx                        # Root App Router layout & Plus Jakarta Sans typography
│   ├── page.tsx                          # Main ATS Dashboard view
│   ├── dashboard/page.tsx                # /dashboard route
│   ├── jobs/[id]/upload/page.tsx         # /jobs/[id]/upload JD & Bulk Resume Ingestion flow
│   └── api/
│       ├── analyze-resumes/route.ts      # Next.js API fallback for POST /api/analyze-resumes
│       └── candidates/[id]/status/route.ts # Next.js API fallback for PATCH /api/candidates/{id}/status
├── components/
│   ├── BertWorkspace.tsx                 # Main workspace shell, KPI cards & role switcher
│   ├── Sidebar.tsx                       # Navigation sidebar & pipeline summary
│   ├── CandidateRankingTable.tsx         # Ranked candidate table, filters, batch actions & CSV export
│   ├── CandidateDrawer.tsx               # Slide-over inspector with side-by-side PDF preview
│   ├── CandidateComparisonModal.tsx      # Side-by-side candidate comparison matrix
│   ├── ResumeIngestionFlow.tsx           # JD configurator & drag-and-drop bulk uploader
│   ├── ActiveJobsView.tsx                # Job openings cards & "+ Create Job Opening" modal
│   ├── BertModelSettingsView.tsx         # Embedding model selector & weight sliders
│   ├── ScoreBadge.tsx                    # Animated circular score progress badge
│   ├── StatusPill.tsx                    # Candidate status badge
│   └── ToastContainer.tsx                # Toast notification system
├── lib/
│   ├── types.ts                          # Core TypeScript interfaces
│   ├── mock-data.ts                      # Initial Bertlab job openings & sample candidates
│   ├── bert-engine.ts                    # Cosine similarity & structured profile extractor
│   └── store.ts                          # Persistent Zustand store
└── backend/
    ├── main.py                           # FastAPI application, BERTResumeAnalyzer & SQLite repo
    ├── requirements.txt                  # Python backend dependencies
    └── schema.prisma                     # Prisma PostgreSQL database schema
```

---

## Getting Started

### 1. Frontend Setup (Next.js)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Setup (FastAPI + Sentence-Transformers)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- **API Base URL:** `http://localhost:8000`
- **Interactive Swagger UI:** `http://localhost:8000/docs`

### Core FastAPI Endpoints
- `GET /api/health` — Engine & model health check
- `POST /api/analyze-resumes` — Upload multiple PDF/DOCX resumes and score against a Job Description
- `PATCH /api/candidates/{id}/status` — Update candidate status (`Pending`, `Selected`, `Rejected`) and recruiter notes
- `GET /api/candidates` — List persisted candidates from SQLite
- `POST /api/jobs` — Create or update a Job Opening in SQLite
