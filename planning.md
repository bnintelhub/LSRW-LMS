# LSRW English Learning App — Product Planning

> **Goal:** Class 1 se Class 12 tak ke bachon ki English (Listening, Speaking, Reading, Writing) improve karna — school lab + home practice dono ke liye.
>
> **Current status:** Frontend demo ready hai (React + Vite). UI strong hai, lekin backend, real scoring, aur teacher-student sync abhi mock/simulated hai.

---

## 1. App Ka Core Vision

| Principle | Matlab |
|-----------|--------|
| **Class-adaptive** | Class 1–4 = games + voice; Class 5–12 = structured AI labs + exam prep |
| **Teacher-led** | Teacher session start kare → students login kare → teacher monitor kare |
| **Daily habit** | Roz ka task + Word of the Day + streak/XP se regular practice |
| **School-ready** | Admin bulk onboard kare, credentials export kare, reports de |

---

## 2. Abhi Kya Hai (Current Features)

### Student Panel
- Dashboard (metrics, skill radar, LSRW cards)
- Today's Tasks, Daily Report
- Class 1–4: 4 games (Listening, Speaking, Reading, Writing)
- Class 5–12: 4 AI labs (Speaking, Listening, Reading & WPM, Writing Checker)
- Word of the Day popup + chatbot
- Login tab tak teacher session start hone ka wait

### Teacher Panel
- Daily Task Desk (AI pack generate → edit → publish)
- Teacher Dashboard + Start Lab Session
- Live Monitoring (simulated grid)
- Roster + teacher remarks
- Pending Reviews (UI only)

### Admin Panel
- Overview, Bulk Excel Onboarding, Student Management
- Reports, School CRM (heatmap, allotments, session history, export)

### Jo Abhi Mock / Incomplete Hai
- Scores, XP, streak update nahi hote lab complete karne par
- Live monitoring real student activity se connect nahi
- Writing submissions teacher review queue mein nahi aate
- Listening mein real audio files nahi (browser TTS use hota hai)
- Speaking "AI" = word matching, real pronunciation API nahi
- Student list page reload par reset ho sakti hai (CRM alag save hota hai)

---

## 3. Student Panel — Kya Rakhein, Kya Add Karein, Kya Hataein

### ✅ Rakhein (Keep — strong foundation)
| Feature | Kyon |
|---------|------|
| Class-wise UI (games vs labs) | Junior aur senior students ki needs alag hain |
| 4 LSRW skills sidebar | Simple, clear navigation |
| Word of the Day | Daily vocabulary habit — bahut effective |
| Today's Tasks | Teacher-student workflow ka core |
| Daily Report | Parents + teacher ko progress dikhane ke liye |
| Session gate (teacher start kare tab login) | Real school lab flow |
| Chatbot (basic help) | Bachon ko guide karta hai |

### ➕ Add Karein (Priority order)

#### Phase 1 — Must Have (MVP)
| Feature | Detail | Class |
|---------|--------|-------|
| **Real score update** | Lab/game complete hone par score, XP, streak update | All |
| **Progress save** | Har student ka data database mein persist | All |
| **Leaderboard (class-wise)** | Healthy competition — top 10 class mein | 5–12 |
| **Badges & achievements** | "7-day streak", "Speaking Star", "100 WPM Reader" | All |
| **Listening — real audio** | Short MP3/podcast clips + quiz (abhi sirf TTS) | 5–12 |
| **Reading comprehension quiz** | Passage ke baad 3–5 MCQ | 5–12 |
| **Homework reminder** | "Aaj ka task incomplete hai" banner | All |
| **Hindi/regional hint toggle** | Difficult words ke liye mother-tongue meaning | 1–7 |

#### Phase 2 — Engagement
| Feature | Detail | Class |
|---------|--------|-------|
| **Phonics module** | Letter sounds, blending (Class 1–2 ke liye alag section) | 1–2 |
| **Story mode** | Picture story + listen + read along | 1–4 |
| **Debate / GD practice** | Topic card + timer + self-record | 9–12 |
| **Mock interview** | Common questions + AI/heuristic feedback | 11–12 |
| **Spelling bee mini-game** | Weekly class challenge | 3–6 |
| **Personal learning path** | Weak skill detect → extra practice suggest | 5–12 |
| **Parent view link** | Read-only weekly report (no login complexity) | All |

#### Phase 3 — Advanced
| Feature | Detail |
|---------|--------|
| Peer practice (pair speaking) | Same class students — controlled |
| Pronunciation drill library | Minimal pairs: ship/sheep, live/leave |
| Exam format packs | Unseen passage, formal letter, essay rubric |
| Offline mode (PWA) | Lab internet slow ho to bhi kaam kare |

### ➖ Hataein / Simplify Karein (Remove or defer)
| Feature | Kyon hataein / simplify |
|---------|-------------------------|
| Static "Top 28% Benchmark" | Jab tak real percentile data na ho — misleading |
| Coins (agar use nahi ho rahe) | XP + badges enough; coins tab add karo jab reward shop ho |
| Chatbot ke false claims | Jo feature nahi hai uska mention chatbot se hatao |
| Duplicate metrics cards | Dashboard par 4 cards enough — zyada clutter mat rakho |
| Class 5–12 same lab content per band | Har class ke liye thoda alag difficulty chahiye (abhi 4 bands mein merge hai) |

---

## 4. Teacher Panel — Kya Rakhein, Kya Add Karein, Kya Hataein

### ✅ Rakhein
| Feature | Kyon |
|---------|------|
| Daily Task Desk | Teacher ka main daily workflow |
| Start / End Lab Session | Student login control — already implemented |
| Scoped access (sirf apni class) | Privacy + realistic school setup |
| Roster + remarks | Teacher feedback loop |
| Live Monitoring concept | Schools ko yeh feature chahiye — bas real data chahiye |

### ➕ Add Karein

#### Phase 1 — Must Have
| Feature | Detail |
|---------|--------|
| **Real live monitoring** | Kaun sa student kaun sa lab kar raha hai — WebSocket/real-time |
| **Attendance mark karna** | Present / absent / late — session start par |
| **Custom task create** | Sirf AI pack nahi — teacher apna prompt/title likh sake |
| **Writing submission inbox** | Students jo "Submit to Teacher" kare — yahan dikhe |
| **Speaking recording review** | Student audio suno + score + comment |
| **Class performance snapshot** | Aaj ka avg, weak skill, incomplete tasks — 1 screen |
| **Export class report (PDF/Excel)** | Admin par depend mat karo — teacher ko bhi chahiye |
| **Session timer** | Real period duration track (abhi hardcoded 38 min) |

#### Phase 2
| Feature | Detail |
|---------|--------|
| **Homework assign + due date** | Kal tak complete karna hai |
| **Group activity launcher** | Poori class ko same listening passage bhejo |
| **Rubric-based grading** | Writing/speaking ke liye 1–5 scale + comments |
| **Parent message template** | "Your child needs more speaking practice" |
| **Content library** | Pre-made passages, prompts filter by class |
| **Substitution mode** | Dusre teacher ki class temporarily handle kare |

#### Phase 3
| Feature | Detail |
|---------|--------|
| AI lesson plan suggest | Week ka LSRW plan class level ke hisaab se |
| Compare sections | Class 8-A vs 8-B performance |
| Intervention alerts | 3 din task incomplete → flag |

### ➖ Hataein / Fix Karein
| Issue | Action |
|-------|--------|
| Hardcoded "8 Pending Reviews" | Real count from submissions |
| Hardcoded "Good Live Readiness" | Real metric ya hatao |
| Simulated live tiles (fake rotation) | Replace with real data ya label lagao "Demo Mode" |
| Pending Reviews toggle without save | Ya to full workflow banao ya tab hatao |
| Teacher can't see Word of the Day | Optional: teacher preview for class discussion |

---

## 5. Admin Panel — Kya Rakhein, Kya Add Karein, Kya Hataein

### ✅ Rakhein
| Feature | Kyon |
|---------|------|
| Bulk Excel onboarding | Schools ke liye #1 requested feature |
| Student management + credential export | Practical admin need |
| School CRM heatmap | Principal ko ek nazar mein picture |
| Teacher allotments editor | Kaun teacher kis class ka |
| Session history | Audit + reporting |

### ➕ Add Karein

#### Phase 1 — Must Have
| Feature | Detail |
|---------|--------|
| **Teacher CRUD** | Add/edit/deactivate teachers, password reset |
| **Academic year + terms** | 2025–26, Term 1/2/3 |
| **School profile** | Name, logo, address — reports par print |
| **Role permissions** | Admin vs Coordinator vs Lab Assistant |
| **Data backup / restore** | Database export — schools ko trust chahiye |
| **Sync allotments with teachers** | CRM allotments ↔ actual teacher accounts |

#### Phase 2
| Feature | Detail |
|---------|--------|
| **Curriculum CMS** | Admin content upload: audio, passages, prompts by class |
| **License / seat management** | Kitne students active hain |
| **Multi-branch** | Agar chain school ho |
| **Usage analytics** | Peak lab hours, most used skill |
| **Announcement broadcast** | Sab students ko message |

#### Phase 3
| Feature | Detail |
|---------|--------|
| State/board alignment tags | CBSE, ICSE skill mapping |
| Integration: Google Classroom / MS Teams | Optional |
| API for MIS export | School ERP ke saath |

### ➖ Hataein / Simplify
| Feature | Action |
|---------|--------|
| "Super Admin" label agar single school hai | Rename → **School Admin** |
| Reports jo static formula se aate hain | Real assessment data se replace |
| Duplicate teacher data (App + CRM) | Single source of truth |

---

## 6. Class 1–12 Content Strategy

### Class 1–2 (Foundational — Pre-A1)
| Focus | Activities |
|-------|------------|
| Phonics, letter sounds | Listen & tap, trace letters |
| Picture vocabulary | Match word to image |
| Simple sentences | "I see a cat" — speak after AI |
| **Avoid** | Long paragraphs, grammar terminology, WPM pressure |

### Class 3–4 (Early Elementary — A1)
| Focus | Activities |
|-------|------------|
| Sight words, rhymes | Games with rewards |
| Short dialogues | Listen + repeat |
| Sentence building | Word tiles, simple writing |
| **Add** | Star collection, animated AI teacher |

### Class 5–7 (Elementary — A2)
| Focus | Activities |
|-------|------------|
| Structured dashboard | Charts, daily path |
| Tenses, children's news | Reading lab |
| Mini presentations | Speaking lab |
| **Add** | Weekly spelling, short paragraph writing |

### Class 8–10 (Exam-Track — B1)
| Focus | Activities |
|-------|------------|
| Unseen passages | Reading + comprehension |
| Formal/informal writing | Email, letter, paragraph |
| Listening for exams | MCQ + note-taking |
| **Add** | Timer-based practice, score vs class avg |

### Class 11–12 (Advanced — B2+)
| Focus | Activities |
|-------|------------|
| JAM, GD, interview | Speaking lab advanced |
| Essay, report writing | Rubric-based feedback |
| Professional listening | Lecture excerpts |
| **Add** | Communication readiness dashboard, mock interview |

---

## 7. Technical Roadmap (Backend + Infra)

> Abhi app frontend-only hai. Production ke liye yeh order follow karo:

| Step | Kya banao | Kyon pehle |
|------|-----------|------------|
| 1 | **Backend API** (Node/Python) + PostgreSQL | Data persist, multi-device |
| 2 | **Real auth** (JWT / session) | Security |
| 3 | **WebSocket** live monitoring | Teacher panel ka core |
| 4 | **File storage** (S3/audio) | Listening lab |
| 5 | **Speech API** (Azure/Google) | Real pronunciation scoring |
| 6 | **LLM integration** (optional) | Writing feedback, task generation |
| 7 | **React Router** | Deep links, bookmarkable pages |
| 8 | **PWA** | Mobile practice at home |

---

## 8. Recommended Build Phases

### 🟢 Phase 1 — MVP (4–6 weeks)
**Goal:** Demo se real product — school pilot ready

- [ ] Backend + database + real login
- [ ] Lab scores → student profile update
- [ ] Teacher: real submissions inbox + remarks save
- [ ] Teacher: real live monitoring (basic)
- [ ] Admin: teacher CRUD
- [ ] Student: leaderboard + badges (basic)
- [ ] Fix: chatbot only claims real features

### 🟡 Phase 2 — School Pilot (6–8 weeks)
**Goal:** 1–2 schools daily use karein

- [ ] Real audio listening library (20+ clips per band)
- [ ] Reading comprehension quizzes
- [ ] Custom teacher tasks + due dates
- [ ] Class PDF/Excel reports
- [ ] Parent read-only report link
- [ ] Hindi hints for junior classes
- [ ] Per-class content (not just 4 bands)

### 🔵 Phase 3 — Scale (8–12 weeks)
**Goal:** Product market fit, multiple schools

- [ ] Curriculum CMS (admin content upload)
- [ ] Advanced speaking (interview, GD)
- [ ] Pronunciation API integration
- [ ] Multi-branch admin
- [ ] Analytics dashboard
- [ ] Mobile PWA

---

## 9. Priority Matrix (Impact vs Effort)

| Feature | Impact | Effort | Panel |
|---------|--------|--------|-------|
| Backend + persist scores | 🔥 High | Medium | All |
| Real teacher submission review | 🔥 High | Medium | Teacher |
| Real live monitoring | 🔥 High | High | Teacher |
| Listening real audio | 🔥 High | Medium | Student |
| Leaderboard + badges | Medium | Low | Student |
| Teacher attendance | Medium | Low | Teacher |
| Custom tasks | Medium | Medium | Teacher |
| Teacher CRUD | Medium | Low | Admin |
| Curriculum CMS | High | High | Admin |
| Phonics module (Class 1–2) | High | Medium | Student |
| Mock interview (11–12) | Medium | Medium | Student |
| Multi-school / branches | Low (early) | High | Admin |
| Coins / shop | Low | Medium | Student — defer |

---

## 10. Kya Mat Banao (Early Stage Mistakes)

1. **Sab kuch AI bolo** — Jab tak real AI na ho, "AI-assisted" ya "smart practice" likho
2. **Pehle mobile app native** — Pehle responsive web + PWA kaafi hai
3. **12 alag apps** — Ek app, class-adaptive UI better hai
4. **Zyada gamification** — Class 11–12 ko games kam, exam prep zyada
5. **Parent login complexity** — Phase 2 mein simple link; alag heavy app nahi
6. **Social features** — Class 1–12 mein open chat risk hai — avoid
7. **Perfect content day 1** — 20 great lessons per band > 200 mediocre

---

## 11. Success Metrics (Kaise pata chale app kaam kar raha hai)

| Metric | Target |
|--------|--------|
| Daily active students (lab day) | > 80% class present |
| Task completion rate | > 70% same day |
| Avg session time | 30–45 min (matches period) |
| Skill score improvement | +10% term-over-term |
| Teacher adoption | > 90% publish tasks weekly |
| Student return (streak) | > 50% with 3+ day streak |

---

## 12. Quick Decision Guide

| Agar yeh chahiye... | Pehle yeh banao |
|---------------------|-----------------|
| School demo impress karna | Phase 1 backend + real scores + teacher inbox |
| Class 1–2 ke liye best | Phonics + picture games + Hindi hints |
| Board exam schools (8–12) | Comprehension + timed writing + mock speaking |
| Principal ko sell karna | Admin CRM + heatmap + Excel export (already hai — backend se real banao) |
| Ghar par practice | PWA + homework tasks + Word of the Day |
| Kam budget | TTS + heuristic scoring rakho; Speech API Phase 3 |

---

## 13. Current Codebase — Next Files to Touch

| Area | Files | Next work |
|------|-------|-----------|
| Student labs | `src/features/student/labs/*` | Hook scores to API |
| Teacher desk | `src/features/teacher/DailyTaskDesk.tsx` | Custom task form |
| CRM state | `src/context/CrmContext.tsx` | Move to API |
| Auth | `src/App.tsx` | Replace mock login |
| Admin CRM | `src/features/admin/SchoolCrmReports.tsx` | Real aggregates |
| New | `src/api/*`, `server/*` | Backend layer |

---

## 14. Summary — Ek Line Mein

> **Student** = roz practice + fun (chhote) / exam-ready (bade)  
> **Teacher** = session control + tasks + real monitoring + feedback  
> **Admin** = school setup + data + reports  
> **Pehla real step** = backend + scores save + teacher submission workflow

---

*Last updated: August 2026 — LSRW Language Lab planning doc*
