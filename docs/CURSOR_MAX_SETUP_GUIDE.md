# 🎯 Cursor Max Setup Guide + 6-AI Workflow

## ⚡ Quick Setup (30 min)

### Step 1: Skaffa Cursor Max (5 min)
1. Gå till cursor.sh
2. Upgrade till Max
3. Installera/uppdatera Cursor
4. Verifiera Max är aktiv

### Step 2: Setup Notion Workspace (10 min)
1. Skapa nytt workspace: "Frost Solutions - 1 Week Sprint"
2. Skapa templates:
   - Daily Task List
   - Feature Tracker
   - Bug Log
   - Decision Log
   - Code Review Notes

### Step 3: Context Sharing Setup (10 min)
1. **Notion Pro:** Skapa master document med:
   - Project architecture
   - Database schema
   - API endpoints list
   - Component library
   - Design system

2. **Share Notion links** med andra AIs när de behöver context

### Step 4: IDE Setup (5 min)
1. **Cursor Max:** Öppna projektet
2. **Copilot Pro:** Aktivera i VS Code/Cursor
3. **Setup shortcuts** för snabb access

---

## 🔄 Daily Workflow (12h/dag)

### 08:00-09:00: Morning Planning
**Notion Pro:**
```
"Review today's tasks from 8-week plan, day X:
- [List tasks]
Create detailed task breakdown with:
- Subtasks
- Dependencies
- Estimated time
- AI assignments"
```

**Perplexity Pro:**
```
"Research today's features:
- [Feature 1]: Best practices, API docs, code examples
- [Feature 2]: Implementation patterns, libraries
- [Feature 3]: Common pitfalls, solutions

Provide:
1. Summary
2. Recommended approach
3. Code examples
4. Links to docs"
```

**Cursor Max:**
```
"Review today's tasks and setup:
1. Check git status
2. Review yesterday's code
3. Plan architecture for today's features
4. Identify dependencies
5. Setup any new files/folders needed"
```

---

### 09:00-12:00: Backend Development

**GPT-5:**
```
"Implement [Feature] backend:

Requirements:
- [requirement 1]
- [requirement 2]

Context:
- Database schema: [share schema]
- Existing API pattern: [share example]
- Error handling: [share pattern]

Write:
1. SQL migration (if needed)
2. API endpoint: POST /api/[feature]
3. Business logic
4. Validation
5. Error handling

Make it production-ready."
```

**Cursor Max:**
```
"Review GPT-5's code:
- [paste GPT-5 code]
- Check against our codebase style
- Add TypeScript types
- Integrate with existing code
- Add tests
- Fix any issues"
```

**Copilot Pro:**
- Auto-complete i IDE
- Import suggestions
- Quick fixes

**Notion Pro:**
```
"Update progress:
- [ ] Backend API created
- [ ] Database migration done
- [ ] Tests added
- [ ] Issues found: [list]
- [ ] Solutions: [list]"
```

---

### 13:00-17:00: Frontend Development

**Gemini 2.5:**
```
"Create React component for [Component Name]:

Features:
- [feature 1]
- [feature 2]

Design:
- Clean & simple
- Match design system: [share design system]
- Responsive
- Accessible (WCAG AA)

Use existing components as reference:
- [share component examples]

Create:
1. Component file
2. TypeScript types
3. Styling with Tailwind
4. Loading states
5. Error states"
```

**Cursor Max:**
```
"Review Gemini's component:
- [paste component code]
- Check styling consistency
- Add to component library
- Integrate with existing pages
- Test responsiveness
- Fix any issues"
```

**Copilot Pro:**
- Generate component boilerplate
- Auto-complete props
- Import suggestions

**Notion Pro:**
```
"Update progress:
- [ ] Component created
- [ ] Styling done
- [ ] Responsive tested
- [ ] Integrated into [page]"
```

---

### 18:00-20:00: Integration & Polish

**Cursor Max:**
```
"Integrate all today's work:
1. Backend API + Frontend components
2. Test full flow
3. Fix integration issues
4. Performance check
5. Error handling review
6. Git commit

Create commit message:
- [Feature name]: [brief description]
- Added: [list]
- Fixed: [list]"
```

**GPT-5:**
```
"Review code for optimization:
- [share code]
- Check performance bottlenecks
- Suggest optimizations
- Review error handling
- Check security"
```

**Notion Pro:**
```
"Document today's work:
- Features completed
- Issues found & fixed
- Decisions made
- Tomorrow's plan
- Blockers (if any)"
```

---

## 🎯 Feature-Specific AI Assignments

### Resursplanering (Dag 1)

**Perplexity Pro:**
- Research @dnd-kit vs react-beautiful-dnd
- Research calendar component libraries
- Research conflict detection algorithms

**GPT-5:**
- Write SQL migration for schedules
- Write conflict detection logic
- Write auto-time entry creation logic

**Gemini 2.5:**
- Create ScheduleCalendar component
- Create drag & drop UI
- Create ScheduleCard component

**Cursor Max:**
- Integrate all components
- Test full flow
- Fix bugs

---

### Arbetsorder (Dag 2)

**Perplexity Pro:**
- Research work order patterns
- Research status transition best practices
- Research push notification setup

**GPT-5:**
- Design work_orders schema
- Write status transition logic
- Write notification triggers

**Gemini 2.5:**
- Create WorkOrderCard
- Create WorkOrderList
- Create mobile-optimized views

**Cursor Max:**
- Integrate & test
- Setup push notifications

---

### Offline-stöd (Dag 3)

**Perplexity Pro:**
- Research Service Worker patterns
- Research IndexedDB best practices
- Research sync conflict resolution

**GPT-5:**
- Write Service Worker code
- Write sync algorithms
- Write conflict resolution logic

**Gemini 2.5:**
- Create offline UI indicators
- Create sync progress UI
- Create offline banner

**Cursor Max:**
- Integrate & test offline scenarios

---

### Fortnox/Visma (Dag 4)

**Perplexity Pro:**
- Research Fortnox API documentation
- Research Visma API documentation
- Find authentication examples
- Find sync best practices

**GPT-5:**
- Write Fortnox API client
- Write Visma API client
- Write sync logic
- Write error handling

**Gemini 2.5:**
- Create integration settings UI
- Create connection flow
- Create sync status display

**Cursor Max:**
- Integrate & test with real APIs

---

## 📋 Notion Template: Daily Task List

```
# Dag X: [Feature Name]

## Morning Planning (08:00-09:00)
- [ ] Review tasks
- [ ] Research features
- [ ] Setup architecture

## Backend Development (09:00-12:00)
- [ ] SQL migration
- [ ] API endpoints
- [ ] Business logic
- [ ] Error handling

## Frontend Development (13:00-17:00)
- [ ] UI components
- [ ] Styling
- [ ] Responsive design
- [ ] Integration

## Polish & Commit (18:00-20:00)
- [ ] Integration testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Git commit

## Issues Found
- [Issue 1]: [Solution]
- [Issue 2]: [Solution]

## Tomorrow's Plan
- [Task 1]
- [Task 2]
```

---

## 🔧 Optimization Strategies

### 1. **Parallel Backend + Frontend**
```
Backend (GPT-5 + Cursor):
├── API endpoints
├── Database logic
└── Business rules

Frontend (Gemini + Copilot):
├── UI components
├── Styling
└── Interactions

Research (Perplexity):
└── Next features

Docs (Notion):
└── Progress tracking
```

### 2. **Code Review Pipeline**
```
GPT-5 writes → Cursor reviews → Gemini polishes → Copilot assists → Commit
```

### 3. **Context Sharing**
- **Notion Pro:** Master document
- **Share Notion links** med AIs
- **Update Notion** efter varje decision

### 4. **Error Prevention**
- **Test early:** Testa direkt efter implementation
- **Small commits:** Commit varje feature
- **Document issues:** Notion Pro för tracking

---

## 🚀 Quick Reference: AI Prompts

### GPT-5 (Complex Logic)
```
"Write [feature] with:
- [requirements]
- Context: [code snippets]
- Pattern: [existing pattern]
- Make it production-ready"
```

### Gemini 2.5 (UI Components)
```
"Create [component] with:
- [features]
- Design: [design system]
- Reference: [existing components]
- Make it clean & simple"
```

### Perplexity Pro (Research)
```
"Research [topic]:
- Best practices
- API docs
- Code examples
- Pitfalls
- Provide summary + examples"
```

### Cursor Max (Integration)
```
"Integrate [code]:
- Review & fix
- Match codebase style
- Add types
- Test
- Make production-ready"
```

---

## ✅ Pre-Flight Checklist

### Before Starting
- [ ] Cursor Max activated
- [ ] Notion workspace created
- [ ] Daily templates ready
- [ ] All AIs accessible
- [ ] Git repo clean
- [ ] SQL migrations ready (Phase 1)

### Each Day
- [ ] Morning planning (Notion + Perplexity)
- [ ] Backend sprint (GPT-5 + Cursor)
- [ ] Frontend sprint (Gemini + Copilot)
- [ ] Integration (Cursor)
- [ ] Documentation (Notion)
- [ ] Git commit

### Each Feature
- [ ] Research (Perplexity)
- [ ] Backend (GPT-5)
- [ ] Frontend (Gemini)
- [ ] Integration (Cursor)
- [ ] Testing
- [ ] Documentation (Notion)

---

## 🎯 Success Metrics

### Daily
- ✅ 12h produktivt arbete
- ✅ 1 major feature komplett
- ✅ 0 critical bugs
- ✅ All code committed

### Weekly
- ✅ 7 features kompletta
- ✅ 100% match Bygglet
- ✅ Alla unique features
- ✅ Production-ready

---

## 🚀 LET'S GO!

**När du har Cursor Max:**
1. ✅ Setup Notion (30 min)
2. ✅ Börja Dag 1: Resursplanering
3. ✅ Följ daily workflow
4. ✅ Commit varje dag

**Vi kommer att bygga världens bästa bygg-projektverktyg på 1 vecka med 6 AI-assistenter! 🚀**

