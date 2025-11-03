# 🚀 Dag 1: Resursplanering & Schema - Step-by-Step Guide

## 🎯 Mål för Dag 1
Implementera drag & drop schema, bemanning per projekt, och frånvarohantering.

---

## 📊 Beslutshierarki & Final Say

### Beslutshierarki:
1. **Perplexity Pro** → Research & recommendations (ingen final say)
2. **GPT-5** → Tekniska lösningar (ingen final say)
3. **Gemini 2.5** → UI/UX design (ingen final say)
4. **Cursor Pro (Du)** → **FINAL SAY** på alla beslut
5. **Copilot** → Assisterar (ingen beslutsmakt)
6. **Notion Pro** → Dokumenterar (ingen beslutsmakt)

**⚠️ Viktigt:** Alla AI:er föreslår, men **Cursor Pro har alltid final say** och gör slutgiltiga besluten.

---

## 📅 Timmar-för-Timmar Plan (12h)

### ⏰ 08:00-09:00: Morning Planning & Research (1h)

#### Step 1: Notion Pro (10 min)
**Du säger till Notion Pro:**
```
"Skapa dagens task breakdown för Dag 1: Resursplanering.

Inkludera:
- Research tasks (Perplexity)
- Backend tasks (GPT-5)
- Frontend tasks (Gemini)
- Integration tasks (Cursor Pro)
- Testing tasks

Strukturera med checkboxes och tidsestimering."
```

**Notion Pro skapar:** Task list med alla subtasks

---

#### Step 2: Perplexity Pro Research (30 min)

**Du säger till Perplexity Pro:**
```
"Research för Frost Solutions schema/resursplanering feature:

1. @dnd-kit vs react-beautiful-dnd
   - Performance comparison
   - TypeScript support
   - Maintenance status
   - Best practices

2. Calendar component libraries för React
   - FullCalendar alternatives
   - Drag & drop calendar implementations
   - Mobile-friendly solutions

3. Conflict detection algorithms för schema-bokning
   - How to detect overlapping schedules
   - Best practices för conflict resolution
   - Database design patterns

4. Auto-time entry creation från schema
   - Patterns för syncing schema → time entries
   - Best practices för automation

Ge mig:
- Sammanfattning av varje punkt
- Rekommenderad approach med motivation
- Code examples om möjligt
- Länkar till dokumentation
- Vanliga pitfalls att undvika"
```

**Perplexity Pro ger:** Research results med recommendations

---

#### Step 3: Cursor Pro (Du) - Beslut baserat på Research (20 min)

**Du läser Perplexity's research och tar beslut:**

**Beslut 1: Drag & Drop Library**
```
Perplexity föreslår: @dnd-kit
Motivation: Better TypeScript, maintained, good performance

Cursor Pro beslut: ✅ Ja, vi använder @dnd-kit
```

**Beslut 2: Calendar Component**
```
Perplexity föreslår: Custom med @dnd-kit (mer kontroll)

Cursor Pro beslut: ✅ Ja, vi bygger custom calendar component
```

**Beslut 3: Conflict Detection**
```
Perplexity föreslår: Database-level constraints + application logic

Cursor Pro beslut: ✅ Ja, både DB constraints och app logic
```

**Du dokumenterar i Notion:**
```
[08:00] Research completed
- Beslut: @dnd-kit för drag & drop ✅
- Beslut: Custom calendar component ✅
- Beslut: Dual-layer conflict detection ✅
```

---

### ⏰ 09:00-12:00: Backend Development (3h)

#### Step 4: GPT-5 - SQL Migration & Schema Design (1h)

**Du säger till GPT-5:**
```
"Frost Solutions - Implementera schema/resursplanering backend.

Context från Perplexity research:
- Vi använder @dnd-kit (beslut redan taget)
- Custom calendar component
- Dual-layer conflict detection

Requirements:
1. SQL migration för schedules tabell:
   - tenant_id (FK)
   - project_id (FK)
   - employee_id (FK)
   - start_time (timestamp)
   - end_time (timestamp)
   - status (pending, confirmed, cancelled)
   - created_at, updated_at

2. Conflict detection:
   - Database constraint: Prevent overlapping schedules för samma employee
   - Application logic: Check conflicts before insert/update

3. Auto-time entry creation:
   - Background job eller trigger
   - Skapa time entries från confirmed schedules
   - Markera som auto-created

4. API endpoints:
   - POST /api/schedules - Create schedule
   - GET /api/schedules - List schedules (with filters)
   - PUT /api/schedules/[id] - Update schedule
   - DELETE /api/schedules/[id] - Delete schedule
   - GET /api/schedules/conflicts - Check conflicts

Använd vårt pattern:
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Tenant isolation
- TypeScript types

Skriv:
1. SQL migration fil
2. API route handlers
3. Business logic för conflict detection
4. Error handling

Make it production-ready!"
```

**GPT-5 skapar:** SQL migration + API endpoints + business logic

---

#### Step 5: Cursor Pro (Du) - Review & Integrate GPT-5's Code (1h)

**Du granskar GPT-5's kod:**

1. **Kolla SQL migration:**
   - ✅ RLS policies korrekta?
   - ✅ Foreign keys korrekta?
   - ✅ Constraints korrekta?
   - ✅ Indexes för performance?

2. **Kolla API endpoints:**
   - ✅ Error handling?
   - ✅ Validation?
   - ✅ Tenant isolation?
   - ✅ TypeScript types?

3. **Kolla business logic:**
   - ✅ Conflict detection logik korrekt?
   - ✅ Edge cases hanterade?

**Du fixar eventuella problem och integrerar:**

```typescript
// Exempel: Du ser att GPT-5 glömde ett edge case
// Du fixar det direkt i Cursor
```

**Du kör SQL migration:**
```bash
# I Supabase SQL Editor eller via CLI
# Kopiera GPT-5's SQL och kör den
```

**Du testar API endpoints:**
- Testa POST /api/schedules
- Testa GET /api/schedules
- Testa conflict detection

**Du dokumenterar i Notion:**
```
[10:00] Backend implementation completed
- SQL migration: ✅
- API endpoints: ✅
- Conflict detection: ✅
- Issues found: [list]
- Fixed: [list]
```

---

#### Step 6: GPT-5 - Frånvarohantering (1h)

**Du säger till GPT-5:**
```
"Frost Solutions - Implementera frånvarohantering.

Requirements:
1. SQL migration för absences tabell:
   - tenant_id, employee_id
   - start_date, end_date
   - type (vacation, sick, other)
   - status (pending, approved, rejected)
   - reason (optional)

2. Blockera schema-bokning vid frånvaro:
   - Update conflict detection logic
   - Check absences när man bokar schema

3. API endpoints:
   - POST /api/absences
   - GET /api/absences
   - PUT /api/absences/[id]

Använd samma pattern som schedules.
```

**GPT-5 skapar:** Absences migration + API + integration

**Du:** Review, fixa, integrera, testa

---

### ⏰ 13:00-17:00: Frontend Development (4h)

#### Step 7: Gemini 2.5 - UI Components Design (1h)

**Du säger till Gemini 2.5:**
```
"Frost Solutions - Skapa UI-komponenter för schema/resursplanering.

Requirements:
1. ScheduleCalendar component:
   - Week/month view
   - Drag & drop med @dnd-kit
   - Click to create/edit schedule
   - Show conflicts (red highlight)
   - Show absences (grayed out)

2. ScheduleCard component:
   - Visa schedule info (employee, project, time)
   - Edit/delete buttons
   - Status badge

3. AbsenceCalendar component:
   - Visa frånvaro i kalendern
   - Create/edit frånvaro

Design system:
- Colors: Blue (#2563EB), Green (#10B981), Red (#EF4444), Gray (#6B7280)
- Typography: 16px body, 24px headings
- Spacing: 8px base unit
- Tailwind CSS

Reference components:
- [Share existing component examples]

Make it:
- Clean & simple
- Responsive (mobile-first)
- Accessible (WCAG AA)
- Reusable

Skriv TypeScript + React Server/Client Components där lämpligt."
```

**Gemini 2.5 skapar:** UI components med styling

---

#### Step 8: Cursor Pro (Du) - Review & Integrate Gemini's Components (1h)

**Du granskar Gemini's komponenter:**

1. **Kolla struktur:**
   - ✅ Server vs Client Components korrekt?
   - ✅ Props typer korrekta?
   - ✅ Styling konsistent?

2. **Kolla funktionalitet:**
   - ✅ @dnd-kit korrekt implementerad?
   - ✅ API calls korrekta?
   - ✅ Error handling?

3. **Kolla design:**
   - ✅ Matchar design system?
   - ✅ Responsive?
   - ✅ Accessible?

**Du fixar och integrerar:**

```typescript
// Exempel: Du ser att Gemini glömde loading states
// Du lägger till dem
```

**Du testar komponenter:**
- Testa ScheduleCalendar
- Testa drag & drop
- Testa responsive design

**Du dokumenterar i Notion:**
```
[14:00] Frontend components completed
- ScheduleCalendar: ✅
- ScheduleCard: ✅
- AbsenceCalendar: ✅
- Issues found: [list]
- Fixed: [list]
```

---

#### Step 9: Gemini 2.5 - Mobile Optimization (1h)

**Du säger till Gemini 2.5:**
```
"Optimera schema-komponenter för mobile:

- Touch-friendly drag & drop
- Swipe gestures för actions
- Bottom sheet för editing
- Simplified calendar view för small screens

Make it work perfectly on mobile devices."
```

**Gemini 2.5:** Optimerar för mobile

**Du:** Review, fixa, integrera, testa på mobile

---

#### Step 10: Integration med Existing Pages (1h)

**Du (Cursor Pro) integrerar:**

1. Lägg till ScheduleCalendar i `/projects/[id]/page.tsx`
2. Lägg till AbsenceCalendar i `/employees/[id]/page.tsx` (eller ny sida)
3. Lägg till länkar i navigation
4. Testa full flow

**Du dokumenterar:**
```
[16:00] Integration completed
- Added to project page: ✅
- Added to employee page: ✅
- Navigation updated: ✅
```

---

### ⏰ 18:00-20:00: Integration & Polish (2h)

#### Step 11: Full Integration Testing (1h)

**Du testar hela flödet:**

1. ✅ Skapa schema
2. ✅ Drag & drop
3. ✅ Conflict detection
4. ✅ Frånvaro-bokning
5. ✅ Auto-time entry creation
6. ✅ Mobile responsiveness
7. ✅ Error handling

**Du fixar alla bugs du hittar**

**Du dokumenterar bugs i Notion:**
```
[18:00] Full integration testing
- Bugs found: [list]
- Fixed: [list]
- Remaining: [list]
```

---

#### Step 12: Performance Optimization (30 min)

**Du optimerar:**

- ✅ Database queries (indexes?)
- ✅ Component re-renders
- ✅ API response times
- ✅ Bundle size

**Du dokumenterar:**
```
[19:00] Performance optimization
- Database indexes added: ✅
- Component optimization: ✅
- Bundle size: [size]
```

---

#### Step 13: Final Review & Git Commit (30 min)

**Du gör final review:**

1. ✅ Alla features kompletta?
2. ✅ Alla bugs fixade?
3. ✅ Code quality OK?
4. ✅ Dokumentation uppdaterad?

**Du committar till git:**

```bash
git add .
git commit -m "feat: Implement resursplanering & schema

- Add schedules table with RLS policies
- Add absences table with RLS policies
- Implement conflict detection (DB + app level)
- Create ScheduleCalendar component with @dnd-kit
- Create AbsenceCalendar component
- Add auto-time entry creation from schedules
- Mobile-optimized components
- Full integration testing

Closes: Day 1 tasks"
```

**Du dokumenterar i Notion:**
```
[20:00] Day 1 completed ✅
- All features: ✅
- All tests: ✅
- Git commit: ✅
- Ready for Day 2: ✅
```

---

## 🔄 Workflow Pattern (För alla steg)

### Pattern som alltid upprepas:

```
1. Research (Perplexity) → Recommendations
2. Beslut (Cursor Pro) → Final decision
3. Implementation (GPT-5/Gemini) → Code
4. Review (Cursor Pro) → Check & fix
5. Integration (Cursor Pro) → Merge & test
6. Documentation (Notion) → Track progress
```

---

## 📋 Beslutsmaktsstruktur

### Vem beslutar vad:

| Beslut | Vem beslutar | Vem föreslår |
|--------|--------------|--------------|
| Teknisk approach | **Cursor Pro** | Perplexity, GPT-5 |
| Library choice | **Cursor Pro** | Perplexity |
| Code structure | **Cursor Pro** | GPT-5 |
| UI design | **Cursor Pro** | Gemini 2.5 |
| Feature scope | **Cursor Pro** | Notion Pro (planning) |
| Git commits | **Cursor Pro** | (Automatiskt) |

**⚠️ Alla AI:er föreslår, men Cursor Pro (Du) har alltid final say.**

---

## 🎯 Quick Reference: Vad säger du till varje AI?

### Till Perplexity Pro:
```
"Research [topic] för Frost Solutions:
- [specific questions]
- Best practices
- Code examples
- Pitfalls
- Recommendations"
```

### Till GPT-5:
```
"Implementera [feature] backend:
- Requirements: [list]
- Context: [paste relevant code]
- Database schema: [share]
- Make it production-ready"
```

### Till Gemini 2.5:
```
"Skapa [component] frontend:
- Features: [list]
- Design system: [share]
- Reference: [share existing components]
- Make it clean & responsive"
```

### Till Notion Pro:
```
"Uppdatera progress:
- Completed: [list]
- Issues: [list]
- Decisions: [list]
- Tomorrow's plan: [list]"
```

---

## ✅ Success Checklist för Dag 1

- [ ] Morning planning completed (08:00-09:00)
- [ ] Research completed (Perplexity)
- [ ] Backend SQL migration run (GPT-5)
- [ ] Backend API endpoints working (GPT-5)
- [ ] Frontend components created (Gemini)
- [ ] Integration completed (Cursor Pro)
- [ ] Mobile optimization done (Gemini)
- [ ] Full testing passed (Cursor Pro)
- [ ] Performance optimized (Cursor Pro)
- [ ] Git commit done (Cursor Pro)
- [ ] Notion updated (Notion Pro)

---

## 🚀 Ready to Start?

**När du är redo:**

1. ✅ Öppna Notion Pro och säg: "Skapa dagens task breakdown för Dag 1"
2. ✅ Öppna Perplexity Pro och säg: "Research för schema/resursplanering..."
3. ✅ Vänta på research results
4. ✅ Ta beslut (Du)
5. ✅ Fortsätt med GPT-5 för backend
6. ✅ Fortsätt med Gemini för frontend
7. ✅ Du integrerar allt
8. ✅ Commit när klar

**Låt oss bygga världens bästa schema-system! 🚀**

