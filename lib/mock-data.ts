import { Candidate, JobOpening } from "./types";

export const INITIAL_JOBS: JobOpening[] = [
  {
    id: "job-ai-ml",
    code: "BERT-AI-01",
    title: "AI/ML Engineer",
    department: "Core Transformer Research",
    location: "San Francisco, CA (Hybrid)",
    employmentType: "Full-Time · L5/L6",
    minExperience: 4,
    requiredSkills: [
      "PyTorch",
      "Transformers",
      "CUDA",
      "Python",
      "vLLM",
      "FastAPI",
      "Ray",
      "Docker",
    ],
    description: `Bertlab is seeking a Senior AI/ML Engineer to architect, fine-tune, and serve low-latency transformer embedding pipelines and LLM reasoning microservices.

### Key Responsibilities
- Fine-tune encoder/decoder models (BERT, RoBERTa, Llama-3, BGE) using PyTorch, DeepSpeed, and FSDP across multi-node GPU clusters.
- Optimize inference latency and throughput using custom CUDA/Triton kernels, TensorRT-LLM, and vLLM continuous batching.
- Build scalable vector retrieval and semantic ranking pipelines integrated with FastAPI and distributed Ray workers.
- Partner with product engineering to deploy production evaluation harnesses with deterministic Pydantic structured outputs.

### Minimum Qualifications
- 4+ years of production experience in Machine Learning Engineering or NLP Research.
- Deep proficiency in Python, PyTorch, Hugging Face Transformers, and GPU acceleration (CUDA).
- Hands-on experience deploying containerized ML microservices with FastAPI, Docker, and Kubernetes/Ray.`,
  },
  {
    id: "job-fullstack",
    code: "BERT-FS-02",
    title: "Full-Stack Developer",
    department: "Platform & Product Experience",
    location: "New York, NY / Remote",
    employmentType: "Full-Time · L4/L5",
    minExperience: 3,
    requiredSkills: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Node.js",
      "GraphQL",
    ],
    description: `Bertlab is looking for a product-minded Full-Stack Developer to craft ultra-responsive, Linear-grade web interfaces and resilient backend APIs for our intelligent talent platform.

### Key Responsibilities
- Architect high-performance React 19 & Next.js App Router applications with TypeScript, Tailwind CSS, and Framer Motion.
- Design real-time optimistic state workflows using TanStack Query, Zustand, and WebSockets/SSE streaming.
- Model relational and vector schemas in PostgreSQL (pgvector) using Prisma ORM and Node.js/FastAPI gateways.
- Maintain strict accessibility (WCAG AA), sub-50ms interaction latency, and clean design system primitives.

### Minimum Qualifications
- 3+ years of full-stack software engineering experience shipping production SaaS applications.
- Mastery of TypeScript, React, Next.js App Router, Tailwind CSS, and PostgreSQL/Prisma.`,
  },
  {
    id: "job-hpc",
    code: "BERT-HPC-03",
    title: "HPC Systems Engineer",
    department: "Compute Infrastructure",
    location: "Austin, TX (On-site / Hybrid)",
    employmentType: "Full-Time · Senior",
    minExperience: 5,
    requiredSkills: [
      "C++",
      "CUDA",
      "Slurm",
      "InfiniBand",
      "Kubernetes",
      "Linux Kernel",
      "NCCL",
      "Rust",
    ],
    description: `Bertlab's Compute Infrastructure group runs bare-metal H100/B200 GPU clusters. We need an HPC Systems Engineer to maximize cluster utilization, RDMA networking throughput, and fault-tolerant scheduling.

### Key Responsibilities
- Architect and tune multi-node GPU training fabrics over InfiniBand/RoCEv2 with NCCL collective communications.
- Manage workload orchestration across Slurm and Kubernetes (Kueue / GPU Operator) for 1,000+ GPU clusters.
- Write high-performance telemetry daemons and custom storage drivers in C++, Rust, and CUDA.
- Automate bare-metal provisioning, Linux kernel tuning, and automated hardware fault quarantine.

### Minimum Qualifications
- 5+ years in High-Performance Computing (HPC), GPU cluster infrastructure, or systems programming.
- Strong command of Linux internals, C++ or Rust, CUDA runtime, Slurm, and InfiniBand networking.`,
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  // =========================================================================
  // ROLE 1: AI/ML Engineer (job-ai-ml)
  // =========================================================================
  {
    id: "cand-101",
    jobId: "job-ai-ml",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@alumni.stanford.edu",
    phone: "+1 (650) 482-9910",
    location: "Palo Alto, CA",
    currentRole: "Staff ML Systems Engineer @ Anthropic-scale Startup",
    yearsOfExperience: 6.5,
    education: "Ph.D. in Computer Science (NLP & Transformers), Stanford University",
    bertMatchScore: 96,
    rawCosineSimilarity: 0.942,
    scoreBreakdown: {
      semanticRelevance: 97,
      skillOverlap: 100,
      experienceAlignment: 90,
    },
    matchedSkills: [
      "PyTorch",
      "Transformers",
      "CUDA",
      "Python",
      "vLLM",
      "FastAPI",
      "Ray",
      "Docker",
    ],
    missingCriticalSkills: [],
    aiRecommendation:
      "Exceptional 96% match — complete coverage of PyTorch, CUDA, vLLM & Ray with 6.5 yrs transformer serving experience.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Architected distributed BERT & Llama embedding pipelines processing 18,000 req/sec using PyTorch, custom CUDA kernels, and vLLM.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: 100% overlap with all 8 required Bertlab technologies plus Ph.D. research in contrastive semantic representations.",
      },
      {
        type: "gap",
        text: "Consideration: Compensation expectations likely at top of L6 Staff band; prioritize expedited founder interview.",
      },
    ],
    status: "Selected",
    recruiterNotes: "Fast-tracked to final technical architecture round with VP of AI.",
    resumeFilename: "Elena_Rostova_PhD_ML_Resume.pdf",
    appliedAt: "2 hours ago",
    resumeSummary:
      "Staff Machine Learning Engineer with 6.5+ years designing high-throughput transformer inference engines, custom CUDA kernels, and distributed Ray training pipelines.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Staff ML Systems Engineer — NeuralScale AI",
            subtitle: "San Francisco, CA",
            period: "2023 – Present",
            bullets: [
              "Led a 7-engineer team serving quantized BERT-large and Llama-3-70B models via vLLM, FastAPI, and Ray Serve across 128 H100 GPUs.",
              "Wrote custom fused CUDA & Triton attention kernels that reduced p99 embedding latency from 42ms to 9.4ms.",
              "Built structured Pydantic extraction pipelines achieving 99.4% schema validity on 2M+ daily enterprise documents.",
            ],
          },
          {
            title: "Senior Machine Learning Engineer — Cohere Labs",
            subtitle: "Toronto / Hybrid",
            period: "2020 – 2023",
            bullets: [
              "Trained multilingual dense retrieval models using PyTorch FSDP and Sentence-Transformers, improving NDCG@10 by 14.2%.",
              "Containerized inference services with Docker and Kubernetes with automated canary rollouts.",
            ],
          },
        ],
      },
      {
        heading: "Education & Publications",
        items: [
          {
            title: "Ph.D. in Computer Science (Natural Language Processing)",
            subtitle: "Stanford University",
            period: "2016 – 2020",
            bullets: [
              "Dissertation: Efficient Contrastive Fine-Tuning of Bidirectional Transformer Encoders.",
              "3 first-author publications at NeurIPS, ACL, and EMNLP.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-102",
    jobId: "job-ai-ml",
    name: "Marcus Vance",
    email: "marcus.vance@berkeley.edu",
    phone: "+1 (415) 739-2041",
    location: "San Francisco, CA",
    currentRole: "Senior Applied AI Engineer @ ScaleOps",
    yearsOfExperience: 5.0,
    education: "M.S. in Electrical Engineering & Computer Sciences, UC Berkeley",
    bertMatchScore: 89,
    rawCosineSimilarity: 0.886,
    scoreBreakdown: {
      semanticRelevance: 91,
      skillOverlap: 88,
      experienceAlignment: 88,
    },
    matchedSkills: [
      "PyTorch",
      "Transformers",
      "Python",
      "vLLM",
      "FastAPI",
      "Docker",
      "CUDA",
    ],
    missingCriticalSkills: ["Ray"],
    aiRecommendation:
      "Strong 89% match — deep production experience with PyTorch, vLLM, and FastAPI microservices; only missing Ray.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Built production RAG and semantic resume/document matching services using Hugging Face sentence-transformers and FastAPI.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: 5.0 years of production ML engineering exceeding the 4-year minimum requirement with strong CUDA profiling skills.",
      },
      {
        type: "gap",
        text: "Skill Gap: Used Celery/Kubernetes instead of Ray for distributed worker orchestration — trivial ramp-up expected.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Marcus_Vance_Senior_AI_Engineer.pdf",
    appliedAt: "4 hours ago",
    resumeSummary:
      "Senior Applied AI Engineer specializing in transformer fine-tuning, low-latency vLLM serving, and production FastAPI backend systems.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Senior Applied AI Engineer — ScaleOps Inc.",
            subtitle: "San Francisco, CA",
            period: "2022 – Present",
            bullets: [
              "Designed semantic search and document classification pipelines using sentence-transformers (all-MiniLM-L6-v2) and PyTorch.",
              "Deployed vLLM and FastAPI inference endpoints in Docker containers handling 4.5M daily requests at 99.95% uptime.",
              "Profiled GPU memory bottlenecks with NVIDIA Nsight and CUDA streams, cutting cloud GPU spend by 34%.",
            ],
          },
          {
            title: "Machine Learning Engineer — Stripe",
            subtitle: "South San Francisco, CA",
            period: "2020 – 2022",
            bullets: [
              "Trained gradient-boosted and neural fraud detection models in Python and PyTorch with real-time feature stores.",
            ],
          },
        ],
      },
      {
        heading: "Education",
        items: [
          {
            title: "M.S. in EECS — UC Berkeley",
            subtitle: "GPA: 3.92 / 4.0",
            period: "2018 – 2020",
            bullets: ["Graduate coursework in Deep Learning, Convex Optimization, and Parallel Computing."],
          },
        ],
      },
    ],
  },
  {
    id: "cand-103",
    jobId: "job-ai-ml",
    name: "Siddharth Nair",
    email: "sid.nair@ai-labs.io",
    phone: "+1 (408) 912-3387",
    location: "San Jose, CA",
    currentRole: "NLP Research Engineer @ LexisNexis AI",
    yearsOfExperience: 4.2,
    education: "M.S. in Computational Data Science, Carnegie Mellon University",
    bertMatchScore: 83,
    rawCosineSimilarity: 0.834,
    scoreBreakdown: {
      semanticRelevance: 86,
      skillOverlap: 75,
      experienceAlignment: 88,
    },
    matchedSkills: [
      "PyTorch",
      "Transformers",
      "Python",
      "FastAPI",
      "Docker",
      "Ray",
    ],
    missingCriticalSkills: ["CUDA", "vLLM"],
    aiRecommendation:
      "High 83% match — strong CMU NLP background & Sentence-BERT expertise; lacks low-level CUDA kernel & vLLM tuning.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Direct domain expertise fine-tuning bi-encoders and cross-encoders (BERT/DeBERTa) for legal and HR text ranking.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Solid production experience orchestrating Ray Data batch pipelines and FastAPI endpoints.",
      },
      {
        type: "gap",
        text: "Skill Gap: Lacks custom CUDA kernel programming and vLLM continuous batching experience — evaluate systems depth in screen.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Siddharth_Nair_CMU_NLP.pdf",
    appliedAt: "6 hours ago",
    resumeSummary:
      "CMU-trained NLP Engineer with 4.2 years building dense semantic retrieval, entity extraction, and Ray distributed inference services.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "NLP Research Engineer — LexisNexis AI",
            subtitle: "San Jose, CA",
            period: "2022 – Present",
            bullets: [
              "Fine-tuned domain-specific BERT and RoBERTa embeddings in PyTorch for semantic clause retrieval across 50M+ legal filings.",
              "Built distributed Ray batch scoring pipelines and FastAPI REST services packaged with Docker.",
            ],
          },
          {
            title: "Applied Scientist Intern / Associate — Amazon Alexa AI",
            subtitle: "Sunnyvale, CA",
            period: "2020 – 2022",
            bullets: ["Developed transformer intent classifiers in Python and PyTorch reducing false rejection rate by 11%."],
          },
        ],
      },
      {
        heading: "Education",
        items: [
          {
            title: "M.S. in Computational Data Science (LTI) — Carnegie Mellon University",
            subtitle: "Pittsburgh, PA",
            period: "2019 – 2020",
            bullets: ["Focused on Advanced NLP, Multimodal Machine Learning, and Distributed Systems."],
          },
        ],
      },
    ],
  },
  {
    id: "cand-104",
    jobId: "job-ai-ml",
    name: "Hannah Lindqvist",
    email: "hannah.lindqvist@kth.se",
    phone: "+1 (206) 554-8192",
    location: "Seattle, WA",
    currentRole: "Machine Learning Engineer II @ FinSight",
    yearsOfExperience: 3.0,
    education: "M.S. in Machine Learning, KTH Royal Institute of Technology",
    bertMatchScore: 68,
    rawCosineSimilarity: 0.712,
    scoreBreakdown: {
      semanticRelevance: 72,
      skillOverlap: 63,
      experienceAlignment: 70,
    },
    matchedSkills: ["PyTorch", "Transformers", "Python", "FastAPI", "Docker"],
    missingCriticalSkills: ["CUDA", "vLLM", "Ray"],
    aiRecommendation:
      "Moderate 68% match — solid Python/PyTorch/FastAPI fundamentals, but 1 yr short of 4+ yr requirement and missing GPU systems stack.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Clean software craftsmanship in Python, FastAPI, Docker, and Hugging Face Transformers API integrations.",
      },
      {
        type: "gap",
        text: "Skill Gap: Missing GPU inference optimization stack (CUDA, vLLM, Ray) critical for Bertlab's high-throughput engine.",
      },
      {
        type: "gap",
        text: "Experience Gap: 3.0 years total experience vs. 4.0 years minimum target for Senior L5 scope; better suited for L4 role.",
      },
    ],
    status: "Pending",
    recruiterNotes: "Good potential if we open an L4 Mid-level ML role next quarter.",
    resumeFilename: "Hannah_Lindqvist_MLE_Resume.pdf",
    appliedAt: "1 day ago",
    resumeSummary:
      "Machine Learning Engineer with 3 years of experience deploying NLP classification and LLM wrapper services with FastAPI and Docker.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Machine Learning Engineer II — FinSight Analytics",
            subtitle: "Seattle, WA",
            period: "2023 – Present",
            bullets: [
              "Built financial sentiment analysis microservices using Hugging Face Transformers, PyTorch, and FastAPI.",
              "Managed CI/CD pipelines and Docker container deployments on AWS ECS.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-105",
    jobId: "job-ai-ml",
    name: "Devon Brooks",
    email: "devon.brooks@datametric.co",
    phone: "+1 (312) 609-4412",
    location: "Chicago, IL",
    currentRole: "Business Intelligence & Data Analyst @ RetailCorp",
    yearsOfExperience: 2.0,
    education: "B.S. in Statistics, University of Illinois",
    bertMatchScore: 41,
    rawCosineSimilarity: 0.389,
    scoreBreakdown: {
      semanticRelevance: 44,
      skillOverlap: 25,
      experienceAlignment: 60,
    },
    matchedSkills: ["Python", "Docker"],
    missingCriticalSkills: [
      "PyTorch",
      "Transformers",
      "CUDA",
      "vLLM",
      "FastAPI",
      "Ray",
    ],
    aiRecommendation:
      "Low 41% match — background is classical BI/SQL & Tableau analytics rather than deep learning or transformer engineering.",
    aiInsights: [
      {
        type: "strength",
        text: "Strength: Proficient in Python data wrangling (Pandas, Scikit-learn) and basic Docker containerization.",
      },
      {
        type: "gap",
        text: "Why Reject: Missing 6 of 8 core requirements including PyTorch, Transformers, CUDA, vLLM, FastAPI, and Ray.",
      },
      {
        type: "gap",
        text: "Why Reject: 2.0 years of BI analytics experience does not align with Senior AI/ML Engineer production requirements.",
      },
    ],
    status: "Rejected",
    recruiterNotes: "Rejected via BERT auto-triage — missing core deep learning & transformer prerequisites.",
    resumeFilename: "Devon_Brooks_Data_Analyst.docx",
    appliedAt: "1 day ago",
    resumeSummary:
      "Data Analyst with 2 years of experience building Tableau dashboards, SQL ETL pipelines, and Scikit-learn churn models.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Data Analyst — RetailCorp",
            subtitle: "Chicago, IL",
            period: "2024 – Present",
            bullets: [
              "Created executive KPI dashboards in Tableau and PowerBI tracking weekly store revenue.",
              "Wrote Python scripts with Pandas and Scikit-learn for customer segmentation packaged in Docker.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-106",
    jobId: "job-ai-ml",
    name: "Chloe Takahashi",
    email: "chloe.takahashi@mit.edu",
    phone: "+1 (617) 842-1190",
    location: "Cambridge, MA",
    currentRole: "Senior Deep Learning Engineer @ BioCompute",
    yearsOfExperience: 4.5,
    education: "M.Eng. in Computer Science & AI, MIT",
    bertMatchScore: 91,
    rawCosineSimilarity: 0.905,
    scoreBreakdown: {
      semanticRelevance: 92,
      skillOverlap: 88,
      experienceAlignment: 94,
    },
    matchedSkills: [
      "PyTorch",
      "Transformers",
      "CUDA",
      "Python",
      "FastAPI",
      "Ray",
      "Docker",
    ],
    missingCriticalSkills: ["vLLM"],
    aiRecommendation:
      "Outstanding 91% match — MIT M.Eng. with deep PyTorch, CUDA, Ray & Transformer training expertise.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Scaled multi-GPU transformer pre-training and embedding extraction with PyTorch, CUDA, and Ray across 64 A100s.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Production owner of FastAPI + Docker model serving gateway with sub-15ms vector generation latency.",
      },
      {
        type: "gap",
        text: "Minor Gap: Used TensorRT-LLM rather than vLLM for decoder serving — directly transferable skillset.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Chloe_Takahashi_MIT_DL_Resume.pdf",
    appliedAt: "5 hours ago",
    resumeSummary:
      "MIT-educated Deep Learning Engineer with 4.5 years building large-scale PyTorch transformer pipelines, CUDA accelerations, and Ray clusters.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Senior Deep Learning Engineer — BioCompute AI",
            subtitle: "Cambridge, MA",
            period: "2022 – Present",
            bullets: [
              "Trained 1.2B-parameter encoder transformers in PyTorch using Ray Train and custom CUDA kernels.",
              "Built FastAPI and Docker embedding microservices serving 800+ enterprise researchers.",
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // ROLE 2: Full-Stack Developer (job-fullstack)
  // =========================================================================
  {
    id: "cand-201",
    jobId: "job-fullstack",
    name: "Lucas Meyer",
    email: "lucas.meyer@vercel-alumni.dev",
    phone: "+1 (917) 304-8821",
    location: "New York, NY",
    currentRole: "Senior Product Engineer @ LinearFlow",
    yearsOfExperience: 5.5,
    education: "B.S. in Computer Science, Cornell University",
    bertMatchScore: 95,
    rawCosineSimilarity: 0.938,
    scoreBreakdown: {
      semanticRelevance: 96,
      skillOverlap: 100,
      experienceAlignment: 88,
    },
    matchedSkills: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Node.js",
      "GraphQL",
    ],
    missingCriticalSkills: [],
    aiRecommendation:
      "Top-tier 95% match — 100% skill match (Next.js App Router, TypeScript, Tailwind, Prisma, PostgreSQL) with Linear-caliber UI polish.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: 5.5 years building real-time collaborative SaaS dashboards with Next.js App Router, React 19, TypeScript, and Tailwind CSS.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Deep backend ownership designing multi-tenant PostgreSQL schemas with Prisma ORM, Node.js, and GraphQL.",
      },
      {
        type: "gap",
        text: "Consideration: Zero technical gaps identified; strongly aligned with Bertlab's design-system culture.",
      },
    ],
    status: "Selected",
    recruiterNotes: "Portfolio and live Next.js architecture review were phenomenal. Moving to offer stage.",
    resumeFilename: "Lucas_Meyer_FullStack_Resume.pdf",
    appliedAt: "3 hours ago",
    resumeSummary:
      "Senior Full-Stack Product Engineer obsessed with 60fps UI craft, Next.js App Router architecture, TypeScript type safety, and PostgreSQL performance.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Senior Product Engineer — LinearFlow",
            subtitle: "New York, NY",
            period: "2022 – Present",
            bullets: [
              "Architected the core issue-tracking and applicant workflow canvas using Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.",
              "Scaled PostgreSQL and Prisma data layer with optimistic client updates, cutting perceived mutation latency to 0ms.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-202",
    jobId: "job-fullstack",
    name: "Priya Sharma",
    email: "priya.sharma@nyu.edu",
    phone: "+1 (646) 519-7734",
    location: "Brooklyn, NY",
    currentRole: "Full-Stack Software Engineer @ Ramp-style FinTech",
    yearsOfExperience: 3.8,
    education: "B.S. in Computer Science, New York University",
    bertMatchScore: 86,
    rawCosineSimilarity: 0.861,
    scoreBreakdown: {
      semanticRelevance: 88,
      skillOverlap: 88,
      experienceAlignment: 82,
    },
    matchedSkills: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Node.js",
    ],
    missingCriticalSkills: ["GraphQL"],
    aiRecommendation:
      "Strong 86% match — ships crisp Next.js + Tailwind + Prisma features rapidly; uses tRPC/REST instead of GraphQL.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Built complex data tables, keyboard-first command palettes, and slide-over drawers in Next.js, React, and Tailwind CSS.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Strong PostgreSQL query optimization and Prisma migration management in high-growth fintech.",
      },
      {
        type: "gap",
        text: "Minor Gap: Used tRPC and REST rather than GraphQL — very fast transition given strong TypeScript foundation.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Priya_Sharma_FullStack_NYU.pdf",
    appliedAt: "7 hours ago",
    resumeSummary:
      "Full-Stack Engineer with 3.8 years of experience building modern TypeScript, Next.js, and PostgreSQL web applications.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Full-Stack Software Engineer — FinLedger",
            subtitle: "New York, NY",
            period: "2022 – Present",
            bullets: [
              "Built real-time expense approval workflows using Next.js, React, TypeScript, Tailwind CSS, and Prisma/PostgreSQL.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-203",
    jobId: "job-fullstack",
    name: "Mateo Silva",
    email: "mateo.silva@frontend.dev",
    phone: "+1 (512) 440-1920",
    location: "Remote (Austin, TX)",
    currentRole: "Frontend UI Developer @ CreativeAgency",
    yearsOfExperience: 2.5,
    education: "B.A. in Interactive Media, UT Austin",
    bertMatchScore: 64,
    rawCosineSimilarity: 0.655,
    scoreBreakdown: {
      semanticRelevance: 68,
      skillOverlap: 63,
      experienceAlignment: 60,
    },
    matchedSkills: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Node.js"],
    missingCriticalSkills: ["PostgreSQL", "Prisma", "GraphQL"],
    aiRecommendation:
      "Moderate 64% match — strong frontend UI/Tailwind eye, but lacks relational database (PostgreSQL/Prisma) and GraphQL depth.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Strong visual polish with React, Next.js, Tailwind CSS, and Framer Motion micro-interactions.",
      },
      {
        type: "gap",
        text: "Skill Gap: Limited backend database experience — has not worked with PostgreSQL, Prisma ORM, or GraphQL in production.",
      },
      {
        type: "gap",
        text: "Experience Gap: 2.5 years primarily in agency marketing sites vs. 3+ years enterprise SaaS requirement.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Mateo_Silva_Frontend_Dev.pdf",
    appliedAt: "1 day ago",
    resumeSummary:
      "Frontend-focused developer with 2.5 years crafting responsive React, Next.js, and Tailwind CSS web experiences.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Frontend Developer — StudioNova",
            subtitle: "Austin, TX",
            period: "2023 – Present",
            bullets: ["Developed interactive Next.js and Tailwind CSS web portals for technology brands."],
          },
        ],
      },
    ],
  },
  {
    id: "cand-204",
    jobId: "job-fullstack",
    name: "Victor Kolesnikov",
    email: "victor.k@legacy-erp.com",
    phone: "+1 (214) 892-0014",
    location: "Dallas, TX",
    currentRole: "Java / Angular Enterprise Developer",
    yearsOfExperience: 4.0,
    education: "B.S. in Information Systems, UT Dallas",
    bertMatchScore: 44,
    rawCosineSimilarity: 0.415,
    scoreBreakdown: {
      semanticRelevance: 46,
      skillOverlap: 25,
      experienceAlignment: 75,
    },
    matchedSkills: ["TypeScript", "PostgreSQL"],
    missingCriticalSkills: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Prisma",
      "Node.js",
      "GraphQL",
    ],
    aiRecommendation:
      "Low 44% match — experienced in Java Spring Boot & Angular, but missing React, Next.js, Tailwind CSS, Prisma & Node.js.",
    aiInsights: [
      {
        type: "strength",
        text: "Strength: 4 years of solid relational database modeling in PostgreSQL and static typing with TypeScript.",
      },
      {
        type: "gap",
        text: "Why Reject: Zero production experience with React, Next.js App Router, Tailwind CSS, or Node.js/Prisma stack.",
      },
      {
        type: "gap",
        text: "Why Reject: Stack mismatch would require significant re-skilling for Bertlab's frontend velocity.",
      },
    ],
    status: "Rejected",
    recruiterNotes: "Stack mismatch (Angular/Java vs React/Next.js).",
    resumeFilename: "Victor_Kolesnikov_Enterprise_Dev.pdf",
    appliedAt: "2 days ago",
    resumeSummary: "Enterprise Software Developer with 4 years building internal ERP portals in Java, Spring, Angular, and PostgreSQL.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Software Developer — GlobalERP Corp",
            subtitle: "Dallas, TX",
            period: "2022 – Present",
            bullets: ["Maintained Angular 15 frontends and Java Spring REST APIs backed by PostgreSQL."],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // ROLE 3: HPC Systems Engineer (job-hpc)
  // =========================================================================
  {
    id: "cand-301",
    jobId: "job-hpc",
    name: "Soren Lindholm",
    email: "soren.lindholm@cern-alumni.ch",
    phone: "+1 (512) 901-7450",
    location: "Austin, TX",
    currentRole: "Principal GPU Cluster Architect @ CoreCompute",
    yearsOfExperience: 7.5,
    education: "M.S. in Computer Engineering, ETH Zurich",
    bertMatchScore: 94,
    rawCosineSimilarity: 0.931,
    scoreBreakdown: {
      semanticRelevance: 95,
      skillOverlap: 100,
      experienceAlignment: 85,
    },
    matchedSkills: [
      "C++",
      "CUDA",
      "Slurm",
      "InfiniBand",
      "Kubernetes",
      "Linux Kernel",
      "NCCL",
      "Rust",
    ],
    missingCriticalSkills: [],
    aiRecommendation:
      "Exceptional 94% match — 7.5 yrs managing 2,048-GPU H100 clusters with Slurm, InfiniBand, NCCL, CUDA & Rust.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Direct experience operating 2,000+ H100 bare-metal clusters over 400Gb/s InfiniBand with Slurm, Kubernetes, and NCCL tuning.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Authored open-source GPU health telemetry and RDMA congestion monitors in Rust, C++, and CUDA.",
      },
      {
        type: "gap",
        text: "Consideration: Rare 100% skill match across all 8 HPC domains; move immediately to technical onsite.",
      },
    ],
    status: "Selected",
    recruiterNotes: "Top HPC candidate in pipeline. Scheduled cluster architecture deep dive.",
    resumeFilename: "Soren_Lindholm_HPC_Architect.pdf",
    appliedAt: "5 hours ago",
    resumeSummary:
      "HPC & AI Infrastructure Engineer with 7.5 years architecting bare-metal GPU superclusters, InfiniBand fabrics, and Slurm/Kubernetes schedulers.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Principal GPU Cluster Architect — CoreCompute Cloud",
            subtitle: "Austin, TX",
            period: "2021 – Present",
            bullets: [
              "Designed and operated a 2,048-node NVIDIA H100 cluster interconnected via NDR 400G InfiniBand with Slurm and Kubernetes.",
              "Tuned NCCL topology trees and Linux kernel parameters, improving multi-node LLM training MFU from 39% to 54%.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-302",
    jobId: "job-hpc",
    name: "Kenji Watanabe",
    email: "kenji.watanabe@hpc-sys.jp",
    phone: "+1 (512) 638-2910",
    location: "Austin, TX",
    currentRole: "Senior Systems Engineer @ SuperMicro Labs",
    yearsOfExperience: 5.5,
    education: "M.S. in Computer Science, UIUC",
    bertMatchScore: 84,
    rawCosineSimilarity: 0.848,
    scoreBreakdown: {
      semanticRelevance: 86,
      skillOverlap: 75,
      experienceAlignment: 92,
    },
    matchedSkills: [
      "C++",
      "CUDA",
      "Slurm",
      "InfiniBand",
      "Kubernetes",
      "Linux Kernel",
    ],
    missingCriticalSkills: ["NCCL", "Rust"],
    aiRecommendation:
      "Strong 84% match — deep Linux kernel, Slurm, InfiniBand & C++/CUDA expertise; missing Rust and deep NCCL tuning.",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: 5.5 years configuring Slurm workload managers, Linux kernel drivers, and InfiniBand RDMA fabrics.",
      },
      {
        type: "strength_secondary",
        text: "Why Select: Strong C++ and CUDA runtime debugging for multi-GPU hardware validation.",
      },
      {
        type: "gap",
        text: "Skill Gap: Has not written production Rust services or custom NCCL plugins — strong C++ background bridges this easily.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Kenji_Watanabe_HPC_Systems.pdf",
    appliedAt: "9 hours ago",
    resumeSummary:
      "Senior HPC Systems Engineer with 5.5 years in bare-metal Linux kernel optimization, Slurm scheduling, and InfiniBand clusters.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Senior Systems Engineer — SuperMicro AI Labs",
            subtitle: "Austin, TX",
            period: "2020 – Present",
            bullets: [
              "Automated bare-metal GPU cluster bring-up using Slurm, Kubernetes, and custom C++/CUDA diagnostic suites.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cand-303",
    jobId: "job-hpc",
    name: "Rachel Greenwald",
    email: "rachel.g@cloudops.io",
    phone: "+1 (303) 418-9921",
    location: "Denver, CO",
    currentRole: "Cloud DevOps Engineer @ SaaSGrid",
    yearsOfExperience: 4.0,
    education: "B.S. in Computer Science, CU Boulder",
    bertMatchScore: 52,
    rawCosineSimilarity: 0.542,
    scoreBreakdown: {
      semanticRelevance: 56,
      skillOverlap: 38,
      experienceAlignment: 70,
    },
    matchedSkills: ["Kubernetes", "Linux Kernel", "Rust"],
    missingCriticalSkills: ["C++", "CUDA", "Slurm", "InfiniBand", "NCCL"],
    aiRecommendation:
      "Borderline 52% match — strong cloud Kubernetes & Linux skills, but lacks bare-metal HPC/GPU stack (CUDA, Slurm, InfiniBand, NCCL).",
    aiInsights: [
      {
        type: "strength",
        text: "Why Select: Strong Kubernetes cluster administration, Linux systems tuning, and Rust CLI tooling.",
      },
      {
        type: "gap",
        text: "Skill Gap: No hands-on experience with GPU fabrics (InfiniBand, NCCL, CUDA) or Slurm HPC schedulers.",
      },
      {
        type: "gap",
        text: "Experience Gap: Background is AWS cloud DevOps rather than bare-metal high-performance computing.",
      },
    ],
    status: "Pending",
    recruiterNotes: "",
    resumeFilename: "Rachel_Greenwald_DevOps.pdf",
    appliedAt: "1 day ago",
    resumeSummary:
      "Cloud DevOps Engineer with 4 years managing AWS EKS Kubernetes clusters, Linux infrastructure, and Rust observability tools.",
    resumeSections: [
      {
        heading: "Professional Experience",
        items: [
          {
            title: "Cloud DevOps Engineer — SaaSGrid",
            subtitle: "Denver, CO",
            period: "2022 – Present",
            bullets: ["Managed 40+ Kubernetes clusters on AWS and wrote internal deployment CLIs in Rust."],
          },
        ],
      },
    ],
  },
];

// Preset demo batch resumes that HR can drop or click to test the real-time BERT Ingestion Pipeline
export const SAMPLE_UPLOAD_RESUMES = [
  {
    filename: "Arjun_Mehta_Staff_Transformer_Eng.pdf",
    sizeKB: 342,
    rawText: `Arjun Mehta
arjun.mehta@deepmind-alum.ai | +1 (415) 891-3302 | San Francisco, CA
Senior AI/ML & Full-Stack Systems Engineer — 6.0 years of experience
Education: M.S. in Computer Science, Georgia Institute of Technology

SUMMARY
Senior Machine Learning & Systems Engineer with 6 years of experience architecting transformer embedding pipelines, vLLM inference servers, and full-stack Next.js observability dashboards.

TECHNICAL SKILLS
PyTorch, Transformers, CUDA, Python, vLLM, FastAPI, Ray, Docker, Next.js, TypeScript, React, Tailwind CSS, PostgreSQL, Prisma, C++, Kubernetes, NCCL

EXPERIENCE
Lead AI Infrastructure Engineer — VectorCore AI (2022 – Present)
- Scaled Hugging Face sentence-transformers (all-MiniLM-L6-v2 & BGE-large) and vLLM clusters across 64 H100 GPUs using PyTorch, CUDA, and Ray Serve.
- Built low-latency FastAPI and Docker inference microservices alongside a Next.js + TypeScript + PostgreSQL control plane.
- Improved cosine similarity retrieval throughput by 3.8x via int8/fp8 quantization.`,
  },
  {
    filename: "Sophia_Chen_ML_Platform_Engineer.pdf",
    sizeKB: 278,
    rawText: `Sophia Chen
sophia.chen@columbia.edu | +1 (646) 920-4811 | New York, NY
Machine Learning & Backend Engineer — 4.5 years of experience
Education: M.S. in Data Science, Columbia University

SUMMARY
Applied ML & Platform Engineer experienced in PyTorch, Transformers, Python, FastAPI, Docker, Next.js, TypeScript, React, PostgreSQL, and Node.js.

TECHNICAL SKILLS
PyTorch, Transformers, Python, FastAPI, Docker, Next.js, TypeScript, React, Tailwind CSS, PostgreSQL, Node.js, Kubernetes

EXPERIENCE
Senior ML Platform Engineer — QuantFlow (2021 – Present)
- Deployed BERT-base semantic document classifiers and structured LLM extraction pipelines in Python, PyTorch, and FastAPI.
- Built internal evaluation portals using React, Next.js, TypeScript, and PostgreSQL.`,
  },
  {
    filename: "Liam_OConnor_Junior_Developer.docx",
    sizeKB: 164,
    rawText: `Liam O'Connor
liam.oconnor@devmail.io | +1 (512) 301-9942 | Austin, TX
Junior Software Developer — 1.5 years of experience
Education: B.S. in Computer Science, Arizona State University

SUMMARY
Entry-level software developer with 1.5 years of experience in Python, React, and Docker.

TECHNICAL SKILLS
Python, React, Docker, HTML, CSS, Git

EXPERIENCE
Junior Developer — WebWorks Studio (2024 – Present)
- Assisted in building internal Python scripts and React UI components packaged with Docker.`,
  },
];

