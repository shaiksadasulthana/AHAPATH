# AhaPath (ఆహా-పాత్) — Adaptive Personalized Learning Platform

AhaPath is a curriculum-aware AI learning companion for school students (Classes 5–10) that adapts to demonstrated understanding. It combines a **deterministic adaptive engine**, **explainable misconception diagnostics**, **verified curriculum packs**, **bilingual English & Telugu visual mind maps**, and **real-time educator intelligence**.

---

## 🌟 Core Product Principles

1. **Deterministic Engine Authority**: The deterministic engine owns answer grading, mastery calculations, and adaptive decisions. AI personalizes teaching but cannot arbitrarily override trusted answer keys or curriculum relationships.
2. **Curriculum-Grounded Content**: Content is structured hierarchically (`Board` → `Grade` → `Subject` → `Chapter` → `Concept`), using stable identifiers, verified source attributions, and explicit content coverage statuses (`catalog_only`, `lesson_ready`, `assessment_ready`, `reviewed`).
3. **Evidence-Based Adaptive Decisions**: Every recommendation has a human-readable explanation supported by attempt logs, misconception frequency, and mastery thresholds.
4. **Bilingual Cognitive Scaffolding**: Delivers lessons, worked examples, and analogies in fluent English and Telugu (తెలుగు) with Web Speech API audio narration.
5. **Independent Learning Verification**: Before declaring a concept mastered, AhaPath tests transfer with novel, unfamiliar real-world problems to verify that the student didn't just memorize steps.
6. **Classroom Intelligence for Teachers**: Aggregates telemetry into real-time concept heatmaps, identifies class-wide learning gaps, suggests differentiated groupings (Tier 1–3), and generates actionable 45-minute lesson plans.

---

## 🗺️ Verified Curriculum Pack (Class 8 Mathematics)

The repository integrates the verified **Class 8 Mathematics: Linear Equations in One Variable** pack (AP SCERT / CBSE NCERT):

| Concept ID | Concept Title | Grade | Status | Prerequisites |
|---|---|---|---|---|
| `class8.math.linear-eq.balance` | Balance Method of Solving Equations | Class 8 | `reviewed` | None (Foundation) |
| `class8.math.linear-eq.transposition-signs` | Transposition & Sign Inversion Across Equality | Class 8 | `reviewed` | `...linear-eq.balance` |
| `class8.math.linear-eq.combining-like-terms` | Combining Like Terms & Distributive Property | Class 8 | `reviewed` | `...transposition-signs` |
| `class8.math.linear-eq.fractions` | Fractional Equations & Denominator Clearing | Class 8 | `reviewed` | `...combining-like-terms` |
| `class8.math.linear-eq.word-problems` | Word Problems & Real-World Algebraic Modeling | Class 8 | `reviewed` | `...transposition-signs` |

Additional curriculum modules for Class 9/10 Mathematics and Physical Science (Quadratic Factoring, Ratios, Newton's Laws, and Ohm's Law) are also included with progressive difficulty levels.

---

## 🔄 End-to-End Student Learning Journey

1. **Onboarding & Persona Selection**:
   - Choose Board (`IN.AP-SSC` / `IN.CBSE`), Grade (`Class 8–10`), and Delivery Language (`English`, `తెలుగు`, `Bilingual`).
   - A/B Persona Switching: **Student A (Sai Teja)** struggling with sign inversion vs. **Student B (Ananya)** fast-tracking to Level 5 challenges.
2. **Diagnostic Baseline**:
   - Initial questions calibrated to test current baseline without displaying answers.
3. **Server-Side Grading & Misconception Analysis**:
   - Server evaluates selected options (`/api/curriculum/grade-question`), extracts option-level misconception tags (e.g., `sign_inversion_omission`), and logs the attempt.
4. **Deterministic Action Gating (`/api/adaptive/next-action`)**:
   - Analyzes recent attempt patterns and assigns one of 10 deterministic actions (`diagnostic`, `explain`, `targeted_review`, `guided_practice`, `independent_assessment`, `transfer_question`, `challenge`, etc.).
5. **Interactive Visual Lesson & Mind Map**:
   - Visual dependency graph with node mastery states (`mastered`, `learning`, `needs_review`, `available`, `locked`).
   - Real-world cultural analogies (vegetable market weighing balance, cricket run rates, RTC bus inertia, auto fares).
   - Step-by-step reasoning explaining *why* each step is taken.
   - Carefully worked examples and check-for-understanding mini-prompts.
6. **Guided Practice with Progressive Scaffolding**:
   - Hints reveal underlying principles step-by-step without giving away answers.
   - Built-in interactive scratchpad for working out steps.
7. **Grounded AI Tutor (Follow-up Q&A)**:
   - Dedicated drawer where students can ask doubts strictly grounded in the approved curriculum objectives, receiving Socratic prompts.
8. **Independent Transfer Verification**:
   - Generates a novel transfer problem in a different domain context to confirm genuine understanding.
9. **Educator Analytics**:
   - Real-time mastery matrix, identified gap alerts, and actionable lesson plans.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, Web Speech API.
- **Backend**: Node.js, Express, TypeScript (`tsx`), `@google/genai` (Gemini 3.8 Flash).
- **Security & Secret Hygiene**:
  - API keys reside solely server-side in `process.env.GEMINI_API_KEY`.
  - Question answer keys are never sent to the browser prior to evaluation.
  - Zero sensitive personal information collected from students.

---

## 🚀 Local Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (no frontend secrets needed)
cp .env.example .env
# Set GEMINI_API_KEY="your-gemini-key" in .env if running outside AI Studio

# 3. Start full-stack development server
npm run dev

# 4. Verify build & types
npm run lint
npm run build
```

---

## 🌐 Deployment Configuration

### 1. Render Backend
- **Environment**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (or `tsx server.ts`)
- **Port**: Binds to platform `PORT` or default `3000`.
- **Health Endpoint**: `GET /api/health`

### 2. Vercel Frontend
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Config**: `vercel.json` included with `/api/(.*)` rewrite and SPA fallback.

---

## 📄 License
Apache-2.0
