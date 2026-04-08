# 🚀 AI Career Intelligence Engine

> An AI-powered career platform built for software engineers — matches your resume to jobs, generates personalized interview prep roadmaps, runs mock interviews, and delivers company-specific intel. Designed as a production-ready SaaS product.

---

## 📌 Table of Contents

- [Overview](#overview)
- [AI Capabilities](#ai-capabilities)
- [Architecture](#architecture)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

The AI Career Intelligence Engine is a full-stack platform that acts as a personal career coach for software engineers. It combines local AI (embeddings + vector search) with LLM-powered analysis (Groq/OpenAI) to:

- Parse your resume and understand your skill profile
- Match you against job descriptions with a scored analysis
- Scrape job listings from 15+ company career pages
- Generate a 24-week personalized interview prep roadmap
- Run AI mock interviews and evaluate your answers
- Deliver company-specific interview patterns and prep tips
- Send Telegram alerts for high-quality job matches
- Track your readiness across DSA, Backend, and System Design

---

## AI Capabilities

This project uses AI at every layer. Here's exactly how:

### 1. Resume Intelligence (LLM + Embeddings)
- Uploads PDF/DOCX resumes and extracts raw text via `pdfplumber` / `python-docx`
- Sends resume text to **Groq LLaMA 3.3 70B** with a structured prompt to extract: skills, experience, DSA signals, system design signals, strengths, and gaps
- Generates a **384-dimensional semantic embedding** using `SentenceTransformers all-MiniLM-L6-v2` (runs fully locally, zero API cost)
- Stores the embedding in the database for future similarity comparisons

### 2. Job Matching (LLM + FAISS Vector Search)
- Analyzes job descriptions with LLM to extract: required skills, seniority, DSA intensity, backend depth, and responsibilities
- Generates a job embedding and computes **cosine similarity** against the resume embedding using FAISS
- Combines embedding similarity score with LLM reasoning to produce a final **match score (0–100)** with priority: `APPLY_NOW`, `PREPARE_THEN_APPLY`, or `SKIP`
- Identifies missing skills, estimates preparation weeks needed, and generates action items

### 3. Adaptive Prep Roadmap (Structured AI + Curated Data)
- Generates a **24-week personalized roadmap** across 6 phases: DSA Foundations → Data Structures → Advanced DSA → Backend → System Design → Languages & Behavioral
- Topics follow **Striver's A2Z DSA sheet** progression (Arrays → Sorting → Strings → Linked Lists → Stacks → Trees → Graphs → DP → Greedy → Tries)
- Each topic includes verified LeetCode/GFG practice problems with real URLs, curated video/article resources, estimated hours, and completion criteria
- Progress is tracked per topic with statuses: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `NEEDS_REVIEW`

### 4. Company Intelligence (LLM with Caching)
- Queries **Groq LLaMA 3.3 70B** for company-specific interview patterns: round structure, DSA topic distribution, system design topics, LLD topics, behavioral focus, and culture values
- Results are cached in the database and refreshed every 30 days to avoid redundant API calls
- Covers interview patterns for companies like Google, Amazon, Microsoft, Meta, Flipkart, etc.

### 5. Mock Interview Engine (LLM Question Generation + Evaluation)
- Generates realistic DSA interview questions tailored to a specific company, difficulty level, and topic
- Questions include: problem statement, examples, constraints, hints, expected approach, time/space complexity, and follow-ups
- Evaluates submitted answers and code across 5 dimensions: **correctness, optimization, code quality, communication, trade-off analysis**
- Returns a score (0–100), pass/fail verdict, key improvements, and a model answer outline

### 6. LLM Client (Groq Primary + OpenAI Fallback)
- All LLM calls go through a unified `llm_generate` / `llm_generate_json` client
- Primary: **Groq `llama-3.3-70b-versatile`** (free tier, fast inference)
- Fallback: **OpenAI `gpt-4o-mini`** (activates automatically if Groq fails)
- Retry logic via `tenacity`: 3 attempts with exponential backoff
- In-memory MD5-based response cache to avoid duplicate LLM calls

### 7. Semantic Job Scraping (Embeddings)
- Scrapes public career pages of 15+ companies (Google, Amazon, Meta, Netflix, Stripe, etc.) using `aiohttp` + `BeautifulSoup`
- Matches scraped job titles to user skill profile using **SentenceTransformers cosine similarity**
- Supports adding custom companies with any career page URL

### 8. Telegram Notifications (Smart Filtering)
- Sends real-time Telegram alerts for job matches scoring ≥ 60 with priority `APPLY_NOW` or `PREPARE_THEN_APPLY`
- Skips low-quality matches automatically — no noise

---

## Architecture

**Modular Monolith** — clean module boundaries with shared services, extractable to microservices when needed.

```
backend/
├── app/
│   ├── core/           # DB, models, schemas, config
│   ├── modules/        # Feature modules (each self-contained)
│   │   ├── resume_match/
│   │   ├── job_intel/
│   │   ├── job_scraper/
│   │   ├── adaptive_prep/
│   │   ├── company_intel/
│   │   ├── mock_interview/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── url_management/
│   └── shared/         # Cross-cutting: LLM client, embeddings, prompts
│       ├── llm/        # Groq + OpenAI unified client
│       ├── embeddings/ # SentenceTransformers + FAISS
│       ├── prompts/    # All LLM prompt templates
│       └── data/       # Curated roadmap topic database
└── routes.py           # All API routes wired here
```

---

## Modules

| Module | What It Does | AI Used |
|--------|-------------|---------|
| Resume Match | Parse resume, analyze skills, match against JDs, score | LLM + FAISS embeddings |
| Job Intel | Submit JD manually or via URL, get match analysis | LLM + cosine similarity |
| Job Scraper | Scrape 15+ company career pages, skill-match results | SentenceTransformers |
| Adaptive Prep | Generate 24-week personalized DSA/Backend/SD roadmap | Curated DB + LLM structure |
| Company Intel | Company-specific interview patterns, DSA topics, tips | LLM with 30-day cache |
| Mock Interview | Generate questions, evaluate code + answers | LLM (question gen + eval) |
| Analytics | Readiness scores, progress dashboard, radar charts | Aggregated DB stats |
| Notifications | Telegram alerts for high-quality job matches | Smart score filtering |
| URL Management | Detect and fix broken resource URLs in roadmap | Async HTTP validation |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.0 (async) | Async throughout |
| Database | SQLite (dev) / PostgreSQL via Supabase (prod) | Alembic migrations |
| Embeddings | `sentence-transformers` `all-MiniLM-L6-v2` | Runs locally, free |
| Vector Search | FAISS (`faiss-cpu`) | In-memory index |
| LLM Primary | Groq `llama-3.3-70b-versatile` | Free tier |
| LLM Fallback | OpenAI `gpt-4o-mini` | Auto-fallback |
| Resume Parsing | `pdfplumber`, `python-docx` | PDF + DOCX support |
| Job Scraping | `aiohttp`, `BeautifulSoup4` | Public pages only |
| Notifications | `python-telegram-bot` | Telegram Bot API |
| Retry Logic | `tenacity` | Exponential backoff |
| Frontend | React 18, React Router, Recharts, Lucide Icons | SPA |
| Deployment | Render (backend) + Vercel (frontend) | Free tier |

---

## Project Structure

```
ai-career-intelligence-engine/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings via pydantic-settings
│   │   │   ├── database.py        # Async SQLAlchemy engine
│   │   │   ├── models.py          # ORM models (UserProfile, Job, RoadmapItem, etc.)
│   │   │   └── schemas.py         # Pydantic request/response schemas
│   │   ├── modules/
│   │   │   ├── resume_match/      # PDF/DOCX parsing, LLM analysis, job matching
│   │   │   ├── job_intel/         # JD submission, URL fetch, match pipeline
│   │   │   ├── job_scraper/       # Career page scraping + skill matching
│   │   │   ├── adaptive_prep/     # Roadmap generation + progress tracking
│   │   │   ├── company_intel/     # LLM-powered company interview patterns
│   │   │   ├── mock_interview/    # Question generation + answer evaluation
│   │   │   ├── analytics/         # Dashboard stats + readiness scores
│   │   │   ├── notifications/     # Telegram alert service
│   │   │   └── url_management/    # Roadmap URL validation + updates
│   │   ├── shared/
│   │   │   ├── llm/client.py      # Unified Groq + OpenAI client with cache + retry
│   │   │   ├── embeddings/        # SentenceTransformers + FAISS index
│   │   │   ├── prompts/           # All LLM prompt templates (centralized)
│   │   │   └── data/              # Curated roadmap topic database (DSA, Backend, SD)
│   │   ├── main.py                # FastAPI app + CORS + lifespan
│   │   └── routes.py              # All route registrations
│   ├── alembic/                   # DB migrations
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                 # One page per module
│   │   ├── components/Layout.js   # Sidebar + navigation
│   │   ├── lib/api.js             # Axios API client
│   │   └── App.js                 # Routes
│   └── package.json
└── README.md
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Fill in your keys
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

### Database Setup

SQLite is used by default — no setup needed. The database file `career_engine.db` is created automatically on first run.

For PostgreSQL (Supabase):
```bash
# Set DATABASE_URL in .env, then run migrations
alembic upgrade head
```

---

## API Reference

### Profile & Resume
```
POST /api/v1/profile/resume              Upload & analyze resume (PDF/DOCX)
GET  /api/v1/profile/{id}                Get user profile
PUT  /api/v1/profile/{id}/setup          Set target role, companies, skill levels
```

### Job Matching
```
POST /api/v1/jobs/{id}/match             Submit job description for AI matching
GET  /api/v1/jobs/{id}                   List all matched jobs with scores
GET  /api/v1/jobs/scrape/{platform}/{slug}  Scrape job from Greenhouse/Lever
POST /api/v1/jobs/fetch-description      Fetch JD from any URL
POST /api/v1/jobs/scrape-company         Scrape jobs from company career page
POST /api/v1/jobs/match-to-skills        Match scraped jobs to user skills
POST /api/v1/jobs/add-company            Add custom company career URL
```

### Roadmap & Prep
```
POST /api/v1/roadmap/{id}/generate       Generate personalized 24-week roadmap
GET  /api/v1/roadmap/{id}                Get all roadmap items
GET  /api/v1/roadmap/{id}/stats          Get progress stats by category
PUT  /api/v1/roadmap/item/{id}/progress  Update topic status/score
GET  /api/v1/roadmap/{id}/invalid-urls   Get broken resource URLs
PUT  /api/v1/roadmap/resource/{id}/url   Update a resource URL
```

### Company Intel
```
GET  /api/v1/company/{name}/intel        Get AI-generated company interview patterns
```

### Mock Interview
```
POST /api/v1/mock/{id}/question          Generate a DSA interview question
POST /api/v1/mock/{id}/evaluate          Submit answer + code for AI evaluation
```

### Analytics
```
GET  /api/v1/analytics/{id}/dashboard    Full dashboard: jobs, roadmap, mock, readiness
```

---

## Frontend Pages

| Page | Route | Key Features |
|------|-------|-------------|
| Dashboard | `/` | Readiness scores (DSA/Backend/SD/Overall), job stats, quick actions |
| Resume & Profile | `/resume` | Upload PDF/DOCX, AI skill extraction, set targets |
| Job Matching | `/jobs` | Paste JD or URL, AI match score, priority label, action items |
| Job Scraper | `/jobs-scraper` | Scrape 15+ company career pages, skill-based matching |
| Prep Roadmap | `/roadmap` | 24-week roadmap, topic progress, resources, LeetCode links |
| URL Manager | `/roadmap/urls` | Detect and fix broken roadmap resource URLs |
| Company Intel | `/company` | Interview rounds, DSA patterns, system design topics, prep tips |
| Mock Interview | `/mock` | Generate questions by company/topic/difficulty, submit code, get scored |
| Analytics | `/analytics` | Radar charts, progress bars, readiness breakdown |

---

## Environment Variables

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./career_engine.db
# For production: postgresql+asyncpg://<user>:<password>@<host>:5432/postgres

# LLM — Groq is PRIMARY (free), OpenAI is FALLBACK
GROQ_API_KEY=<your_groq_key>        # Free at console.groq.com
OPENAI_API_KEY=<your_openai_key>    # Optional fallback
LLM_PROVIDER=groq

# Telegram notifications (optional)
TELEGRAM_BOT_TOKEN=<bot_token>
TELEGRAM_CHAT_ID=<chat_id>

# Embeddings (runs locally, no cost)
EMBEDDING_MODEL=all-MiniLM-L6-v2

# App
APP_ENV=development
LOG_LEVEL=INFO
```

---

## Deployment

### Backend → Render (Free Tier)
1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`

### Frontend → Vercel (Free Tier)
1. Push `frontend/` to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set `REACT_APP_API_URL` to your Render backend URL
4. Deploy

### Database → Supabase (Free Tier)
1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Session Pooler** connection string
3. Set as `DATABASE_URL` in your environment
4. Run `alembic upgrade head` to apply migrations

---

## Roadmap (Upcoming)

- [ ] Auth system (JWT + user accounts for SaaS)
- [ ] Scheduled job scraping (daily cron)
- [ ] JavaScript rendering for dynamic career pages (Playwright)
- [ ] NLP-based salary and location extraction from JDs
- [ ] Application tracker (status, reminders, offer comparison)
- [ ] Community URL crowdsourcing for roadmap resources
- [ ] System Design mock interview questions
- [ ] Behavioral interview prep with STAR method evaluation

---

## License

MIT
