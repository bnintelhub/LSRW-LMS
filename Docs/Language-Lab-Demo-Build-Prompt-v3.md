# AI CODING AGENT — BUILD PROMPT (v3)
## School English Language Lab (LSRW) — FRONTEND-ONLY CLIENT DEMO
### White + Orange Theme | Hardcoded Multi-Role Login | Full Class-wise Dummy Data | Game-Based Junior Content

**Companion documents:** `Language-Lab-SRS-v2-SchoolLab.docx`, `Language-Lab-ClassWise-LSRW-Curriculum.docx`

**Supersedes:** `Language-Lab-Demo-Build-Prompt-v2.md` — this version replaces the login
flow and dummy-data scope with the more complete requirements below. Everything else
from v2 (theme, credential export, live monitoring, folder structure) still applies
unless overridden here.

---

## 0. PURPOSE OF THIS BUILD

This is a **large, fully click-through frontend-only demo**. Nothing may be a dead
end — every role, every class, every screen referenced below must actually work with
real (dummy) data behind it. This is going to be shown as a serious, complete product
demo, not a partial prototype, so treat every section below as mandatory, not optional.

---

## 1. TECH STACK (unchanged from v2)

React 18 + Vite, TypeScript, Tailwind CSS, Framer Motion, React Context + useReducer,
Recharts, TanStack Table, SheetJS (xlsx), lucide-react. No backend, no real API calls.

---

## 2. LOGIN PAGE — HARDCODED MULTI-ROLE DEMO ACCESS

The app **must open on a proper login page first** — not skip straight to a dashboard.
This login page itself is part of the demo experience and should look polished
(white + orange branding, school-lab themed hero/illustration).

### 2.1 Login Page Behavior
- A role selector (tabs or cards): **Super Admin / Teacher / Student**
- Below the role selector, show a **"Quick Demo Login" panel** listing hardcoded
  accounts the presenter can click to instantly log in as — no typing required
  during the live demo, but the fields should still visually look like a real
  login form (User ID + Password inputs, pre-fillable by clicking a demo account)

### 2.2 Hardcoded Demo Accounts (build all of these into mock data)

**Super Admin**
- 1 account — e.g. `admin / admin123` — full access to every school, class, teacher record

**Teachers** — at least one teacher per class band, each allotted specific class/sections
- Teacher for Class 1–3 (Foundational band)
- Teacher for Class 4–7 (Elementary band)
- Teacher for Class 8–10 (Exam-Track band)
- Teacher for Class 11–12 (Advanced band)
- (Feel free to add 1–2 more teachers covering multiple sections for realism)

**Students** — **at least one demo student login for every class, Class 1 through
Class 12** (12 accounts minimum), so the presenter can click straight into any class's
experience without hunting for the right one. Label them clearly in the quick-login
list, e.g. "Aarav — Class 1", "Simran — Class 6", "Rohan — Class 11", etc.

- All these accounts must be real, selectable entries in a `mockAccounts.ts` file —
  clicking one logs the demo straight into that exact role/class context.

### 2.3 Post-Login Routing
- Super Admin → Admin Dashboard (school-wide)
- Teacher → Teacher Dashboard, pre-scoped to their allotted class(es)
- Student → their class-appropriate Student Dashboard (rendering profile determined
  by their class per Section 4 below)

---

## 3. THEME — WHITE + ORANGE (unchanged from v2)

Base white surfaces, warm orange accent, tone shifts by class band (Foundational →
Elementary → Exam-Track → Advanced), status colors reserved for meaning only.

---

## 4. STUDENT EXPERIENCE — FULL CLASS COVERAGE + GAME-BASED JUNIOR CONTENT

### 4.1 Every Class Must Work
Unlike a partial demo, **every one of the 12 hardcoded student logins must land on a
genuinely populated, working dashboard** for that class — not a placeholder. Use the
4 rendering profiles (Foundational/Elementary/Exam-Track/Advanced) from the Curriculum
annexure to share components across classes within a band, but each class's login
must show that class's own name, its own mock lesson set, and its own mock scores —
it must not feel like a copy-paste of a neighboring class.

### 4.2 Junior Classes (1–3) — Game, Video & GIF-Based Learning
This is the single most important visual differentiator for the demo. Junior-class
screens must **not** look like a shrunk-down version of the senior dashboard — they
should feel like a genuine kids' learning app:

- **Video-style content cards:** lesson tiles show short looping preview animations
  or GIF-style motion (can be built with CSS/Framer Motion sprite animation or looping
  short clips) instead of static thumbnails
- **Game-based exercises**, not plain quizzes:
  - Drag-and-drop picture-to-word matching games
  - "Pop the correct bubble" style tap games for listening exercises
  - Simple matching-pairs / memory-card games for vocabulary
  - A mascot character that animates (waves, claps, celebrates) in response to
    student actions — present throughout the Foundational profile, not just on
    the home screen
- **Rich reward animations:** confetti bursts, star showers, animated badge pop-ups,
  a short celebratory character animation on completing a lesson — these should feel
  genuinely delightful, not just a static "Well done!" toast
- **Sound-first UI:** every instruction has a speaker icon implying audio playback
  (actual audio files optional for the demo, but the UI affordance must be present),
  since pre-readers rely on listening, not reading instructions
- Use bright but tasteful illustrations/emoji/icon sets consistent with the white +
  orange palette (orange doesn't have to mean literal orange-colored characters —
  use it as the UI accent while character/game art can use a broader friendly palette)

### 4.3 Elementary (4–7), Exam-Track (8–10), Advanced (11–12)
As defined in v2 Section 4 — card-based → exam-style → professional, with decreasing
animation and increasing chart/benchmark emphasis. These bands should visibly feel
calmer and more "serious" than the junior game-based experience, reinforcing the
class-wise progression story in the demo.

### 4.4 Practice Screens
Build one fully working example per LSRW skill (Listening/Speaking/Reading/Writing)
for **each of the 4 profiles** (so 16 example screens total, reusing shared components
wherever sensible) — this was scoped to "at least 2 profiles" in v2; for this version,
**all 4 profiles need at least one working example per skill.**

---

## 5. ADMIN PANEL, TEACHER PANEL, BULK ONBOARDING, LIVE MONITORING

Unchanged from v2 (Sections 5–6) — bulk Excel onboarding with validation and
credential auto-generation/export, and the live lab-session monitoring screen with
simulated real-time student status tiles. These remain mandatory, fully working flows.

---

## 6. FAKING AI/SPEECH SCORING (unchanged from v2)

Pre-baked mock scores revealed with a short processing animation — no real API calls.
Extend the mock score set to cover all 12 classes' demo students, not just 4.

---

## 7. FULL DUMMY DATA REQUIREMENTS (expanded — mandatory, not partial)

This is a large project and every part of it must actually work in the demo, so
dummy data must have **real coverage across all 12 classes**, not just representative
samples:

- `src/data/mockAccounts.ts` — the full hardcoded login list from Section 2.2
- `src/data/students.ts` — **every class (1–12) populated** with at least 20–25
  students each (roughly 250–300 students total), realistic Indian names, sections,
  mobile numbers (masked/fake format), DOBs, and per-student LSRW scores
- `src/data/teachers.ts` — all teachers from Section 2.2, each with correct
  class/section allotments matching what their login should show
- `src/data/classes.ts` — Class 1–12 with sections, matching the Curriculum annexure
  band structure
- `src/data/lessons.ts` — at least one real lesson per skill per class band
  (Foundational/Elementary/Exam-Track/Advanced), attributed to the correct classes
- `src/data/mockScores.ts`, `src/data/mockSessions.ts` — covering demo students
  across all 12 classes, not just 4
- All numbers internally consistent: a student's dashboard score, their profile
  drawer, their teacher's gradebook view, and the class-average chart must all agree

---

## 8. FOLDER STRUCTURE (unchanged from v2, Section 9)

---

## 9. NON-GOALS FOR THIS BUILD

- No real backend, database, or persistence beyond the browser session
- No real ASR/AI API calls, no real video/audio file hosting (looping CSS/Framer
  Motion animation or short local sample clips are fine substitutes for "video/GIF"
  feel in the demo)
- No Parent portal in this pass
- No real SMS/email sending — Excel export only

---

## 10. DEFINITION OF DONE

- App opens on a polished login page; every hardcoded account in Section 2.2 logs in
  successfully to a fully populated, class-correct dashboard — all 12 student class
  logins work, not a subset
- Junior-class (1–3) screens are visibly game/animation/mascot-driven and clearly
  distinct in feel from Elementary/Exam-Track/Advanced screens
- Admin bulk-onboarding-to-credential-export flow works end to end with a real
  `.xlsx` download
- Teacher live lab-session monitoring shows visibly changing simulated student
  activity for at least 30–60 seconds
- No dead links, no "Coming Soon" placeholders, no console errors across the full
  click-through path for all three roles
- White + orange theme applied consistently; junior game art can be colorful but the
  UI chrome (buttons, nav, highlights) stays on-brand

---

## 11. INSTRUCTION TO THE CODING AGENT

Read `Language-Lab-SRS-v2-SchoolLab.docx` and `Language-Lab-ClassWise-LSRW-Curriculum.docx`
first. This is a large build — pace it: get the login + role routing + one fully
working class per profile solid first, then expand dummy data breadth across all 12
classes once the core interaction patterns are proven. Ask before assuming on anything
related to exact game mechanics, credential formats, or class-band boundaries.
