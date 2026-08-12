# AI CODING AGENT — BUILD PROMPT (v2)
## School English Language Lab (LSRW) — FRONTEND-ONLY CLIENT DEMO
### White + Orange Theme | Class-wise Adaptive (Class 1–12) | Bulk Onboarding | Live Lab Monitoring

**Companion documents:** `Language-Lab-SRS-v2-SchoolLab.docx`, `Language-Lab-ClassWise-LSRW-Curriculum.docx`

---

## 0. PURPOSE OF THIS BUILD

This is a **client demo build** for a school computer lab English (LSRW) system.
No backend, no real database, no real authentication — everything runs on realistic
mock data so it works instantly for a live client meeting. It must **visually and
functionally demonstrate** three things clearly:

1. A **student's** lesson experience automatically changes look, difficulty, and
   interaction style based on which class they're in (Class 1 vs Class 10 should
   feel like genuinely different products, per the Class-wise Curriculum annexure).
2. An **admin's** bulk Excel onboarding flow — upload students, auto-generate
   credentials, export class-wise credential sheets.
3. A **teacher's** live lab-session monitoring view — starting a session for their
   allotted class and watching real-time (simulated) student activity.

---

## 1. TECH STACK

- React 18 + Vite, TypeScript, Tailwind CSS, Framer Motion
- React Context + useReducer for state (no Redux needed at this scale)
- Recharts (progress charts, analytics)
- TanStack Table (student rosters, reports)
- **SheetJS (xlsx)** — required for the bulk-upload simulation and credential export;
  this must produce a real, working .xlsx download, not a fake button
- lucide-react for icons
- No backend, no Prisma, no PostgreSQL, no real ASR/AI API calls — see Section 6 for
  how to fake AI/speech scoring convincingly

---

## 2. THEME — WHITE + ORANGE (non-negotiable)

- Base surface: white / near-white throughout
- Primary accent: warm orange (`#F97316` family) for buttons, active nav states,
  progress bars, badges, chart highlights
- Status colors (green/amber/red) reserved strictly for correctness/attendance
  states — never used decoratively
- **Tone shifts by class band**, per the Curriculum annexure:
  - Class 1–3: rounded shapes, mascot/character illustrations, big tap targets,
    confetti/star burst animations on correct answers
  - Class 4–7: card-based layout, moderate animation, star ratings, still warm/friendly
  - Class 8–10: calmer, exam-style layout, minimal animation, timer visible
  - Class 11–12: professional dashboard feel, near-zero gamification, benchmarking language
- Teacher/Admin panels: clean professional dashboard styling, orange used sparingly
  for key actions and chart accents — not childish even though the student side is

---

## 3. LOGIN / DEMO ACCESS

- Landing screen with three quick-access demo buttons: **"Login as Admin"**,
  **"Login as Teacher"**, **"Login as Student"** — no credential validation.
- "Login as Student" should let the demo presenter **pick a class (1–12)** before
  entering, so the click-through can show the Class 2 experience vs the Class 9
  experience back-to-back in the same demo session — this is the single most
  important interaction for impressing the client.
- Store fake session state (`role`, `selectedClass`) in Context; no localStorage.

---

## 4. STUDENT EXPERIENCE — CLASS-ADAPTIVE RENDERING

Build the student home/practice screens to **read the selected class from context**
and render a genuinely different experience per the Curriculum annexure's class bands.
Practically, implement **4 rendering profiles** (not 12 fully separate UIs — reuse
component variants):

| Profile | Classes | Key differences to visibly show in the demo |
|---|---|---|
| **Foundational** | 1–3 | Mascot guide character present on screen, voice-over style instruction bubbles, huge buttons, picture-matching exercises, confetti animation on every correct tap |
| **Elementary** | 4–7 | Card-based lesson grid, star ratings, moderate animation, paragraph-level reading/writing tasks |
| **Exam-Track** | 8–10 | Timer visible on exercises, exam-pattern passage/question layout, minimal animation, score-vs-class-average shown |
| **Advanced** | 11–12 | Professional dashboard tone, GD/interview-practice framing, benchmarking charts, near-zero gamification |

For each profile, build one working example screen per LSRW skill (Listening,
Speaking, Reading, Writing) using the specific exercise types and sample content
described in the Curriculum annexure for a representative class in that band (e.g.
use Class 2 content for Foundational, Class 6 for Elementary, Class 9 for Exam-Track,
Class 11 for Advanced) — full 12-class content authoring is out of scope for the demo.

### Student Dashboard Home (per profile)
- Foundational/Elementary: streak flame, XP bar, coin count, "Today's Lessons" as
  big tappable cards, badge shelf, leaderboard
- Exam-Track/Advanced: same structural widgets but restyled calmer — progress
  charts and skill radar take visual priority over gamification elements

### Practice Screens (build one working demo of each, at at least 2 difficulty profiles)
- **Listening:** audio player + waveform, question panel (MCQ/fill-blank/dictation
  depending on profile)
- **Speaking:** record button with waveform visualizer, target prompt shown, animated
  score reveal after "submission" (pronunciation/fluency/confidence rings) — see
  Section 6 for how to fake this
- **Reading:** passage with tap-to-define words, comprehension questions, reading
  timer for Exam-Track/Advanced profiles
- **Writing:** text editor with live word count, AI-suggestion underlines (static/
  pre-baked), submit → feedback panel

---

## 5. ADMIN PANEL — BULK ONBOARDING & CREDENTIALS

### 5.1 Bulk Upload Flow
- "Onboard Students" screen: drag-and-drop / file-picker for an `.xlsx` file
- Provide a **downloadable sample template** button (Name, Class, Section, Mobile
  Number, Date of Birth, Roll Number) so the demo presenter can show a real round-trip
- On upload, parse the file client-side with SheetJS, validate rows:
  - Missing/invalid mobile number format → row flagged
  - Missing/invalid DOB → row flagged
  - Duplicate student (same name + class + section) → row flagged
  - Missing class/section → row flagged
- Show a review table: valid rows (green) vs flagged rows (amber, with reason) before
  final "Confirm Onboarding"

### 5.2 Credential Auto-Generation
- On confirm, generate for each valid row:
  - **User ID:** pattern like `{SchoolCode}{Class}{Section}{RollOrSeq}` e.g. `DPS06B23`
  - **Password:** random secure alphanumeric string (e.g. 8 characters, mixed case +
    digit), generated client-side for the demo
- Show a success toast + updated student count on the Student Management table

### 5.3 Class-wise Credential Export
- From Student Management, filter by Class/Section, click **"Export Credentials"**
- Use SheetJS to generate and download a real `.xlsx` file: columns Name, Class,
  Section, User ID, Password — this must be a genuinely working download in the demo,
  not a placeholder toast

### 5.4 Individual Password Reset
- Row-level action in Student Management: "Reset Password" → regenerates just that
  student's password, shows it in a modal, updates state (no full re-export needed)

---

## 6. TEACHER PANEL — LIVE LAB SESSION MONITORING

### 6.1 Starting a Session
- Teacher Dashboard shows only their allotted class(es)/section(s) (from mock
  teacher-assignment data)
- "Start Lab Session" button for a class → transitions to the Live Monitoring screen

### 6.2 Live Monitoring Screen (the key demo "wow" screen)
- Grid of student tiles (avatar/initials, name) for every student in that class/section
- Each tile shows a **simulated live status**: Listening / Speaking / Reading /
  Writing / Idle, with a colored dot, plus a progress bar for the current exercise
- Use a `setInterval`-driven mock data updater so tiles visibly change state every
  few seconds during the live demo — this simulates real-time monitoring convincingly
  without any real backend/websocket
- Idle-too-long or low-score tiles get an amber/red flag automatically
- Clicking a tile opens a drawer with that student's current exercise detail and
  recent score history
- "End Session" button → shows a session summary screen (completion %, average score,
  time spent) generated from the mock session data

### 6.3 Teacher Progress Views
- Class roster table (from Student Management pattern) scoped to their class(es) only
- Student profile drawer: skill radar, submission history, "Add Remark" action
  (front-end only, appends to a local remarks list)
- "Pending Reviews" queue: mock speaking/writing submissions with a quick-score +
  feedback action

---

## 7. FAKING AI/SPEECH SCORING FOR DEMO CREDIBILITY

- No real ASR/LLM calls. Pre-bake realistic score sets per exercise in mock data
  (`mockScores.ts`): Pronunciation, Fluency, Confidence, Grammar, Vocabulary (0–100).
- After a student "submits" a speaking/writing task, show a brief (~500–700ms)
  processing animation, then reveal the pre-baked scores with an animated ring/bar
  fill — feels real without ever calling an external API.
- Mispronounced-word highlighting: use a fixed example sentence with 2–3 pre-marked
  words and a canned "correct pronunciation" audio-style tooltip.

---

## 8. DUMMY DATA REQUIREMENTS

- `src/data/students.ts`: at least 25–30 students per class across a representative
  set of classes (don't need all 12 fully populated — cover at least Class 2, Class 6,
  Class 9, Class 11 richly for the demo profiles in Section 4), realistic Indian names,
  mobile numbers (masked/fake format), DOBs
- `src/data/teachers.ts`: 5–8 teachers, each with 1–2 allotted class/sections
- `src/data/classes.ts`: Class 1–12 with sections (A/B), matching the Curriculum
  annexure's band structure
- `src/data/mockScores.ts`, `src/data/mockSessions.ts` for Section 6/7 fake data
- All numbers internally consistent — a student's dashboard score must match their
  profile drawer and the class-average calculations

---

## 9. FOLDER STRUCTURE (suggested)

```
src/
  app/                    → routing, providers, app shell (role-based layouts)
  components/ui/          → shared buttons, cards, modals, progress rings
  components/charts/      → Recharts wrappers
  features/auth/          → demo login + class-picker
  features/student/       → dashboard + LSRW practice screens (profile-aware)
  features/admin/         → onboarding, student mgmt, credentials export
  features/teacher/       → dashboard, live session monitoring, gradebook
  data/                   → mock data modules (Section 8)
  context/                → SessionContext (role, selectedClass, fake auth state)
  lib/                    → credential generator, excel parse/export helpers, mock
                             live-status simulator
```

---

## 10. NON-GOALS FOR THIS BUILD

- No real backend, database, or persistence beyond the browser session
- No real ASR/AI API calls (see Section 7)
- No Parent portal in this pass
- No full 12-class content authoring — 4 representative profile classes is sufficient
  for a convincing demo (Section 4)
- No real SMS/email sending for credential distribution — export-to-Excel only

---

## 11. DEFINITION OF DONE

- Login screen → pick role → (if student) pick a class → lands on a fully working,
  class-appropriate dashboard, no dead links in the primary demo path
- Admin can upload the sample Excel, see validation results, confirm onboarding, and
  download a real class-wise credential `.xlsx`
- Teacher can start a live session and watch student tiles change status in real time
  for at least 30–60 seconds of continuous simulated activity
- Switching between a Class 2 student view and a Class 9 student view in the same demo
  session clearly looks and feels like two different difficulty experiences
- White + orange theme applied consistently everywhere, dark mode not required for
  this build
- No console errors on the full demo click-through path

---

## 12. INSTRUCTION TO THE CODING AGENT

Read `Language-Lab-SRS-v2-SchoolLab.docx` and `Language-Lab-ClassWise-LSRW-Curriculum.docx`
before starting. This build's entire value is in making the class-wise adaptive
difficulty, the bulk-onboarding-to-credentials flow, and the live lab-monitoring view
feel real and impressive in a short client demo — prioritize those three flows over
completeness elsewhere. If any exercise content, credential format, or monitoring
detail is ambiguous, ask before assuming.
