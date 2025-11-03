# 🎯 Quick Reference: AI Workflow Patterns

## 🔄 Standard Workflow Pattern

### För varje feature/komponent:

```
1. RESEARCH (Perplexity Pro)
   └─> Ger recommendations
   
2. DECISION (Cursor Pro - DU)
   └─> Tar final beslutet
   
3. IMPLEMENTATION (GPT-5 / Gemini 2.5)
   └─> Skriver kod
   
4. REVIEW (Cursor Pro - DU)
   └─> Granskar & fixar
   
5. INTEGRATION (Cursor Pro - DU)
   └─> Integrerar & testar
   
6. DOCUMENTATION (Notion Pro)
   └─> Dokumenterar progress
```

---

## 📋 Vad Säger Du Till Varje AI?

### 🔍 Perplexity Pro (Research)
```
"Research [topic] för Frost Solutions:

1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

Ge mig:
- Sammanfattning
- Rekommenderad approach (med motivation)
- Code examples
- Länkar till dokumentation
- Vanliga pitfalls att undvika"
```

**Exempel:**
```
"Research drag & drop libraries för React:
- @dnd-kit vs react-beautiful-dnd
- Performance comparison
- TypeScript support
- Maintenance status
- Best practices"
```

---

### 💻 GPT-5 (Backend Development)
```
"Implementera [feature] backend för Frost Solutions:

Requirements:
- [requirement 1]
- [requirement 2]

Context:
- Database schema: [share schema]
- Existing API pattern: [share example]
- Error handling: [share pattern]

Skriv:
1. SQL migration (om behövs)
2. API endpoint: [method] /api/[path]
3. Business logic
4. Validation
5. Error handling

Make it production-ready med TypeScript."
```

**Exempel:**
```
"Implementera schedules API för Frost Solutions:

Requirements:
- CRUD operations för schedules
- Conflict detection
- Auto-time entry creation

Context:
- Database: Supabase PostgreSQL
- RLS policies required
- Tenant isolation mandatory

Skriv API endpoints och business logic."
```

---

### 🎨 Gemini 2.5 (Frontend Development)
```
"Skapa [component] för Frost Solutions:

Features:
- [feature 1]
- [feature 2]

Design system:
- Colors: Blue (#2563EB), Green (#10B981)
- Typography: 16px body, 24px headings
- Spacing: 8px base unit
- Tailwind CSS

Reference components:
- [share existing component examples]

Make it:
- Clean & simple
- Responsive (mobile-first)
- Accessible (WCAG AA)
- Reusable

Skriv TypeScript + React Components."
```

**Exempel:**
```
"Skapa ScheduleCalendar component:

Features:
- Week/month view
- Drag & drop
- Click to create/edit

Design system: [share colors, typography]
Reference: [share existing calendar component]

Make it clean, responsive, accessible."
```

---

### 📝 Notion Pro (Documentation)
```
"Uppdatera progress för [dag/feature]:

Completed:
- [task 1]
- [task 2]

In Progress:
- [task 3]

Issues Found:
- [issue 1]: [solution]

Decisions Made:
- [decision]: [reason]

Tomorrow's Plan:
- [task 1]
- [task 2]"
```

**Exempel:**
```
"Uppdatera progress för Dag 1:

Completed:
- SQL migration för schedules ✅
- API endpoints ✅
- ScheduleCalendar component ✅

Issues Found:
- Conflict detection bug: Fixed ✅

Decisions Made:
- Använder @dnd-kit istället för react-beautiful-dnd
- Reason: Better TypeScript support

Tomorrow's Plan:
- Arbetsorder-system
- Status transitions
- Push notifications"
```

---

### 🔧 Copilot Pro (Web) - Quick Code & Review
```
"Frost Solutions - [snabb uppgift]:

Context:
- [paste relevant code eller beskriv vad du behöver]

Behöver:
- [snabb kod snippet]
- [code review]
- [bug fix]
- [explanation]

Ge mig snabbt och koncist kod/feedback."
```

**Exempel:**
```
"Frost Solutions - Quick code snippet:

Behöver en TypeScript funktion som:
- Tar emot employee_id och project_id
- Kontrollerar om de finns i samma tenant
- Returnerar boolean

Ge mig snabbt kod."
```

**När använda Copilot Pro:**
- ✅ Snabba code snippets (när du inte vill vänta på GPT-5)
- ✅ Code review av specifik kod
- ✅ Bug fixes
- ✅ Kod-förklaringar

**När INTE använda:**
- ❌ Komplex backend-logik (använd GPT-5)
- ❌ UI-komponenter (använd Gemini 2.5)
- ❌ Research (använd Perplexity)

---

## 🎯 Decision-Making Process

### När Perplexity föreslår något:

```
Perplexity: "Rekommenderar @dnd-kit"
Cursor Pro (Du): 
  ✅ Läser recommendations
  ✅ Jämför med alternativ
  ✅ Tar beslutet: "Ja, vi använder @dnd-kit"
  ✅ Dokumenterar i Notion: "Beslut: @dnd-kit"
```

### När GPT-5 skriver kod:

```
GPT-5: [Skriver kod]
Cursor Pro (Du):
  ✅ Granskar koden
  ✅ Kollar: Error handling? Types? Performance?
  ✅ Fixar eventuella problem
  ✅ Integrerar i projektet
  ✅ Testar
```

### När Gemini skapar UI:

```
Gemini 2.5: [Skapar komponent]
Cursor Pro (Du):
  ✅ Granskar design
  ✅ Kollar: Responsive? Accessible? Clean?
  ✅ Fixar eventuella problem
  ✅ Integrerar i projektet
  ✅ Testar
```

---

## ⚠️ Viktiga Regler

### 1. Cursor Pro har alltid final say
- Alla AI:er föreslår
- Du beslutar
- Du implementerar final version

### 2. Alltid dokumentera beslutet
- I Notion Pro
- Varför beslutet togs
- Vem föreslog vad

### 3. Testa alltid efter integration
- Kolla att det fungerar
- Testa edge cases
- Fixa bugs direkt

### 4. Commit ofta
- Efter varje större feature
- Med tydlig commit message
- Inkludera vad som ändrats

---

## 🚀 Quick Start: Dag 1

### Step 1: Notion Pro (5 min)
```
"Skapa task breakdown för Dag 1: Resursplanering"
```

### Step 2: Perplexity Pro (30 min)
```
"Research schema/resursplanering för Frost Solutions..."
```

### Step 3: Du (Cursor Pro) - Beslut (10 min)
```
Läs Perplexity's research
Ta beslut om approach
Dokumentera i Notion
```

### Step 4: GPT-5 (1h)
```
"Implementera schedules backend..."
```

### Step 5: Du (Cursor Pro) - Review (1h)
```
Granska GPT-5's kod
Fixa problem
Integrera
Testa
```

### Step 6: Gemini 2.5 (1h)
```
"Skapa ScheduleCalendar component..."
```

### Step 7: Du (Cursor Pro) - Review (1h)
```
Granska Gemini's komponent
Fixa problem
Integrera
Testa
```

### Step 8: Integration & Testing (2h)
```
Du integrerar allt
Du testar full flow
Du fixar bugs
Du committar
```

---

## ✅ Success Checklist

- [ ] Research completed (Perplexity)
- [ ] Decisions documented (Notion)
- [ ] Backend implemented (GPT-5)
- [ ] Backend reviewed (Cursor Pro)
- [ ] Frontend implemented (Gemini)
- [ ] Frontend reviewed (Cursor Pro)
- [ ] Integration completed (Cursor Pro)
- [ ] Testing passed (Cursor Pro)
- [ ] Git commit done (Cursor Pro)
- [ ] Notion updated (Notion Pro)

---

**Nu är du redo att börja Dag 1! 🚀**

